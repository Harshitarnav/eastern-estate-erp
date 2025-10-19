'use client';

import { useCallback, useEffect, useMemo, useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronRight,
  Plus,
  Sparkles,
  AlertTriangle,
  Layers,
  Target,
  Loader2,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  propertiesService,
  Property,
  PropertyInventorySummary,
  TowerInventorySummary,
  FlatSalesBreakdown,
} from '@/services/properties.service';
import { towersService, Tower, TowerBulkImportSummary } from '@/services/towers.service';
import { TowerForm } from '@/components/forms/TowerForm';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';


const completenessBadgeStyles: Record<string, { label: string; bg: string; border: string; text: string }> = {
  NOT_STARTED: {
    label: 'Not started',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
  },
  IN_PROGRESS: {
    label: 'In progress',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  NEEDS_REVIEW: {
    label: 'Needs review',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
  },
  COMPLETE: {
    label: 'Complete',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
};

const SALES_ORDER: Array<keyof FlatSalesBreakdown> = [
  'available',
  'booked',
  'sold',
  'onHold',
  'blocked',
  'underConstruction',
];

export default function TowersInventoryPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [summary, setSummary] = useState<PropertyInventorySummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await propertiesService.getProperties({ limit: 50, isActive: true, sortBy: 'name', sortOrder: 'ASC' });
        setProperties(response.data ?? []);
        if ((response.data?.length ?? 0) > 0) {
          setSelectedPropertyId(response.data![0].id);
        }
      } catch (err: any) {
        console.error('Failed to load properties', err);
        setError(err?.response?.data?.message ?? 'Unable to load properties');
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const refreshSummary = useCallback(
    async (propertyId?: string | null) => {
      const targetId = propertyId ?? selectedPropertyId;
      if (!targetId) {
        setSummary(null);
        return;
      }
      try {
        setLoadingSummary(true);
        setError(null);
        const data = await propertiesService.getInventorySummary(targetId);
        setSummary(data);
      } catch (err: any) {
        console.error('Failed to load inventory summary', err);
        setError(err?.response?.data?.message ?? 'Unable to load tower inventory');
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    },
    [selectedPropertyId],
  );

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  const headerStats = useMemo(() => {
    if (!summary) {
      return null;
    }

    const completenessPercent = Math.round(summary.dataCompletionPct ?? 0);

    return {
      completenessPercent,
      towersText: `${formatIndianNumber(summary.towersDefined)} defined · ${formatIndianNumber(summary.missingTowers)} missing`,
      unitsText: `${formatIndianNumber(summary.unitsDefined)} defined · ${formatIndianNumber(summary.missingUnits)} missing`,
    };
  }, [summary]);

  const handlePropertyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPropertyId(event.target.value);
  };

  const handleOpenUnits = async (tower: TowerInventorySummary) => {
    router.push(`/flats?towerId=${tower.id}`);
  };

  const handleCreateTower = async (payload: Partial<Tower>) => {
    const propertyId = payload.propertyId ?? selectedPropertyId ?? '';
    if (!propertyId) {
      throw new Error('Please select a property before creating a tower.');
    }

    try {
      await towersService.createTower({ ...payload, propertyId });
      setShowCreateForm(false);
      await refreshSummary(propertyId);
    } catch (error) {
      console.error('Failed to create tower', error);
      throw error;
    }
  };

  const renderSalesBar = (breakdown: FlatSalesBreakdown) => {
    if (!breakdown?.total) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Define units to start tracking sales.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
          {SALES_ORDER.map((key) => {
            const value = breakdown[key] ?? 0;
            if (!value) return null;
            const width = Math.max((value / breakdown.total) * 100, 2);
            const color = getSalesColor(key);
            return (
              <div
                key={key}
                className="transition-all"
                style={{ width: `${width}%`, backgroundColor: color }}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {SALES_ORDER.map((key) => {
            const value = breakdown[key] ?? 0;
            if (!value) return null;
            return (
              <div key={key} className="flex items-center gap-1 text-gray-600">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: getSalesColor(key) }}
                />
                <span className="font-medium">{formatSalesLabel(key)}</span>
                <span>· {formatIndianNumber(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTowerCard = (tower: TowerInventorySummary) => {
    const badge = completenessBadgeStyles[tower.dataCompletenessStatus] ?? completenessBadgeStyles.IN_PROGRESS;
    const completion = Math.round(tower.dataCompletionPct ?? 0);

    return (
      <div
        key={tower.id}
        className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Building2 className="h-4 w-4" />
              <span>{tower.towerNumber}</span>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-gray-900">{tower.name}</h3>
          </div>
          <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
            {badge.label}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ProgressRing value={completion} />
          <div className="grid gap-1 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{completion}% data complete</span>
            <span>
              Units: {formatIndianNumber(tower.unitsDefined)} / {formatIndianNumber(tower.unitsPlanned || tower.totalUnits)}
            </span>
            <span className="text-rose-600">
              {tower.missingUnits > 0
                ? `${formatIndianNumber(tower.missingUnits)} units pending`
                : 'All planned units defined'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="rounded-2xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Layers className="h-3.5 w-3.5" /> Floors
            </div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{tower.totalFloors}</div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Target className="h-3.5 w-3.5" /> Issues
            </div>
            <div className={`mt-1 text-lg font-semibold ${tower.issuesCount ? 'text-orange-600' : 'text-emerald-600'}`}>
              {tower.issuesCount}
            </div>
          </div>
        </div>

        <div>{renderSalesBar(tower.salesBreakdown)}</div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenUnits(tower)}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            Open Units
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/flats/new?towerId=${tower.id}`)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
          >
            Add Missing Units
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderMissingCard = (missingCount: number) => (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-amber-900">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          {missingCount} towers pending setup
        </div>
        <h3 className="text-xl font-semibold">Bring your planned towers to life</h3>
        <p className="text-sm text-amber-800">
          Start the tower wizard to auto-generate floors and unit stacks with your bestselling templates.
        </p>
      </div>
      <BrandPrimaryButton onClick={() => setShowCreateForm(true)}>
        <Plus className="h-4 w-4" /> Add Missing Towers
      </BrandPrimaryButton>
    </div>
  );

  return (
    <div className="space-y-8 p-6 md:p-8" style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}>
      <BrandHero
        eyebrow="Property Inventory"
        title={
          <>
            Towers curated for <span style={{ color: brandPalette.accent }}>life-long bonding</span>
          </>
        }
        description="Check which towers are launch ready, chase down missing data, and keep every project marching toward handover."
        actions={
          <>
            <BrandPrimaryButton onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4" /> Add Tower
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => setShowBulkModal(true)}>
              <FileSpreadsheet className="h-4 w-4" /> Bulk Import Towers
            </BrandSecondaryButton>
          </>
        }
      />

      <section className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Property scope</label>
            <select
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-gray-300 focus:outline-none sm:w-72"
              value={selectedPropertyId ?? ''}
              onChange={handlePropertyChange}
              disabled={loadingProperties || properties.length === 0}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">
            {summary ? `Last updated ${new Date(summary.generatedAt).toLocaleString()}` : 'Select a property to begin.'}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loadingSummary ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Refreshing tower readiness…
          </div>
        ) : summary && headerStats ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <BrandStatCard
              title="Data readiness"
              primary={`${headerStats.completenessPercent}%`}
              subLabel={`${summary.towersCompleteness.complete} complete · ${summary.towersCompleteness.inProgress} in progress`}
              icon={<Building2 className="h-6 w-6" />}
              accentColor="rgba(168, 33, 27, 0.18)"
            />
            <BrandStatCard
              title="Towers"
              primary={headerStats.towersText.split(' · ')[0]}
              subLabel={headerStats.towersText.split(' · ')[1] ?? ''}
              icon={<Layers className="h-6 w-6" />}
              accentColor="rgba(61, 163, 93, 0.18)"
            />
            <BrandStatCard
              title="Units"
              primary={headerStats.unitsText.split(' · ')[0]}
              subLabel={headerStats.unitsText.split(' · ')[1] ?? ''}
              icon={<Target className="h-6 w-6" />}
              accentColor="rgba(242, 201, 76, 0.25)"
            />
          </div>
        ) : null}
      </section>

      {loadingSummary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-3xl border border-gray-200 bg-white/60" />
          ))}
        </div>
      ) : summary && summary.towers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.towers.map(renderTowerCard)}
          {summary.missingTowers > 0 && renderMissingCard(summary.missingTowers)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-white/70 p-10 text-center text-gray-600">
          <Sparkles className="h-10 w-10 text-rose-500" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">No towers defined yet</h3>
            <p className="text-sm">
              Start by adding your planned towers, then auto-generate units with our wizard.
            </p>
          </div>
          <BrandPrimaryButton onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" /> Add your first tower
          </BrandPrimaryButton>
        </div>
      )}

      {showCreateForm && (
        <TowerForm tower={null} onCancel={() => setShowCreateForm(false)} onSubmit={handleCreateTower} />
      )}

      {showBulkModal && (
        <BulkImportModal
          onClose={() => setShowBulkModal(false)}
          propertyId={selectedPropertyId}
          propertyName={properties.find((p) => p.id === selectedPropertyId)?.name}
          onImported={() => refreshSummary()}
        />
      )}
    </div>
  );
}

function getSalesColor(key: keyof FlatSalesBreakdown): string {
  switch (key) {
    case 'available':
      return '#3DA35D';
    case 'booked':
      return '#F59E0B';
    case 'sold':
      return '#2563EB';
    case 'onHold':
      return '#9333EA';
    case 'blocked':
      return '#F97316';
    case 'underConstruction':
    default:
      return '#94A3B8';
  }
}

function formatSalesLabel(key: keyof FlatSalesBreakdown): string {
  switch (key) {
    case 'available':
      return 'Available';
    case 'booked':
      return 'Booked';
    case 'sold':
      return 'Sold';
    case 'onHold':
      return 'On hold';
    case 'blocked':
      return 'Blocked';
    case 'underConstruction':
      return 'Under construction';
    default:
      return key;
  }
}

function ProgressRing({ value, size = 'medium' }: { value: number; size?: 'medium' | 'large' }) {
  const radius = size === 'large' ? 64 : 40;
  const strokeWidth = 12;
  const normalizedValue = Math.max(0, Math.min(100, value));
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - (dashArray * normalizedValue) / 100;

  return (
    <svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
      <circle
        cx={radius + strokeWidth / 2}
        cy={radius + strokeWidth / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={radius + strokeWidth / 2}
        cy={radius + strokeWidth / 2}
        r={radius}
        fill="none"
        stroke="#111827"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

function BulkImportModal({
  onClose,
  propertyId,
  propertyName,
  onImported,
}: {
  onClose: () => void;
  propertyId?: string | null;
  propertyName?: string;
  onImported?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [result, setResult] = useState<TowerBulkImportSummary | null>(null);

  const handleDownloadTemplate = () => {
    const template = 'towerNumber,name,totalFloors,totalUnits,unitsPerFloor,constructionStatus\nT1,Tower A,18,72,4 units per floor,PLANNED';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'tower-import-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    if (uploading) {
      return;
    }
    if (!propertyId) {
      setModalError('Select a property before importing towers.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!propertyId) {
      setModalError('Select a property before importing towers.');
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setModalError(null);
      setResult(null);
      const summary = await towersService.bulkImportTowers(propertyId, file);
      setResult(summary);
      onImported?.();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Failed to import towers. Please verify the file contents and try again.';
      setModalError(message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Bulk import towers</h2>
            <p className="mt-1 text-sm text-gray-500">
              {propertyName ? `Target property: ${propertyName}` : 'Select a property before uploading.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
            aria-label="Close bulk import dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p className="font-medium text-gray-700">Here&apos;s how bulk import works:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Download the CSV template and add one row per tower.</li>
            <li>Include floors, planned units, and construction status for each tower.</li>
            <li>Upload the completed file and review the generated summary before publishing.</li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BrandPrimaryButton onClick={handleUploadClick}>
            <Sparkles className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload CSV'}
          </BrandPrimaryButton>
          <BrandSecondaryButton onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="h-4 w-4" /> Download template
          </BrandSecondaryButton>
        </div>

        <p className="text-xs text-gray-500">
          Need help? Reach out to the data ops team to get your tower layouts modeled in bulk.
        </p>

        {modalError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {modalError}
          </div>
        )}

        {result && (
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Import summary</div>
            <p>
              Processed {result.totalRows} row{result.totalRows === 1 ? '' : 's'}. Created {result.created}, skipped {result.skipped}.
            </p>
            {result.errors.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium text-red-600">
                  {result.errors.length} row{result.errors.length === 1 ? '' : 's'} need attention:
                </p>
                <ul className="max-h-48 space-y-2 overflow-auto text-xs">
                  {result.errors.map((error) => (
                    <li
                      key={`${error.rowNumber}-${error.towerNumber ?? 'row'}`}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
                    >
                      <div className="font-semibold">
                        Row {error.rowNumber}
                        {error.towerNumber ? ` – ${error.towerNumber}` : ''}
                      </div>
                      <ul className="mt-1 list-disc pl-4">
                        {error.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-emerald-600">All towers imported successfully.</p>
            )}
          </div>
        )}

        {importedSuccessfully && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            You can safely close this dialog and continue reviewing tower readiness.
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
