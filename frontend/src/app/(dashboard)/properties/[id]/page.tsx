'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Edit, Building2, MapPin, Calendar, Home,
  Layers, Shield, TrendingUp, IndianRupee, CheckCircle,
  Clock, Loader2, Star, Users, BarChart3, ExternalLink,
} from 'lucide-react';
import { propertiesService, Property, PropertyInventorySummary } from '@/services/properties.service';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import DocumentsPanel from '@/components/documents/DocumentsPanel';
import { DocumentEntityType } from '@/services/documents.service';

// ── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v?: number | null) =>
  v ? `₹${formatIndianNumber(v)}` : '—';

const fmtDate = (d?: string | Date | null) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
};

const fmtArea = (v?: number | null, unit = 'sqft') =>
  v ? `${Number(v).toLocaleString('en-IN')} ${unit}` : '—';

const statusColor: Record<string, string> = {
  ACTIVE:       'bg-green-100 text-green-700',
  UNDER_CONSTRUCTION: 'bg-blue-100 text-blue-700',
  COMPLETED:    'bg-purple-100 text-purple-700',
  LAUNCHED:     'bg-orange-100 text-orange-700',
  PLANNING:     'bg-yellow-100 text-yellow-700',
  ON_HOLD:      'bg-gray-100 text-gray-600',
  CANCELLED:    'bg-red-100 text-red-700',
};

