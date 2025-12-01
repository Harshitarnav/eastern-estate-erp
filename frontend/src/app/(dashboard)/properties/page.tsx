'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/tables/DataTable';
import { Modal, DeleteConfirmDialog, AlertDialog } from '@/components/modals/Modal';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';
import { Building2, Plus, Calendar, TrendingUp, Home, Sparkles, AlertTriangle, IndianRupee, Loader2 } from 'lucide-react';
import { propertiesService, Property as ApiProperty, PropertyInventorySummary, TowerInventorySummary, TowerUnitStagePreview } from '@/services/properties.service';
import { formatCurrency } from '@/utils/formatters';

interface PropertyRow {
  id: string;
  code: string;
  name: string;
  projectName?: string;
  projectCode?: string;
  location?: string;
  city?: string;
  state?: string;
  type?: string;
  totalArea?: number;
  areaUnit?: string;
  towers?: number;
  totalUnits?: number;
  soldUnits?: number;
  availableUnits?: number;
  bhkTypes?: string;
  reraNumber?: string;
  status?: string;
  launchDate?: string;
  possessionDate?: string;
  priceRange?: string;
  revenue?: number;
  createdAt?: string;
  updatedAt?: string;
  fundsTarget?: number;
  fundsRealized?: number;
  fundsOutstanding?: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Planning: { bg: 'rgba(243, 227, 193, 1)', text: brandPalette.secondary },
  'Under Construction': { bg: 'rgba(242, 201, 76, 0.25)', text: brandPalette.secondary },
  Active: { bg: 'rgba(61, 163, 93, 0.15)', text: brandPalette.success },
  Completed: { bg: 'rgba(34, 197, 94, 0.15)', text: brandPalette.primary },
};

const CONSTRUCTION_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planned',
  UNDER_CONSTRUCTION: 'Under Construction',
  COMPLETED: 'Completed',
  READY_TO_MOVE: 'Ready to Move',
};

const FLAT_STAGE_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  BOOKED: 'Booked',
  SOLD: 'Sold',
  BLOCKED: 'Blocked',
  ON_HOLD: 'On Hold',
  UNDER_CONSTRUCTION: 'Under Construction',
};

const mapPropertyToRow = (property: ApiProperty): PropertyRow => {
  const toNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const towers = toNumber(
    property.towers ?? (property as any).towersCount ?? property.numberOfTowers,
  );

  const totalUnits = toNumber(
    property.totalFlats ?? (property as any).totalFlats ?? property.numberOfUnits,
  );

  const soldUnits = toNumber(
    property.soldFlats ?? (property as any).soldFlats ?? (property as any).soldUnits,
  );

  const availableUnits =
    toNumber(property.availableFlats ?? (property as any).availableFlats ?? (property as any).availableUnits) ??
    (totalUnits !== undefined && soldUnits !== undefined
      ? Math.max(totalUnits - soldUnits, 0)
      : undefined);

  const bhkTypesList = Array.isArray(property.bhkTypes)
    ? property.bhkTypes
    : typeof (property as any).bhkTypes === 'string'
    ? String((property as any).bhkTypes)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const bhkTypes = (bhkTypesList || []).length > 0 ? bhkTypesList.join(', ') : undefined;

  const priceMin = toNumber(property.priceMin);
  const priceMax = toNumber(property.priceMax);
  const priceRange =
    priceMin !== undefined || priceMax !== undefined
      ? `${formatCurrency(priceMin ?? priceMax ?? 0)} - ${formatCurrency(
          priceMax ?? priceMin ?? 0,
        )}`
      : (property as any).priceRange ??
        (property as any).priceBand ??
        (property as any).pricingSummary;

  const revenue = toNumber(
    property.expectedRevenue ??
      (property as any).totalRevenue ??
      (property as any).revenue,
  );

  const fundsTarget = toNumber(
    property.fundsTarget ??
      (property as any).fundsTarget ??
      property.expectedRevenue ??
      revenue,
  );
  const fundsRealized = toNumber(
    property.fundsRealized ?? (property as any).fundsRealized,
  );
  const fundsOutstanding = toNumber(
    property.fundsOutstanding ?? (property as any).fundsOutstanding,
  );

  const normalizeDate = (value?: string) =>
    value ? value.split('T')[0] : undefined;

  return {
    id: property.id,
    code: property.propertyCode,
    name: property.name,
    projectName: property.projectName,
    projectCode: property.projectCode,
    location: property.location || property.address,
    city: property.city,
    state: property.state,
    type: property.projectType || property.propertyType,
    totalArea: property.totalArea,
    areaUnit: property.areaUnit,
    towers,
    totalUnits,
    soldUnits,
    availableUnits,
    bhkTypes,
    reraNumber: property.reraNumber,
    status: property.status,
    launchDate: normalizeDate(property.launchDate),
    possessionDate: normalizeDate(property.expectedCompletionDate),
    priceRange,
    revenue,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    fundsTarget,
    fundsRealized,
    fundsOutstanding,
  };
};

