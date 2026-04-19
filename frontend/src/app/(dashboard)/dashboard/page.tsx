'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Home, Users, IndianRupee, TrendingUp,
  Package, AlertTriangle, CheckCircle2, ArrowRight,
  Loader2, TrendingDown, BarChart3, RefreshCw,
  CalendarDays, BookOpen, UserPlus, Plus,
} from 'lucide-react';
import { reportsService, DashboardSummary } from '@/services/reports.service';
import { useAuthStore } from '@/store/authStore';
import { usePropertyStore } from '@/store/propertyStore';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/Skeletons';

// ── helpers ───────────────────────────────────────────────────────────────────

const brandRed  = '#A8211B';
const brandDark = '#7B1E12';
const brandGold = '#F2C94C';

const fmt = (n: number) =>
  '₹' + Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const fmtCr = (n: number) => {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)} L`;
  return fmt(n);
};

const fmtDate = (s: string) => {
  if (!s || s === '-') return '-';
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
};

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Cash', CHEQUE: 'Cheque', BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI', CARD: 'Card', OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:          '#16a34a',
  BOOKED:             '#d97706',
  SOLD:               '#A8211B',
  ON_HOLD:            '#6b7280',
  UNDER_CONSTRUCTION: '#2563eb',
  BLOCKED:            '#9333ea',
};

// ── sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, color, onClick,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 flex items-start gap-4 shadow-sm transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold mt-0.5 truncate" style={{ color: brandDark }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold mb-3" style={{ color: brandDark }}>
      {children}
    </h2>
  );
}

// ── Donut chart (pure CSS) ────────────────────────────────────────────────────
function StatusDonut({ breakdown, total }: { breakdown: Record<string, number>; total: number }) {
  if (!total) return <p className="text-sm text-gray-400 text-center py-6">No unit data yet</p>;

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  let cumulative = 0;

  const segments = entries.map(([status, count]) => {
    const pct = (count / total) * 100;
    const color = STATUS_COLORS[status] ?? '#9ca3af';
    const start = cumulative;
    cumulative += pct;
    return { status, count, pct, color, start };
  });

  // Build conic-gradient
  const gradient = segments
    .map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(', ');

  return (
    <div className="flex items-center gap-6">
      <div
        className="shrink-0 rounded-full"
        style={{
          width: 96, height: 96,
          background: `conic-gradient(${gradient})`,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center bg-white"
          style={{ width: 64, height: 64, margin: '16px auto' }}
        >
          <span className="text-xs font-bold" style={{ color: brandDark }}>{total}</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        {segments.map(s => (
          <div key={s.status} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-600 truncate flex-1">{s.status.replace('_', ' ')}</span>
            <span className="text-xs font-semibold text-gray-800">{s.count}</span>
            <span className="text-xs text-gray-400">({s.pct.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router  = useRouter();
  const { user } = useAuthStore();
  const { selectedProperties } = usePropertyStore();
  const selectedPropertyId =
    selectedProperties.length > 0 ? selectedProperties[0] : undefined;
  const [data, setData]       = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const d = await reportsService.getDashboard({
        propertyId: selectedPropertyId,
      });
      setData(d);
    } catch {
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [selectedPropertyId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user
    ? `${(user as any).firstName ?? (user as any).username ?? ''}`.trim() || 'there'
    : 'there';

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <p className="text-gray-700">Could not load dashboard data.</p>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium"
          onClick={() => {
            setLoading(true);
            load();
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const d = data;

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full min-w-0 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: brandDark }}>
            {greeting()}, {userName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening at Eastern Estate today.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Row 1: Financial KPIs ── */}
      <div>
        <SectionTitle>💰 Financial Overview</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Agreement Value"
            value={fmtCr(d.totalAgreementValue)}
            sub={`${d.activeBookings} active booking${d.activeBookings !== 1 ? 's' : ''}`}
            icon={BookOpen}
            color={brandRed}
            onClick={() => router.push('/reports/outstanding')}
          />
          <KpiCard
            label="Total Collected"
            value={fmtCr(d.totalCollected)}
            sub="All time, non-cancelled"
            icon={IndianRupee}
            color="#16a34a"
            onClick={() => router.push('/reports/collection')}
          />
          <KpiCard
            label="Outstanding Balance"
            value={fmtCr(d.totalOutstanding)}
            sub={d.overdueMilestoneUnits > 0 ? `${d.overdueMilestoneUnits} unit${d.overdueMilestoneUnits > 1 ? 's' : ''} overdue` : 'All on track'}
            icon={TrendingDown}
            color={d.overdueMilestoneUnits > 0 ? '#dc2626' : '#6b7280'}
          />
          <KpiCard
            label="This Month's Collection"
            value={fmtCr(d.thisMonthCollection)}
            sub={`${d.thisMonthPaymentCount} payment${d.thisMonthPaymentCount !== 1 ? 's' : ''} recorded`}
            icon={CalendarDays}
            color={brandGold}
            onClick={() => router.push('/reports/collection')}
          />
        </div>
      </div>

      {/* ── Row 2: Inventory KPIs ── */}
      <div>
        <SectionTitle>🏢 Inventory Overview</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Units"
            value={String(d.totalFlats)}
            sub={`₹${(d.totalInventoryValue / 1_00_00_000).toFixed(1)} Cr total value`}
            icon={Package}
            color={brandDark}
            onClick={() => router.push('/reports/inventory')}
          />
          <KpiCard
            label="Available"
            value={String(d.availableFlats)}
            sub={`${d.availablePercent}% of stock`}
            icon={Home}
            color="#16a34a"
            onClick={() => router.push('/reports/inventory')}
          />
          <KpiCard
            label="Booked"
            value={String(d.bookedFlats)}
            icon={CheckCircle2}
            color="#d97706"
          />
          <KpiCard
            label="Sold"
            value={String(d.soldFlats)}
            icon={TrendingUp}
            color={brandRed}
          />
          <KpiCard
            label="On Hold"
            value={String(d.onHoldFlats)}
            icon={AlertTriangle}
            color="#6b7280"
          />
        </div>
      </div>

      {/* ── Row 3: CRM KPIs ── */}
      <div>
        <SectionTitle>🤝 CRM at a Glance</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Customers"
            value={String(d.totalCustomers)}
            icon={Users}
            color="#7c3aed"
            onClick={() => router.push('/customers')}
          />
          <KpiCard
            label="Active Bookings"
            value={String(d.activeBookings)}
            icon={BookOpen}
            color={brandRed}
            onClick={() => router.push('/bookings')}
          />
          <KpiCard
            label="Active Leads"
            value={String(d.activeLeads)}
            icon={TrendingUp}
            color="#0891b2"
            onClick={() => router.push('/leads')}
          />
          <KpiCard
            label="Overdue Units"
            value={String(d.overdueMilestoneUnits)}
            sub={d.overdueMilestoneUnits > 0 ? 'Needs attention' : 'All clear ✓'}
            icon={AlertTriangle}
            color={d.overdueMilestoneUnits > 0 ? '#dc2626' : '#16a34a'}
            onClick={d.overdueMilestoneUnits > 0 ? () => router.push('/reports/outstanding') : undefined}
          />
        </div>
      </div>

      {/* ── Row 4: Charts + Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Unit Status Donut */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Unit Status</SectionTitle>
            <button
              onClick={() => router.push('/reports/inventory')}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: brandRed }}
            >
              Full report <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <StatusDonut breakdown={d.statusBreakdown} total={d.totalFlats} />
        </div>

        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Recent Payments</SectionTitle>
            <button
              onClick={() => router.push('/payments')}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: brandRed }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {d.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <IndianRupee className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {d.recentPayments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/payments/${p.id}`)}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <IndianRupee className="h-4 w-4 text-green-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.customerName}</p>
                      <p className="text-xs text-gray-400 truncate">{p.property} · {p.flatNumber}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-700">{fmt(p.amount)}</p>
                    <p className="text-xs text-gray-400">{fmtDate(p.paymentDate)} · {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 5: Overdue alerts ── */}
      {d.overdueUnits.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <SectionTitle>⚠️ Overdue Milestones - Needs Follow-up</SectionTitle>
            </div>
            <button
              onClick={() => router.push('/reports/outstanding')}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: brandRed }}
            >
              Full report <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 pr-4 font-medium text-gray-500 text-xs uppercase">Customer</th>
                  <th className="pb-2 pr-4 font-medium text-gray-500 text-xs uppercase">Unit</th>
                  <th className="pb-2 pr-4 font-medium text-gray-500 text-xs uppercase">Outstanding</th>
                  <th className="pb-2 pr-4 font-medium text-gray-500 text-xs uppercase">Overdue Since</th>
                  <th className="pb-2 font-medium text-gray-500 text-xs uppercase">Milestones</th>
                </tr>
              </thead>
              <tbody>
                {d.overdueUnits.map((u, i) => (
                  <tr
                    key={i}
                    onClick={() => router.push(`/ledger/${u.bookingId}`)}
                    className="border-b last:border-0 hover:bg-red-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{u.customerName}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{u.property} · {u.flatNumber}</td>
                    <td className="py-2.5 pr-4 font-bold text-red-600">{fmt(u.outstanding)}</td>
                    <td className="py-2.5 pr-4">
                      {u.overdueDays != null ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {u.overdueDays}d ago
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {u.overdueMilestones} overdue
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Row 6: Quick Actions ── */}
      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#e5e7eb' }}>
        <SectionTitle>⚡ Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'New Booking',   icon: BookOpen,    href: '/bookings/new',    color: brandRed   },
            { label: 'New Customer',  icon: UserPlus,    href: '/customers/new',   color: '#7c3aed'  },
            { label: 'New Lead',      icon: TrendingUp,  href: '/leads/new',       color: '#0891b2'  },
            { label: 'New Payment',   icon: IndianRupee, href: '/payments/new',    color: '#16a34a'  },
            { label: 'Add Property',  icon: Building2,   href: '/properties/new',  color: brandDark  },
          ].map(({ label, icon: Icon, href, color }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
            >
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Brand Footer ── */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${brandRed} 0%, ${brandDark} 100%)` }}
      >
        <p className="text-white text-base font-semibold">Life Long Bonding</p>
        <p className="text-white/80 text-sm mt-1">
          Luxury at Affordable Prices · Life Long Bonding... · Creating a Lifestyle That Lasts a Lifetime
        </p>
      </div>

    </div>
  );
}
