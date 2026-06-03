'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Trash2, ChevronDown, Search, RefreshCw } from 'lucide-react';
import { Tower, UnitMixEntry, towersService } from '@/services/towers.service';
import { propertiesService } from '@/services/properties.service';
import { flatsService } from '@/services/flats.service';
import { parseApiError } from '@/utils/error-handler';

interface TowerFlat { id: string; flatNumber: string; floor: number; displayOrder: number; }

interface LocalMixEntry {
  selectedFlatNumbers: string[];
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  superBuiltUpArea?: number;
  builtUpArea?: number;
  carpetArea?: number;
  basePrice?: number;
}

// Mirrors backend extractUnitPosition — must stay in sync with flat-generation.util.ts
const flatNumToUnitPos = (fn: string): number => {
  const hyphenMatch = fn.match(/-(\d+)$/);
  const digits = hyphenMatch ? hyphenMatch[1] : fn.match(/(\d+)$/)?.[1];
  if (!digits) return 0;
  const pos = parseInt(digits.slice(-2), 10);
  return Number.isFinite(pos) && pos > 0 ? pos : 0;
};

// Mirrors backend generateFlatNumber — must stay in sync with flat-generation.util.ts
const previewFlatNumber = (towerNumber: string, floor: number, unit: number, prefix?: string | null): string => {
  const f = floor.toString().padStart(2, '0');
  const u = unit.toString().padStart(2, '0');
  if (prefix) return `${prefix}${f}${u}`;
  return `${towerNumber.replace(/\s+/g, '').toUpperCase()}-${f}${u}`;
};

// Mirrors backend parseUnitsPerFloor: first integer from the text, fallback to Math.ceil
const parseUnitsPerFloor = (text: string | undefined, fallback: number): number => {
  if (text) { const m = text.match(/\d+/); if (m) return Math.max(parseInt(m[0], 10), 1); }
  return Math.max(fallback, 1);
};

const buildPreviewFlats = (
  towerNumber: string,
  prefix: string | null | undefined,
  totalFloors: number,
  totalUnits: number,
  unitsPerFloorText?: string,
): TowerFlat[] => {
  const floors = Math.max(totalFloors || 1, 1);
  const units = Math.max(totalUnits || 1, 1);
  const unitsPerFloor = parseUnitsPerFloor(unitsPerFloorText, Math.ceil(units / floors));
  const flats: TowerFlat[] = [];
  let order = 1;
  for (let f = 1; f <= floors && flats.length < units; f++) {
    for (let u = 1; u <= unitsPerFloor && flats.length < units; u++) {
      const fn = previewFlatNumber(towerNumber || 'T', f, u, prefix);
      flats.push({ id: `preview-${f}-${u}`, flatNumber: fn, floor: f, displayOrder: order++ });
    }
  }
  return flats;
};

const displayNum = (fn: string): string => {
  const m = fn.match(/-(\d+)$/);
  return m ? String(parseInt(m[1], 10)) : fn;
};

const localToUnitMix = (entries: LocalMixEntry[]): UnitMixEntry[] =>
  entries
    .filter(e => e.selectedFlatNumbers.length > 0)
    .map(({ selectedFlatNumbers, ...rest }) => ({
      ...rest,
      unitPositions: [...new Set(selectedFlatNumbers.map(flatNumToUnitPos).filter(p => p > 0))].sort((a, b) => a - b),
    }));

const FLAT_TYPE_OPTIONS = [
  { value: 'STUDIO', label: 'Studio' },
  { value: '1BHK', label: '1 BHK' },
  { value: '2BHK', label: '2 BHK' },
  { value: '3BHK', label: '3 BHK' },
  { value: '4BHK', label: '4 BHK' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'VILLA', label: 'Villa' },
];