export default function PropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRow | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inventorySummary, setInventorySummary] = useState<PropertyInventorySummary | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await propertiesService.getProperties({ limit: 100 });
        const rows = (response?.data ?? []).map(mapPropertyToRow);
        setProperties(rows);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        setError('Unable to load properties from the server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (!showDetails || !selectedProperty) {
      setInventorySummary(null);
      setInventoryError(null);
      return;
    }

    let isCancelled = false;

    const loadInventory = async () => {
      try {
        setInventoryLoading(true);
        const summary = await propertiesService.getInventorySummary(selectedProperty.id);
        if (!isCancelled) {
          setInventorySummary(summary);
          setInventoryError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setInventorySummary(null);
          setInventoryError(err?.response?.data?.message ?? 'Unable to load tower stages for this property.');
        }
      } finally {
        if (!isCancelled) {
          setInventoryLoading(false);
        }
      }
    };

    loadInventory();

    return () => {
      isCancelled = true;
    };
  }, [showDetails, selectedProperty]);

  const stats = useMemo(() => {
    const totalProjects = (properties || []).length;
    const totalUnits = ((properties || [])).reduce((sum, p) => sum + (p.totalUnits ?? 0), 0);
    const soldUnits = ((properties || [])).reduce((sum, p) => sum + (p.soldUnits ?? 0), 0);
    const availableUnits = ((properties || [])).reduce(
      (sum, p) => sum + (p.availableUnits ?? Math.max((p.totalUnits ?? 0) - (p.soldUnits ?? 0), 0)),
      0,
    );
    const absorptionRate = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;
    const fundsTarget = ((properties || [])).reduce(
      (sum, p) => sum + (p.fundsTarget ?? p.revenue ?? 0),
      0,
    );
    const fundsRealized = ((properties || [])).reduce((sum, p) => sum + (p.fundsRealized ?? 0), 0);
    const fundsOutstanding = ((properties || [])).reduce((sum, p) => {
      if (p.fundsOutstanding !== undefined) {
        return sum + p.fundsOutstanding;
      }
      const target = p.fundsTarget ?? p.revenue ?? 0;
      const realized = p.fundsRealized ?? 0;
      return sum + Math.max(target - realized, 0);
    }, 0);

    return {
      totalProjects,
      totalUnits,
      soldUnits,
      availableUnits,
      absorptionRate,
      fundsTarget,
      fundsRealized,
      fundsOutstanding,
    };
  }, [properties]);

  const handleDelete = async () => {
    if (!selectedProperty) return;

    setDeleteLoading(true);
    try {
      await propertiesService.deleteProperty(selectedProperty.id);
      setProperties((prev) => ((prev || [])).filter((property) => property.id !== selectedProperty.id));
      setShowDelete(false);
      setSuccessMessage('Property archived successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async (rows: PropertyRow[]) => {
    if (!confirm(`Delete ${(rows || []).length} properties?`)) return;

    try {
      await Promise.all((rows || []).map((row) => propertiesService.deleteProperty(row.id)));
      const deletedIds = ((rows || [])).map((row) => row.id);
      setProperties((prev) => ((prev || [])).filter((property) => !deletedIds.includes(property.id)));
      setSuccessMessage(`${(rows || []).length} properties archived`);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error bulk deleting properties:', error);
      alert('Failed to delete selected properties');
    }
  };

  const handleExport = (rows: PropertyRow[]) => {
    if ((rows || []).length === 0) {
      alert('No properties to export yet.');
      return;
    }
    const csv = convertToCSV(rows);
    downloadCSV(csv, `properties-${Date.now()}.csv`);
  };

  const columns = [
    {
      key: 'code',
      label: 'Project Code',
      width: '140px',
      render: (value: string | undefined) => (
        <span
          className="font-mono text-xs px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(243, 227, 193, 0.65)',
            color: brandPalette.secondary,
            border: `1px solid ${brandPalette.secondary}20`,
          }}
        >
          {value || '—'}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Project Name',
      width: '220px',
      render: (value: string, row: PropertyRow) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.type || '—'}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      width: '200px',
      render: (value: string | undefined, row: PropertyRow) => (
        <div>
          <div className="text-sm text-gray-900">{value || '—'}</div>
          <div className="text-xs text-gray-500">
            {[row.city, row.state].filter(Boolean).join(', ') || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '160px',
      render: (value: string | undefined) => {
        const { bg, text } = STATUS_STYLES[value ?? 'Active'] ?? {
          bg: 'rgba(243, 227, 193, 0.5)',
          text: brandPalette.secondary,
        };
        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ backgroundColor: bg, color: text }}
          >
            {value || 'Active'}
          </span>
        );
      },
    },
    {
      key: 'towers',
      label: 'Towers',
      width: '100px',
      render: (value: number | undefined) => (
        <div className="font-semibold text-gray-900 text-center">
          {value ?? 0}
        </div>
      ),
    },
    {
      key: 'totalUnits',
      label: 'Units',
      width: '140px',
      render: (value: number | undefined, row: PropertyRow) => (
        <div>
          <div className="font-semibold text-gray-900">{formatIndianNumber(value ?? 0)}</div>
          <div className="text-xs text-gray-500">{row.bhkTypes || '—'}</div>
        </div>
      ),
    },
    {
      key: 'soldUnits',
      label: 'Sold / Available',
      width: '180px',
      render: (value: number | undefined, row: PropertyRow) => {
        const sold = value ?? 0;
        const total = row.totalUnits ?? 0;
        const available =
          row.availableUnits ?? Math.max(total - sold, 0);
        const percent = total > 0 ? Math.round((sold / total) * 100) : 0;

        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {formatIndianNumber(sold)} / {formatIndianNumber(available)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${percent}%`,
                  backgroundColor: brandPalette.primary,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{percent}% sold</div>
          </div>
        );
      },
    },
    {
      key: 'revenue',
      label: 'Revenue',
      width: '150px',
      render: (value: number | undefined) => (
        <div className="font-semibold" style={{ color: brandPalette.secondary }}>
          {value ? `${formatToCrore(value)}` : '—'}
        </div>
      ),
    },
  ];

  const heroBadge = error ? (
    <span
      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full"
      style={{ backgroundColor: 'rgba(168, 33, 27, 0.12)', color: brandPalette.primary }}
    >
      <AlertTriangle className="w-4 h-4" />
      {error}
    </span>
  ) : !loading && (properties || []).length === 0 ? (
    <span
      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full"
      style={{ backgroundColor: 'rgba(242, 201, 76, 0.18)', color: brandPalette.accent }}
    >
      <Sparkles className="w-4 h-4" />
      No projects yet — add your first property
    </span>
  ) : undefined;

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      <BrandHero
        eyebrow="Eastern Estate Portfolio"
        title={
          <>
            Properties crafted for <span style={{ color: brandPalette.accent }}>life-long bonding</span>
          </>
        }
        description="Track every project with precision—from launch readiness and sales velocity to revenue realization—all wrapped in Eastern Estate’s signature warmth."
        badge={heroBadge}
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/properties/new')}>
              <Plus className="w-4 h-4" />
              Add New Property
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/towers')}>
              Explore Towers
            </BrandSecondaryButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BrandStatCard
          title="Portfolio Strength"
          primary={formatIndianNumber(stats.totalProjects)}
          subLabel="Active projects across the heartland"
          icon={<Building2 className="w-8 h-8" />}
          accentColor={brandPalette.accent}
        />
        <BrandStatCard
          title="Total Inventory"
          primary={formatIndianNumber(stats.totalUnits)}
          subLabel={`${formatIndianNumber(stats.availableUnits)} units available`}
          icon={<Home className="w-8 h-8" />}
          accentColor={brandPalette.neutral}
        />
        <BrandStatCard
          title="Sales Velocity"
          primary={`${stats.absorptionRate.toFixed(1)}%`}
          subLabel={`${formatIndianNumber(stats.soldUnits)} units sold`}
          icon={<TrendingUp className="w-8 h-8" />}
          accentColor="rgba(61, 163, 93, 0.25)"
        />
        <BrandStatCard
          title="Projected Collections"
          primary={formatCurrency(stats.fundsTarget)}
          subLabel={`${formatToCrore(stats.fundsTarget)} expected`}
          icon={<Calendar className="w-8 h-8" />}
          accentColor="rgba(61, 163, 93, 0.12)"
        />
        <BrandStatCard
          title="Funds Realised"
          primary={formatCurrency(stats.fundsRealized)}
          subLabel={`${formatToCrore(stats.fundsRealized)} received`}
          icon={<IndianRupee className="w-8 h-8" />}
          accentColor="rgba(34, 197, 94, 0.15)"
        />
        <BrandStatCard
          title="Funds Outstanding"
          primary={formatCurrency(stats.fundsOutstanding)}
          subLabel={`${formatToCrore(stats.fundsOutstanding)} pending`}
          icon={<AlertTriangle className="w-8 h-8" />}
          accentColor="rgba(168, 33, 27, 0.18)"
        />
      </section>

      <section
        className="rounded-3xl border bg-white/90 backdrop-blur-sm shadow-sm"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="border-b px-6 py-5" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <h2 className="text-lg font-semibold text-gray-900">Project Overview</h2>
          <p className="text-sm text-gray-500">
            Drill into availability, status and revenue performance for each development.
          </p>
        </div>
        <div className="p-4">
          <DataTable
            data={properties}
            columns={columns}
            loading={loading}
            onRowClick={(property) => {
              setSelectedProperty(property);
              setShowDetails(true);
            }}
            onEdit={(property) => router.push(`/properties/${property.id}/edit`)}
            onDelete={(property) => {
              setSelectedProperty(property);
              setShowDelete(true);
            }}
            onBulkDelete={handleBulkDelete}
            onExport={handleExport}
            searchable
            filterable
            exportable
            bulkActions
            mobileView
          />
        </div>
      </section>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={selectedProperty?.name ?? ''}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 rounded-full border text-sm font-semibold"
              style={{ borderColor: `${brandPalette.secondary}30`, color: brandPalette.secondary }}
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowDetails(false);
                router.push(`/properties/${selectedProperty?.id}/edit`);
              }}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: brandPalette.primary }}
            >
              Edit Property
            </button>
          </div>
        }
      >
        {selectedProperty && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {propertyDetails(selectedProperty).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <FinancialSnapshot
              realized={selectedProperty.fundsRealized ?? inventorySummary?.fundsRealized}
              outstanding={selectedProperty.fundsOutstanding ?? inventorySummary?.fundsOutstanding}
              target={selectedProperty.fundsTarget ?? inventorySummary?.fundsTarget ?? selectedProperty.revenue}
            />

            <TowerStageSection
              summary={inventorySummary}
              loading={inventoryLoading}
              error={inventoryError}
            />
          </div>
        )}
      </Modal>

      <DeleteConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        itemName={selectedProperty?.name}
        loading={deleteLoading}
      />

      <AlertDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Success!"
        description={successMessage}
        type="success"
      />
    </div>
  );
}

function propertyDetails(property: PropertyRow) {
  const detailPairs = [
    { label: 'Project', value: property.projectName || '—' },
    { label: 'Property Code', value: property.code || '—' },
    { label: 'Project Type', value: property.type || '—' },
    {
      label: 'Location',
      value: property.location || [property.city, property.state].filter(Boolean).join(', ') || '—',
    },
    { label: 'Total Area', value: property.totalArea ? `${property.totalArea} ${property.areaUnit}` : '—' },
    { label: 'Towers', value: property.towers ?? '—' },
    { label: 'Total Units', value: property.totalUnits ?? '—' },
    { label: 'Units Sold', value: property.soldUnits ?? '—' },
    { label: 'Units Available', value: property.availableUnits ?? '—' },
    { label: 'BHK Mix', value: property.bhkTypes || '—' },
    { label: 'Price Range', value: property.priceRange || '—' },
    { label: 'RERA Number', value: property.reraNumber || '—' },
    { label: 'Launch Date', value: property.launchDate || '—' },
    { label: 'Possession Date', value: property.possessionDate || '—' },
    { label: 'Status', value: property.status || '—' },
    { label: 'Portfolio Revenue', value: property.revenue ? formatCurrency(property.revenue) : '—' },
    { label: 'Funds Realised', value: property.fundsRealized !== undefined ? formatCurrency(property.fundsRealized) : '—' },
    { label: 'Funds Outstanding', value: property.fundsOutstanding !== undefined ? formatCurrency(property.fundsOutstanding) : '—' },
    { label: 'Projected Collections', value: property.fundsTarget !== undefined ? formatCurrency(property.fundsTarget) : '—' },
  ];

  return detailPairs;
}

function FinancialSnapshot({
  realized,
  outstanding,
  target,
}: {
  realized?: number | null;
  outstanding?: number | null;
  target?: number | null;
}) {
  if (realized === undefined && outstanding === undefined && target === undefined) {
    return null;
  }

  const displayValue = (value?: number | null) =>
    value !== undefined && value !== null ? formatCurrency(value) : '—';

  const items = [
    {
      label: 'Funds Realised',
      amount: realized,
      tone: 'text-emerald-600',
      suffix: 'received',
    },
    {
      label: 'Funds Outstanding',
      amount: outstanding,
      tone: 'text-orange-600',
      suffix: 'pending',
    },
    {
      label: 'Projected Collections',
      amount: target,
      tone: 'text-indigo-600',
      suffix: 'target',
    },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Financial Snapshot
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {((items || [])).map(({ label, amount, tone, suffix }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`mt-2 text-lg font-semibold ${tone}`}>{displayValue(amount)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {amount !== undefined && amount !== null
                ? `${formatToCrore(amount)} ${suffix}`
                : 'Awaiting data'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TowerStageSection({
  summary,
  loading,
  error,
}: {
  summary: PropertyInventorySummary | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Construction & Unit Stages
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Visual progress snapshots aligned to each tower and unit stage.
          </p>
        </div>
        {summary ? (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatIndianNumber(summary.towersDefined)} towers</span>
            <span>•</span>
            <span>{formatIndianNumber(summary.unitsDefined)} units defined</span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Fetching the latest tower imagery…
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {error}
        </div>
      ) : summary && (summary.towers || []).length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {(summary.towers || []).map((tower) => (
            <TowerStageCard key={tower.id} tower={tower} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
          Define towers and add imagery to showcase construction progress.
        </div>
      )}
    </div>
  );
}

function TowerStageCard({ tower }: { tower: TowerInventorySummary }) {
  const stageLabel = getConstructionStatusLabel(tower.constructionStatus);
  const heroImage = tower.heroImage ?? tower.imageGallery?.[0];
  const additionalImages = Math.max((tower.imageGallery?.length ?? 0) - (heroImage ? 1 : 0), 0);
  const unitPreviews: TowerUnitStagePreview[] = tower.unitStagePreviews ?? [];
  const paymentStages = tower.paymentStages ?? [];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm">
      <div className="relative h-40 overflow-hidden rounded-2xl bg-gray-100">
        {heroImage ? (
          <img src={heroImage} alt={`${tower.name} stage`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Add tower imagery to inspire buyers
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-700">
          {stageLabel}
        </span>
        {additionalImages > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            +{additionalImages} photos
          </span>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Tower {tower.towerNumber}</p>
        <h4 className="text-lg font-semibold text-gray-900">{tower.name}</h4>
      </div>
      <div className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs text-gray-600 sm:grid-cols-3">
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-500">Projected</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(tower.fundsTarget ?? 0)}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-500">Realised</p>
          <p className="mt-1 text-sm font-semibold text-emerald-600">{formatCurrency(tower.fundsRealized ?? 0)}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-500">Outstanding</p>
          <p className="mt-1 text-sm font-semibold text-orange-600">{formatCurrency(tower.fundsOutstanding ?? 0)}</p>
        </div>
      </div>
      {(unitPreviews || []).length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Unit Snapshots</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {((unitPreviews || [])).map((unit) => (
              <div key={unit.id} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-white shadow-inner">
                  {unit.images?.[0] ? (
                    <img src={unit.images[0]} alt={`${unit.flatNumber} ${unit.status}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{unit.flatNumber}</p>
                  <p className="text-xs text-gray-500">{getFlatStageLabel(unit.status)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-500">
          Add unit imagery to highlight readiness.
        </div>
      )}
      {(paymentStages || []).length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment Schedule</p>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Collected</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {((paymentStages || [])).map((stage) => (
                  <tr key={stage.floorNumber}>
                    <td className="px-3 py-2 font-medium text-gray-900">{stage.stageLabel}</td>
                    <td className="px-3 py-2 text-gray-700">{formatCurrency(stage.paymentDue ?? 0)}</td>
                    <td className="px-3 py-2 text-emerald-600">{formatCurrency(stage.paymentCollected ?? 0)}</td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
                        style={{
                          backgroundColor:
                            stage.constructionStatus === 'COMPLETED'
                              ? 'rgba(34,197,94,0.15)'
                              : stage.constructionStatus === 'IN_PROGRESS'
                              ? 'rgba(251,191,36,0.2)'
                              : 'rgba(209,213,219,0.45)',
                          color:
                            stage.constructionStatus === 'COMPLETED'
                              ? '#15803d'
                              : stage.constructionStatus === 'IN_PROGRESS'
                              ? '#b45309'
                              : '#4b5563',
                        }}
                      >
                        {getConstructionStatusLabel(stage.constructionStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-500">
          Configure payment triggers per floor to track receivables.
        </div>
      )}
    </div>
  );
}

function getConstructionStatusLabel(status?: string | null): string {
  if (!status) {
    return 'Status Pending';
  }
  const upper = status.toUpperCase();
  if (CONSTRUCTION_STATUS_LABELS[upper]) {
    return CONSTRUCTION_STATUS_LABELS[upper];
  }
  return status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getFlatStageLabel(status?: string | null): string {
  if (!status) {
    return 'Stage Pending';
  }
  const upper = status.toUpperCase();
  return FLAT_STAGE_LABELS[upper] ?? status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function convertToCSV(data: PropertyRow[]): string {
  const headers = [
    'Code',
    'Name',
    'Location',
    'City',
    'Type',
    'Total Units',
    'Sold Units',
    'Status',
    'Revenue',
  ];
  const rows = ((data || [])).map((p) => [
    p.code ?? '',
    p.name ?? '',
    p.location ?? '',
    p.city ?? '',
    p.type ?? '',
    p.totalUnits ?? '',
    p.soldUnits ?? '',
    p.status ?? '',
    p.revenue ?? '',
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