const reraColor: Record<string, string> = {
  APPROVED:   'bg-green-100 text-green-700',
  PENDING:    'bg-yellow-100 text-yellow-700',
  REJECTED:   'bg-red-100 text-red-700',
  EXPIRED:    'bg-gray-100 text-gray-600',
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color = brandPalette.primary,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-start gap-3" style={{ borderColor: `${brandPalette.neutral}60` }}>
      <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold mt-0.5" style={{ color: brandPalette.secondary }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [summary, setSummary] = useState<PropertyInventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (propertyId) loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const p = await propertiesService.getPropertyById(propertyId);
      setProperty(p);
      // Silently load inventory summary
      try {
        const s = await propertiesService.getInventorySummary(propertyId);
        setSummary(s);
      } catch { /* optional */ }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-medium">{error || 'Property not found'}</p>
        <button onClick={() => router.push('/properties')}
          className="mt-4 text-sm text-blue-600 hover:underline">← Back to Properties</button>
      </div>
    );
  }

  const sales = summary?.salesBreakdown;
  const pctSold = sales?.total ? Math.round((sales.sold / sales.total) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-6" style={{ backgroundColor: brandPalette.background }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={() => router.push('/properties')}
            className="p-2 hover:bg-gray-100 rounded-lg mt-1">
            <ArrowLeft className="w-5 h-5" style={{ color: brandPalette.secondary }} />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold" style={{ color: brandPalette.secondary }}>
                {property.name}
              </h1>
              {property.status && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[property.status?.toUpperCase()] ?? 'bg-gray-100 text-gray-600'}`}>
                  {property.status}
                </span>
              )}
              {property.isFeatured && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {[property.address, property.city, property.state, property.pincode].filter(Boolean).join(', ')}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">{property.propertyCode}</p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/properties/${propertyId}/edit`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 flex-shrink-0"
          style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}>
          <Edit className="w-4 h-4" /> Edit
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Layers className="w-5 h-5" />}
          label="Towers"
          value={String(property.numberOfTowers ?? summary?.towersDefined ?? '—')}
          sub={summary ? `${summary.towersDefined} defined` : undefined}
          color={brandPalette.secondary}
        />
        <StatCard
          icon={<Home className="w-5 h-5" />}
          label="Total Units"
          value={String(sales?.total ?? property.numberOfUnits ?? '—')}
          sub={sales ? `${sales.available} available` : undefined}
          color="#2563EB"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Sold / Booked"
          value={sales ? `${(sales.sold + sales.booked).toLocaleString('en-IN')}` : '—'}
          sub={sales ? `${pctSold}% sold` : undefined}
          color="#16A34A"
        />
        <StatCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Expected Revenue"
          value={summary ? fmt(summary.fundsTarget) : fmt(property.expectedRevenue)}
          sub={summary ? `${fmt(summary.fundsRealized)} collected` : undefined}
          color="#C2410C"
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: brandPalette.secondary }}>About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Key Details */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Project Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Property Code"  value={property.propertyCode} />
              <InfoRow label="Project Type"   value={property.projectType} />
              <InfoRow label="Property Type"  value={property.propertyType} />
              <InfoRow label="Total Area"     value={fmtArea(property.totalArea, property.areaUnit)} />
              <InfoRow label="Built-up Area"  value={fmtArea(property.builtUpArea, property.areaUnit)} />
              <InfoRow label="Floors / Tower" value={property.floorsPerTower} />
              <InfoRow label="BHK Types"      value={property.bhkTypes?.join(', ')} />
              <InfoRow label="Price Range"    value={property.priceMin && property.priceMax ? `${fmt(property.priceMin)} – ${fmt(property.priceMax)}` : undefined} />
              <InfoRow label="Country"        value={property.country} />
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Timeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Launch Date"            value={fmtDate(property.launchDate)} />
              <InfoRow label="Expected Completion"    value={fmtDate(property.expectedCompletionDate)} />
              <InfoRow label="Actual Completion"      value={fmtDate(property.actualCompletionDate)} />
              <InfoRow label="Record Created"         value={fmtDate(property.createdAt)} />
              <InfoRow label="Last Updated"           value={fmtDate(property.updatedAt)} />
            </div>
          </div>

          {/* RERA & Compliance */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              RERA & Compliance
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {property.reraNumber ? (
                <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3 border border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">RERA Number</p>
                    <p className="text-sm font-bold text-green-800 font-mono">{property.reraNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-200">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm text-yellow-700">RERA number not entered</p>
                </div>
              )}
              {property.reraStatus && (
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${reraColor[property.reraStatus?.toUpperCase()] ?? 'bg-gray-100 text-gray-600'}`}>
                  RERA: {property.reraStatus}
                </span>
              )}
            </div>
          </div>

          {/* Amenities */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {(property.amenities as string[]).map((a, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Landmarks */}
          {property.nearbyLandmarks && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: brandPalette.secondary }}>Nearby Landmarks</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{property.nearbyLandmarks}</p>
            </div>
          )}

          {/* Towers inventory breakdown */}
          {summary && summary.towers.length > 0 && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Towers Overview</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 text-xs font-semibold text-gray-500">Tower</th>
                      <th className="pb-2 text-xs font-semibold text-gray-500">Status</th>
                      <th className="pb-2 text-xs font-semibold text-gray-500 text-right">Units</th>
                      <th className="pb-2 text-xs font-semibold text-gray-500 text-right">Sold</th>
                      <th className="pb-2 text-xs font-semibold text-gray-500 text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.towers.map(t => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 font-medium">{t.name}</td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.constructionStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            t.constructionStatus === 'UNDER_CONSTRUCTION' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'}`}>
                            {t.constructionStatus?.replace(/_/g,' ') ?? '—'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">{t.totalUnits}</td>
                        <td className="py-2.5 text-right text-green-600 font-medium">{t.salesBreakdown?.sold ?? '—'}</td>
                        <td className="py-2.5 text-right text-blue-600 font-medium">{t.salesBreakdown?.available ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Project Documents */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <DocumentsPanel
              entityType={DocumentEntityType.PROPERTY}
              entityId={propertyId}
              fetchMode="entity"
              title="Project Documents"
            />
          </div>

          {/* Sales Progress */}
          {sales && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Sales Progress</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sold</span>
                  <span className="font-semibold text-green-600">{pctSold}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${pctSold}%`, backgroundColor: '#16A34A' }} />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Available', value: sales.available, color: 'text-blue-600' },
                    { label: 'Booked',    value: sales.booked,    color: 'text-orange-600' },
                    { label: 'Sold',      value: sales.sold,      color: 'text-green-600' },
                    { label: 'On Hold',   value: sales.onHold,    color: 'text-yellow-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Revenue */}
          {summary && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Revenue</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Target</span>
                  <span className="text-sm font-semibold">{fmt(summary.fundsTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Collected</span>
                  <span className="text-sm font-semibold text-green-600">{fmt(summary.fundsRealized)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-gray-500">Outstanding</span>
                  <span className="text-sm font-semibold text-red-600">{fmt(summary.fundsOutstanding)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: brandPalette.secondary }}>Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/properties/${propertyId}/edit`)}
                className="w-full text-left px-4 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}>
                <Edit className="w-4 h-4" /> Edit Property
              </button>
              <button
                onClick={() => router.push(`/towers?propertyId=${propertyId}`)}
                className="w-full text-left px-4 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Layers className="w-4 h-4" /> View Towers
              </button>
              <button
                onClick={() => router.push(`/flats?propertyId=${propertyId}`)}
                className="w-full text-left px-4 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: '#7C3AED', color: '#7C3AED' }}>
                <Home className="w-4 h-4" /> View Flats
              </button>
              <button
                onClick={() => router.push(`/reports/outstanding?propertyId=${propertyId}`)}
                className="w-full text-left px-4 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: '#C2410C', color: '#C2410C' }}>
                <BarChart3 className="w-4 h-4" /> Outstanding Report
              </button>
              <button
                onClick={() => router.push('/properties')}
                className="w-full text-left px-4 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-500 border-gray-200">
                <ArrowLeft className="w-4 h-4" /> All Properties
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