interface TowerFormProps {
  tower?: Tower | null;
  onSubmit: (data: Partial<Tower>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Tower Form Component
 * 
 * Universal form for creating and editing towers.
 * Follows Eastern Estate brand guidelines.
 * 
 * Features:
 * - Create new towers
 * - Edit existing towers
 * - Comprehensive validation
 * - Property selection
 * - Construction status tracking
 * - Vastu compliance
 * - Eastern Estate branding
 */
export function TowerForm({ tower, onSubmit, onCancel }: TowerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<any[]>([]);
  const [localMix, setLocalMix] = useState<LocalMixEntry[]>(
    (tower?.unitMix ?? []).map(e => ({ ...e, selectedFlatNumbers: [] }))
  );
  const [allFlats, setAllFlats] = useState<TowerFlat[]>([]);
  const [flatLoadError, setFlatLoadError] = useState(false);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  // Per-group search state — keyed by group index (L-6 fix)
  const [dropdownSearch, setDropdownSearch] = useState<Record<number, string>>({});
  const [fillingFlats, setFillingFlats] = useState(false);
  const [fillResult, setFillResult] = useState<{ msg: string; ok: boolean } | null>(null);
  // True once selectedFlatNumbers are populated from the DB — false until then in edit mode
  const [mixReady, setMixReady] = useState(!tower?.id);
  const initializedRef = useRef(false);

  const [formData, setFormData] = useState<Partial<Tower>>({
    name: tower?.name || '',
    towerNumber: tower?.towerNumber || '',
    towerCode: tower?.towerCode || '',
    description: tower?.description || '',
    propertyId: tower?.propertyId || '',
    totalFloors: tower?.totalFloors || 1,
    totalUnits: tower?.totalUnits || 1,
    basementLevels: tower?.basementLevels ?? 0,
    unitsPerFloor: tower?.unitsPerFloor || '',
    constructionStatus: tower?.constructionStatus || 'PLANNED',
    constructionStartDate: tower?.constructionStartDate?.split('T')[0] || '',
    completionDate: tower?.completionDate?.split('T')[0] || '',
    reraNumber: tower?.reraNumber || '',
    builtUpArea: tower?.builtUpArea ?? undefined,
    carpetArea: tower?.carpetArea ?? undefined,
    defaultSuperBuiltUpArea: tower?.defaultSuperBuiltUpArea ?? undefined,
    defaultBuiltUpArea: tower?.defaultBuiltUpArea ?? undefined,
    defaultCarpetArea: tower?.defaultCarpetArea ?? undefined,
    flatNumberPrefix: tower?.flatNumberPrefix ?? '',
    ceilingHeight: tower?.ceilingHeight ?? undefined,
    numberOfLifts: tower?.numberOfLifts ?? 1,
    vastuCompliant: tower?.vastuCompliant ?? true,
    facing: tower?.facing || '',
    specialFeatures: tower?.specialFeatures || '',
    displayOrder: tower?.displayOrder ?? 0,
    regenerateFlats: false,
  });

  // In edit mode: real flats from API. In create mode: computed from form fields (live preview).
  const displayFlats: TowerFlat[] = tower?.id
    ? allFlats
    : buildPreviewFlats(
        formData.towerNumber || 'T',
        formData.flatNumberPrefix || null,
        formData.totalFloors || 1,
        formData.totalUnits || 1,
        formData.unitsPerFloor || undefined,
      );

  useEffect(() => { fetchProperties(); }, []);

  // Stable identity so the fetch effect can list it as a dep without re-subscribing on every render
  const loadFlats = useCallback((towerId: string) =>
    flatsService.getFlatsByTower(towerId, { forceRefresh: true })
      .then(flats => {
        setFlatLoadError(false);
        setAllFlats([...flats].sort((a, b) => a.floor - b.floor || (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
        if (!flats.length) setMixReady(true); // no flats → init effect never fires; unblock here
      })
      .catch(() => {
        setFlatLoadError(true);
        setMixReady(true); // unblock on API error so user can still save other fields
      }),
  []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch flats when tower changes; reset stale init state first (B-1 fix)
  useEffect(() => {
    if (!tower?.id) return;
    initializedRef.current = false; // reset so init effect fires fresh for this tower
    setMixReady(false);
    setAllFlats([]);
    loadFlats(tower.id);
  }, [tower?.id, loadFlats]);

  // Populate selectedFlatNumbers from saved unitPositions once flats arrive (B-5 fix)
  // tower.unitMix in deps catches the case where the parent updates unitMix after a save
  useEffect(() => {
    if (!allFlats.length || initializedRef.current) return;
    if (tower?.unitMix?.length) {
      const minFloor = Math.min(...allFlats.map(f => f.floor));
      const floor1 = allFlats
        .filter(f => f.floor === minFloor)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      setLocalMix(tower.unitMix.map(e => ({
        type: e.type, bedrooms: e.bedrooms, bathrooms: e.bathrooms, balconies: e.balconies,
        superBuiltUpArea: e.superBuiltUpArea, builtUpArea: e.builtUpArea,
        carpetArea: e.carpetArea, basePrice: e.basePrice,
        selectedFlatNumbers: e.unitPositions.map(p => floor1[p - 1]?.flatNumber).filter(Boolean) as string[],
      })));
    }
    initializedRef.current = true;
    setMixReady(true);
  }, [allFlats, tower?.unitMix]);

  // Close dropdown on outside click
  useEffect(() => {
    if (openDropdownIdx === null) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-unit-mix-dropdown]')) {
        setOpenDropdownIdx(null);
        setDropdownSearch({});
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdownIdx]);

  const fetchProperties = async () => {
    try {
      // M-8: cap at 200 so the dropdown doesn't stall on large portfolios
      const response = await propertiesService.getProperties({ limit: 200 });
      setProperties(response.data);
    } catch (err) { console.error('Error fetching properties:', err); }
  };

  const addMixEntry = () =>
    setLocalMix([...localMix, { selectedFlatNumbers: [], type: '2BHK' }]);

  const removeMixEntry = (idx: number) =>
    setLocalMix(localMix.filter((_, i) => i !== idx));

  const updateMixEntry = (idx: number, updates: Partial<LocalMixEntry>) =>
    setLocalMix(localMix.map((e, i) => (i === idx ? { ...e, ...updates } : e)));

  const toggleFlat = (groupIdx: number, flatNumber: string) => {
    const pos = flatNumToUnitPos(flatNumber);
    setLocalMix(localMix.map((entry, i) => {
      if (i === groupIdx) {
        const has = entry.selectedFlatNumbers.includes(flatNumber);
        return {
          ...entry,
          selectedFlatNumbers: has
            ? entry.selectedFlatNumbers.filter(fn => fn !== flatNumber)
            : [...entry.selectedFlatNumbers, flatNumber],
        };
      }
      // Only remove matching position from other groups when position is valid (H-5 fix)
      if (pos <= 0) return entry;
      return { ...entry, selectedFlatNumbers: entry.selectedFlatNumbers.filter(fn => flatNumToUnitPos(fn) !== pos) };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.name) newErrors.name = 'Tower name is required';
    if (!formData.towerNumber) newErrors.towerNumber = 'Tower number/code is required';
    if (!formData.totalFloors || formData.totalFloors < 1) newErrors.totalFloors = 'Total floors must be at least 1';
    if (!formData.totalUnits || formData.totalUnits < 1) newErrors.totalUnits = 'Total units must be at least 1';

    // Warn if any group has specs filled in but no flat numbers selected — those would be silently dropped. (Issue 3 fix)
    const incompleteGroups = localMix
      .map((e, i) => ({ e, i }))
      .filter(({ e }) =>
        e.selectedFlatNumbers.length === 0 && (
          e.type !== '2BHK' ||
          e.bedrooms !== undefined || e.bathrooms !== undefined || e.balconies !== undefined ||
          (e.superBuiltUpArea ?? 0) > 0 || (e.builtUpArea ?? 0) > 0 ||
          (e.carpetArea ?? 0) > 0 || (e.basePrice ?? 0) > 0
        )
      );
    if (incompleteGroups.length > 0) {
      const nums = incompleteGroups.map(({ i }) => `Group ${i + 1}`).join(', ');
      setError(`${nums} ${incompleteGroups.length > 1 ? 'have' : 'has'} specs set but no flat numbers selected. Please select flat numbers or remove the group.`);
      return;
    }

    if (Object.keys(newErrors).length) {
      setFieldErrors(newErrors);
      setError('Please fix the highlighted fields.');
      return;
    }
    setFieldErrors({});

    try {
      setLoading(true);
      setError('');
      const towerNumber = (formData.towerNumber ?? '').trim();
      await onSubmit({
        ...formData,
        towerNumber,
        towerCode: (formData.towerCode ?? towerNumber).trim(),
        totalFloors: Math.max(formData.totalFloors ?? 1, 1),
        totalUnits: Math.max(formData.totalUnits ?? 1, 1),
        numberOfLifts: Math.max(formData.numberOfLifts ?? 1, 1),
        // Only include unitMix once flats have loaded and selections are initialized.
        // Omitting the key entirely preserves the existing DB value (B-5 fix).
        ...(mixReady && { unitMix: localMix.length > 0 ? localToUnitMix(localMix) : undefined }),
      });
    } catch (err: any) {
      const { title, details } = parseApiError(err);
      const msg = details.length ? `${title}\n• ${details.join('\n• ')}` : title;
      setError(msg || 'Failed to save tower');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      fieldErrors[field] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ backgroundColor: '#FEF3E2' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
            {tower ? 'Edit Tower' : 'Add New Tower'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-6 w-6" style={{ color: '#A8211B' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tower Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClass('name')}
                placeholder="Diamond Tower A"
              />
              {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tower Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="towerNumber"
                value={formData.towerNumber}
                onChange={handleChange}
                required
                className={inputClass('towerNumber')}
                placeholder="T1"
              />
              {fieldErrors.towerNumber && <p className="mt-1 text-sm text-red-600">{fieldErrors.towerNumber}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                disabled={!!tower}
                className={`${inputClass('propertyId')} disabled:bg-gray-100`}
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.city}
                  </option>
                ))}
              </select>
              {fieldErrors.propertyId && <p className="mt-1 text-sm text-red-600">{fieldErrors.propertyId}</p>}
              {tower && (
                <p className="text-sm text-gray-500 mt-1">
                  Property cannot be changed after tower creation
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="Premium residential tower with 2BHK and 3BHK apartments"
              />
            </div>

            {/* Tower Specifications */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Tower Specifications
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Total Floors <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalFloors"
                value={formData.totalFloors}
                onChange={handleChange}
                required
                min="1"
                className={inputClass('totalFloors')}
              />
              {fieldErrors.totalFloors && <p className="mt-1 text-sm text-red-600">{fieldErrors.totalFloors}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Total Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalUnits"
                value={formData.totalUnits}
                onChange={handleChange}
                required
                min="1"
                className={inputClass('totalUnits')}
              />
              {fieldErrors.totalUnits && <p className="mt-1 text-sm text-red-600">{fieldErrors.totalUnits}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Basement Levels</label>
              <input
                type="number"
                name="basementLevels"
                value={formData.basementLevels}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Lifts <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="numberOfLifts"
                value={formData.numberOfLifts}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Units Per Floor</label>
              <input
                type="text"
                name="unitsPerFloor"
                value={formData.unitsPerFloor}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="4 units per floor (2BHK + 3BHK)"
              />
            </div>

            {tower && (
              <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="regenerateFlats"
                    checked={!!formData.regenerateFlats}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded"
                    style={{ accentColor: '#A8211B' }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Regenerate flats with updated counts</p>
                    <p className="text-xs text-amber-700">
                      Rebuilds flat numbering based on total floors/units and units-per-floor. This will fail if any units are booked,
                      blocked, on hold, or sold to prevent data loss.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Unit Mix */}
            <div className="md:col-span-2 mt-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold" style={{ color: '#7B1E12' }}>Unit Mix</h3>
                <button type="button" onClick={addMixEntry}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#FEF3E2', color: '#A8211B', border: '1px solid #A8211B' }}>
                  <Plus className="h-4 w-4" /> Add group
                </button>
              </div>

              {flatLoadError ? (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                  Failed to load flat list. Check your connection and reload the page.
                </div>
              ) : !mixReady ? (
                <p className="text-sm text-gray-400 italic">Loading flats…</p>
              ) : (
                <>
                  {/* Flat count banner */}
                  <div className="mb-4 p-3 rounded-lg border border-gray-200 bg-white text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {tower?.id ? (
                          <>
                            <span className="font-semibold text-gray-700">{allFlats.length} flats in database</span>
                            {tower?.totalUnits && allFlats.length >= tower.totalUnits && (
                              <span className="text-green-600 text-xs">✓ All {tower.totalUnits} expected flats present</span>
                            )}
                            {tower?.totalUnits && allFlats.length < tower.totalUnits && (
                              <span className="text-amber-600 text-xs">
                                ⚠ {tower.totalUnits - allFlats.length} of {tower.totalUnits} missing
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            Preview — {displayFlats.length} flat{displayFlats.length !== 1 ? 's' : ''} will be generated based on your specs above
                          </span>
                        )}
                      </div>
                      {tower?.id && tower?.totalUnits && allFlats.length < tower.totalUnits && (
                        <button
                          type="button"
                          disabled={fillingFlats}
                          onClick={async () => {
                            setFillingFlats(true);
                            setFillResult(null);
                            try {
                              const result = await towersService.fillMissingFlats(tower.id);
                              setFillResult({ msg: `✓ ${result.created} flat${result.created !== 1 ? 's' : ''} added`, ok: true });
                              initializedRef.current = false;
                              setMixReady(false);
                              await loadFlats(tower.id);
                            } catch {
                              setFillResult({ msg: 'Failed to fill flats — try saving the tower first', ok: false });
                            } finally {
                              setFillingFlats(false);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#FEF3E2', color: '#A8211B', border: '1px solid #A8211B' }}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${fillingFlats ? 'animate-spin' : ''}`} />
                          {fillingFlats ? 'Adding…' : `Fill ${tower.totalUnits - allFlats.length} missing flats`}
                        </button>
                      )}
                    </div>
                    {fillResult && (
                      <p className={`mt-1.5 text-xs ${fillResult.ok ? 'text-green-600' : 'text-red-600'}`}>{fillResult.msg}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    {tower?.id
                      ? <>Select flat numbers for each group. Selecting a flat from one floor represents that unit slot on <strong>every floor</strong> — e.g. selecting 401 also applies to 101, 201, 301…</>
                      : <>Preview flat numbers are based on your tower specs above. Selecting a flat from one floor represents that unit slot on <strong>every floor</strong> when flats are generated.</>
                    }
                  </p>

                  {localMix.length === 0 && (
                    <p className="text-sm text-gray-400 italic mb-2">No groups yet — click "Add group" to start.</p>
                  )}

                  <div className="space-y-3">
                    {localMix.map((entry, idx) => {
                      const unitPositions = [...new Set(entry.selectedFlatNumbers.map(flatNumToUnitPos).filter(p => p > 0))];
                      const coveredCount = displayFlats.filter(f => unitPositions.includes(flatNumToUnitPos(f.flatNumber))).length;
                      const takenPositions = new Set(
                        localMix.flatMap((e, i) => i !== idx ? e.selectedFlatNumbers.map(flatNumToUnitPos) : [])
                      );
                      const floorGroups = displayFlats.reduce<Record<number, TowerFlat[]>>((acc, f) => {
                        (acc[f.floor] ??= []).push(f);
                        return acc;
                      }, {});
                      const filteredFloors = Object.entries(floorGroups).map(([floor, flats]) => ({
                        floor: Number(floor),
                        flats: flats.filter(f => !dropdownSearch[idx] || displayNum(f.flatNumber).includes(dropdownSearch[idx])),
                      })).filter(g => g.flats.length > 0);

                      return (
                        <div key={idx} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-700">Group {idx + 1}</span>
                            <button type="button" onClick={() => removeMixEntry(idx)} className="p-1 rounded hover:bg-red-50">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>

                          {/* Multi-select dropdown */}
                          <div className="mb-3 relative" data-unit-mix-dropdown>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Select flat numbers</label>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
                                setDropdownSearch(prev => ({ ...prev, [idx]: '' }));
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                              <span className={entry.selectedFlatNumbers.length ? 'text-gray-800' : 'text-gray-400'}>
                                {entry.selectedFlatNumbers.length
                                  ? entry.selectedFlatNumbers.map(displayNum).join(', ')
                                  : 'Select flat numbers…'}
                              </span>
                              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                            </button>

                            {openDropdownIdx === idx && (
                              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl">
                                <div className="p-2 border-b flex items-center gap-2">
                                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search flat number…"
                                    value={dropdownSearch[idx] ?? ''}
                                    onChange={e => setDropdownSearch(prev => ({ ...prev, [idx]: e.target.value }))}
                                    className="flex-1 text-sm outline-none"
                                  />
                                </div>
                                <div className="overflow-y-auto max-h-56">
                                  {filteredFloors.map(({ floor, flats }) => (
                                    <div key={floor}>
                                      <div className="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50 sticky top-0">
                                        Floor {floor}
                                      </div>
                                      <div className="grid grid-cols-4 gap-0">
                                        {flats.map(flat => {
                                          const isSelected = entry.selectedFlatNumbers.includes(flat.flatNumber);
                                          const posTaken = !isSelected && takenPositions.has(flatNumToUnitPos(flat.flatNumber));
                                          return (
                                            <label
                                              key={flat.id}
                                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                                              style={{ opacity: posTaken ? 0.4 : 1 }}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleFlat(idx, flat.flatNumber)}
                                                className="rounded"
                                                style={{ accentColor: '#A8211B' }}
                                              />
                                              <span className="text-sm text-gray-700">{displayNum(flat.flatNumber)}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.selectedFlatNumbers.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                {entry.selectedFlatNumbers.length} selected → applies to {coveredCount} flat{coveredCount !== 1 ? 's' : ''} across all floors
                              </p>
                            )}
                          </div>

                          {/* Type + specs */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Flat Type</label>
                              <select value={entry.type} onChange={e => updateMixEntry(idx, { type: e.target.value })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200">
                                {FLAT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Bedrooms</label>
                              <input type="number" min="0" max="10" placeholder="2" value={entry.bedrooms ?? ''}
                                onChange={e => updateMixEntry(idx, { bedrooms: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Bathrooms</label>
                              <input type="number" min="0" max="10" placeholder="2" value={entry.bathrooms ?? ''}
                                onChange={e => updateMixEntry(idx, { bathrooms: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Balconies</label>
                              <input type="number" min="0" max="10" placeholder="1" value={entry.balconies ?? ''}
                                onChange={e => updateMixEntry(idx, { balconies: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Super BUA (sq.ft)</label>
                              <input type="number" min="0" placeholder="1450" value={entry.superBuiltUpArea ?? ''}
                                onChange={e => updateMixEntry(idx, { superBuiltUpArea: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Built-up (sq.ft)</label>
                              <input type="number" min="0" placeholder="1200" value={entry.builtUpArea ?? ''}
                                onChange={e => updateMixEntry(idx, { builtUpArea: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Carpet (sq.ft)</label>
                              <input type="number" min="0" placeholder="1050" value={entry.carpetArea ?? ''}
                                onChange={e => updateMixEntry(idx, { carpetArea: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Base Price (₹)</label>
                              <input type="number" min="0" placeholder="optional" value={entry.basePrice ?? ''}
                                onChange={e => updateMixEntry(idx, { basePrice: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Construction Details */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Construction Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Construction Status</label>
              <select
                name="constructionStatus"
                value={formData.constructionStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="PLANNED">Planned</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="COMPLETED">Completed</option>
                <option value="READY_TO_MOVE">Ready to Move</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">RERA Number</label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="RERA/OR/2024/12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Construction Start Date</label>
              <input
                type="date"
                name="constructionStartDate"
                value={formData.constructionStartDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            {/* Additional Details */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B1E12' }}>
                Additional Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Built-up Area (sq.ft)</label>
              <input
                type="number"
                name="builtUpArea"
                value={formData.builtUpArea || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Carpet Area (sq.ft)</label>
              <input
                type="number"
                name="carpetArea"
                value={formData.carpetArea || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div className="md:col-span-2 mt-2">
              <p className="text-sm font-semibold mb-2" style={{ color: '#7B1E12' }}>
                Per-unit defaults (applied when adding flats in this block)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Super Built-up (sq.ft)</label>
              <input
                type="number"
                name="defaultSuperBuiltUpArea"
                value={formData.defaultSuperBuiltUpArea ?? ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="e.g. 1450"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Built-up (sq.ft)</label>
              <input
                type="number"
                name="defaultBuiltUpArea"
                value={formData.defaultBuiltUpArea ?? ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="e.g. 1200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Carpet (sq.ft)</label>
              <input
                type="number"
                name="defaultCarpetArea"
                value={formData.defaultCarpetArea ?? ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="e.g. 1050"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Flat Number Prefix</label>
              <input
                type="text"
                name="flatNumberPrefix"
                value={formData.flatNumberPrefix || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="e.g. A- (units become A-101, A-201…)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ceiling Height (ft)</label>
              <input
                type="number"
                name="ceilingHeight"
                value={formData.ceilingHeight || ''}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Facing Direction</label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="">Select Direction</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="vastuCompliant"
                checked={formData.vastuCompliant}
                onChange={handleChange}
                className="w-5 h-5 rounded"
                style={{ accentColor: '#A8211B' }}
              />
              <label className="text-sm font-medium">Vastu Compliant</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Special Features</label>
              <textarea
                name="specialFeatures"
                value={formData.specialFeatures}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="Premium corner units with city views"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border rounded-lg font-medium transition-colors"
              style={{ borderColor: '#A8211B', color: '#A8211B' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !mixReady}
              title={!mixReady ? 'Loading flat data…' : undefined}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#A8211B', color: 'white' }}
            >
              {loading ? 'Saving…' : !mixReady ? 'Loading…' : tower ? 'Update Tower' : 'Create Tower'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
