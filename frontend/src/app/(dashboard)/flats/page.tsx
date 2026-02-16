'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Layers,
  ListFilter,
  Loader2,
  Plus,
  Shuffle,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  flatsService,
  FlatInventorySummary,
  FlatInventoryUnit,
  FlatCompletenessBreakdown,
} from '@/services/flats.service';
import {
  propertiesService,
  Property,
  FlatSalesBreakdown,
} from '@/services/properties.service';
import { towersService, Tower } from '@/services/towers.service';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { formatCurrency } from '@/utils/formatters';

const COMPLETENESS_BADGE: Record<string, { label: string; text: string; bg: string; border: string }> = {
  NOT_STARTED: {
    label: 'Not started',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  IN_PROGRESS: {
    label: 'In progress',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  NEEDS_REVIEW: {
    label: 'Needs review',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  COMPLETE: {
    label: 'Complete',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
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

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  BOOKED: 'Booked',
  SOLD: 'Sold',
  ON_HOLD: 'On hold',
  BLOCKED: 'Blocked',
  UNDER_CONSTRUCTION: 'Under construction',
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#3DA35D',
  BOOKED: '#F59E0B',
  SOLD: '#2563EB',
  ON_HOLD: '#9333EA',
  BLOCKED: '#6B7280',
  UNDER_CONSTRUCTION: '#94A3B8',
};

export default function FlatsInventoryPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedTower, setSelectedTower] = useState<string>('');
  const [summary, setSummary] = useState<FlatInventorySummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await propertiesService.getProperties({ limit: 50, isActive: true, sortBy: 'name', sortOrder: 'ASC' });
        setProperties(response.data ?? []);
        if ((response.data?.length ?? 0) > 0) {
          setSelectedProperty(response.data![0].id);
        }
      } catch (err: any) {
        console.error('Failed to load properties', err);
        setError(err?.response?.data?.message ?? 'Unable to load properties');
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    const loadTowers = async () => {
      if (!selectedProperty) {
        setTowers([]);
        setSelectedTower('');
        return;
      }

      try {
        setLoadingTowers(true);
        const response = await towersService.getTowers({ propertyId: selectedProperty, isActive: true, limit: 200, sortBy: 'displayOrder', sortOrder: 'ASC' });
        const towerList = response.data ?? [];
        setTowers(towerList);
        if ((towerList || []).length > 0) {
          setSelectedTower(towerList[0].id);
        } else {
          setSelectedTower('');
        }
      } catch (err: any) {
        console.error('Failed to load towers', err);
        setError(err?.response?.data?.message ?? 'Unable to load towers');
      } finally {
        setLoadingTowers(false);
      }
    };

    loadTowers();
  }, [selectedProperty]);

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedTower) {
        setSummary(null);
        return;
      }

      try {
        setLoadingSummary(true);
        setError(null);
        const data = await flatsService.getTowerInventorySummary(selectedTower, { forceRefresh: true });
        setSummary(data);
      } catch (err: any) {
        console.error('Failed to load flat inventory summary', err);
        setError(err?.response?.data?.message ?? 'Unable to load flat inventory');
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [selectedTower]);

  const filteredUnits = useMemo(() => {
    if (!summary) return [];
    return (summary.units || []).filter((unit) => {
      const matchesStatus =
        statusFilter === 'ALL' || unit.status === statusFilter;
      const matchesSearch = searchTerm
        ? unit.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(unit.floor ?? '').includes(searchTerm)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [summary, statusFilter, searchTerm]);

  const headerStats = useMemo(() => {
    if (!summary) return null;

    const completion = Math.round(summary.averageCompletionPct ?? 0);
    return {
      completion,
      unitsText: `${formatIndianNumber(summary.unitsDefined)} defined · ${formatIndianNumber(summary.missingUnits)} missing`,
      salesText: `${formatIndianNumber(summary.salesBreakdown.available)} available · ${formatIndianNumber(summary.salesBreakdown.booked + summary.salesBreakdown.sold)} committed`,
      issuesText: `${summary.completeness.complete} complete · ${summary.completeness.needsReview} needs review`,
      fundsText: `${formatCurrency(summary.fundsRealized ?? 0)} realised · ${formatCurrency(summary.fundsOutstanding ?? 0)} pending`,
    };
  }, [summary]);

  const onChangeProperty = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProperty(event.target.value);
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  const onChangeTower = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTower(event.target.value);
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  return (
    <div className="space-y-8 p-6 md:p-8" style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}>
      <BrandHero
        eyebrow="Unit Readiness"
        title={
          <>
            Every home staged for <span style={{ color: brandPalette.accent }}>life-long bonding</span>
          </>
        }
        description="Zoom into a tower, see which units are launch ready, and mobilise editors on the ones that still need attention."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/flats/new')}>
              <Plus className="h-4 w-4" />
              Add Flat
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => selectedTower && router.push(`/flats/new?towerId=${selectedTower}`)}>
              <Sparkles className="h-4 w-4" />
              Auto-generate Units
            </BrandSecondaryButton>
          </>
        }
      />

      <section className="rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3">
            <div className="text-sm font-semibold text-gray-500">Scope</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <select
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-gray-300 focus:outline-none sm:w-64"
                value={selectedProperty}
                onChange={onChangeProperty}
                disabled={(properties || []).length === 0}
              >
                {((properties || [])).map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition focus:border-gray-300 focus:outline-none sm:w-64"
                value={selectedTower}
                onChange={onChangeTower}
                disabled={loadingTowers || (towers || []).length === 0}
              >
                {((towers || [])).map((tower) => (
                  <option key={tower.id} value={tower.id}>
                    {tower.name} ({tower.towerNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
              <Layers className="h-3.5 w-3.5" /> Units planned: {summary?.unitsPlanned ?? '—'}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
              <Target className="h-3.5 w-3.5 text-orange-500" /> Issues: {summary?.issuesCount ?? '—'}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loadingSummary ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading unit readiness…
          </div>
        ) : summary && headerStats ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="relative flex items-center justify-center">
              <ProgressRing value={headerStats.completion} size="large" />
              <span className="absolute text-xl font-semibold text-gray-900">
                {headerStats.completion}%
              </span>
            </div>
            <SummaryCard title="Units" description={headerStats.unitsText} />
            <SummaryCard title="Sales mix" description={headerStats.salesText} />
            <SummaryCard title="Completeness" description={headerStats.issuesText} />
            <SummaryCard title="Receivables" description={headerStats.fundsText} />
          </div>
        ) : null}
      </section>

      {summary && !loadingSummary ? (
        <section className="space-y-6">
          <CompletenessBreakdown breakdown={summary.completeness} />
          <SalesBreakdown breakdown={summary.salesBreakdown} />

          <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <header className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Units checklist</h2>
                <p className="text-sm text-gray-600">
                  Filter by sales status or search by unit number. Spot gaps before hand-off.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by flat # or floor"
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:border-gray-300 focus:outline-none"
                  />
                  <ListFilter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none"
                  >
                    <option value="ALL">All statuses</option>
                    {Array.from(new Set((summary.units || []).map((unit) => unit.status))).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status] ?? status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </header>

            {(filteredUnits || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 py-14 text-center text-sm text-gray-600">
                <Shuffle className="h-6 w-6 text-gray-400" />
                <div>No units match the current filters.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Unit</th>
                      <th className="px-4 py-3 text-left">Floor</th>
                      <th className="px-4 py-3 text-left">Typology</th>
                      <th className="px-4 py-3 text-left">Area (carpet / super)</th>
                      <th className="px-4 py-3 text-left">Facing</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Receivables</th>
                      <th className="px-4 py-3 text-left">Sales status</th>
                      <th className="px-4 py-3 text-left">Construction</th>
                      <th className="px-4 py-3 text-left">Completeness</th>
                      <th className="px-4 py-3 text-left">Warnings</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {((filteredUnits || [])).map((unit) => (
                      <UnitRow key={unit.id} unit={unit} onOpen={() => router.push(`/flats/${unit.id}`)} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ) : !loadingSummary && !error ? (
        <EmptyTowerState onAdd={() => router.push('/flats/new')} />
      ) : null}
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

function SummaryCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-sm text-gray-800">{description}</p>
    </div>
  );
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

function CompletenessBreakdown({ breakdown }: { breakdown: FlatCompletenessBreakdown }) {
  const total =
    breakdown.notStarted +
    breakdown.inProgress +
    breakdown.needsReview +
    breakdown.complete;
  if (total === 0) {
    return null;
  }

  const entries: Array<{ key: keyof FlatCompletenessBreakdown; label: string; color: string; value: number }> = [
    { key: 'complete', label: 'Complete', color: '#15803D', value: breakdown.complete },
    { key: 'inProgress', label: 'In progress', color: '#D97706', value: breakdown.inProgress },
    { key: 'needsReview', label: 'Needs review', color: '#EA580C', value: breakdown.needsReview },
    { key: 'notStarted', label: 'Not started', color: '#DC2626', value: breakdown.notStarted },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Completeness mix</h3>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
        {((entries || [])).map((entry) => (
          <div key={entry.key} className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{entry.label}</span>
            <span>· {entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesBreakdown({ breakdown }: { breakdown: FlatSalesBreakdown }) {
  if (breakdown.total === 0) return null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Sales status</h3>
      <div className="mt-4 space-y-3">
        <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
          {((SALES_ORDER || [])).map((key) => {
            const value = breakdown[key] ?? 0;
            if (!value) return null;
            const width = Math.max((value / breakdown.total) * 100, 2);
            return (
              <div
                key={key}
                className="transition-all"
                style={{ width: `${width}%`, backgroundColor: getSalesColor(key) }}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {((SALES_ORDER || [])).map((key) => {
            const value = breakdown[key] ?? 0;
            if (!value) return null;
            return (
              <div key={key} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getSalesColor(key) }} />
                <span className="font-semibold">{formatSalesLabelKey(key)}</span>
                <span>· {formatIndianNumber(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatSalesLabelKey(key: keyof FlatSalesBreakdown): string {
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

function UnitRow({ unit, onOpen }: { unit: FlatInventoryUnit; onOpen: () => void }) {
  const badge = COMPLETENESS_BADGE[unit.completenessStatus] ?? COMPLETENESS_BADGE.IN_PROGRESS;
  const issuesLabel = unit.issuesCount > 0 ? `${unit.issuesCount} warning${unit.issuesCount > 1 ? 's' : ''}` : 'All good';
  const issuesIcon = unit.issuesCount > 0 ? (
    <AlertTriangle className="h-4 w-4 text-orange-500" />
  ) : (
    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  );

  return (
    <tr className="hover:bg-gray-50/70">
      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{unit.flatNumber}</td>
      <td className="px-4 py-3 text-gray-700">{unit.floor ?? '—'}</td>
      <td className="px-4 py-3 text-gray-700">{unit.type}</td>
      <td className="px-4 py-3 text-gray-700">
        {formatIndianNumber(unit.carpetArea)} / {formatIndianNumber(unit.superBuiltUpArea)} sq.ft
      </td>
      <td className="px-4 py-3 text-gray-700">{unit.facing ?? '—'}</td>
      <td className="px-4 py-3 text-gray-700">₹{formatIndianNumber(unit.basePrice)}</td>
      <td className="px-4 py-3 text-gray-700">
        <div className="text-sm font-semibold text-gray-900">{formatCurrency(unit.fundsRealized ?? 0)}</div>
        <div className="text-xs text-gray-500">Pending {formatCurrency(unit.fundsOutstanding ?? Math.max((unit.fundsTarget ?? 0) - (unit.fundsRealized ?? 0), 0))}</div>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: STATUS_COLORS[unit.status] ?? '#6B7280' }}
        >
          {STATUS_LABELS[unit.status] ?? unit.status}
        </span>
      </td>
      <td className="px-4 py-3">
        {unit.constructionProgress !== undefined && unit.constructionProgress > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">
                {unit.constructionStage ? unit.constructionStage.replace('_', ' ') : 'In Progress'}
              </span>
              <span className="font-semibold text-gray-900">{Math.round(unit.constructionProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all" 
                style={{ width: `${unit.constructionProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Not started</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
          {badge.label} · {Math.round(unit.dataCompletionPct)}%
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {issuesIcon}
          <span>{issuesLabel}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
        >
          Inspect
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

function EmptyTowerState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 py-16 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <Sparkles className="h-10 w-10 text-rose-500" />
        <h3 className="text-xl font-semibold text-gray-900">No units defined yet</h3>
        <p className="text-sm text-gray-600">
          Kick-start the tower by generating its unit stack or adding the first few units manually.
        </p>
        <BrandPrimaryButton onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add your first unit
        </BrandPrimaryButton>
      </div>
    </div>
  );
}
// *** End of File
