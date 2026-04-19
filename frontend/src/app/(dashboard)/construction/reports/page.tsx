'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, brandGradient, formatToCrore } from '@/utils/brand';
import {
  BarChart3, TrendingUp, Users, CheckCircle2, AlertTriangle,
  ChevronRight, ArrowLeft, Download, RefreshCw,
} from 'lucide-react';

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'budget',     label: 'Budget vs Actual',    icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'ctc',        label: 'Cost-to-Complete',     icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'vendor',     label: 'Vendor Spend',         icon: <ChevronRight className="w-4 h-4" /> },
  { id: 'labour',     label: 'Labour Productivity',  icon: <Users className="w-4 h-4" /> },
  { id: 'qc',         label: 'QC Pass Rate',         icon: <CheckCircle2 className="w-4 h-4" /> },
];

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-green-100 text-green-700',
  PLANNING:    'bg-blue-100 text-blue-700',
  ON_HOLD:     'bg-yellow-100 text-yellow-700',
  COMPLETED:   'bg-purple-100 text-purple-700',
  CANCELLED:   'bg-red-100 text-red-600',
};

const fmtCur = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmt = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

// ── Bar component ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = '#A8211B' }: { pct: number; color?: string }) {
  const p = Math.min(100, Math.max(0, pct));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className="h-2 rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: color }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ConstructionReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab]   = useState('budget');
  const [loading, setLoading]       = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Dashboard summary
  const [summary, setSummary] = useState<any>(null);

  // Tab data
  const [budgetData,  setBudgetData]  = useState<any>(null);
  const [ctcData,     setCtcData]     = useState<any>(null);
  const [vendorData,  setVendorData]  = useState<any>(null);
  const [labourData,  setLabourData]  = useState<any>(null);
  const [qcData,      setQcData]      = useState<any>(null);
  const [tabErrors,   setTabErrors]   = useState<Record<string, string>>({});
  const [dashError,   setDashError]   = useState('');

  // Vendor date filters
  const [vendorFrom, setVendorFrom] = useState('');
  const [vendorTo,   setVendorTo]   = useState('');

  useEffect(() => {
    loadDashboard();
    loadTab('budget');
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.get('/construction/reports');
      setSummary(data);
      setDashError('');
    } catch (e: any) {
      setDashError(e?.response?.data?.message || e?.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  const loadTab = useCallback(async (tab: string) => {
    setTabLoading(true);
    setTabErrors(prev => ({ ...prev, [tab]: '' }));
    try {
      switch (tab) {
        case 'budget':
          setBudgetData(await api.get('/construction/reports/budget'));
          break;
        case 'ctc':
          setCtcData(await api.get('/construction/reports/cost-to-complete'));
          break;
        case 'vendor': {
          const params = new URLSearchParams();
          if (vendorFrom) params.append('startDate', vendorFrom);
          if (vendorTo)   params.append('endDate',   vendorTo);
          setVendorData(await api.get(`/construction/reports/vendor-spend?${params}`));
          break;
        }
        case 'labour':
          setLabourData(await api.get('/construction/reports/labour'));
          break;
        case 'qc':
          setQcData(await api.get('/construction/reports/qc'));
          break;
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || `Failed to load ${tab} report`;
      setTabErrors(prev => ({ ...prev, [tab]: msg }));
    } finally {
      setTabLoading(false);
    }
  }, [vendorFrom, vendorTo]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  const printPage = () => window.print();

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}>

      {/* ── HERO ── */}
      <BrandHero
        eyebrow="Construction Reports"
        title={<>Data-driven decisions, <span style={{ color: brandPalette.accent }}>every project</span></>}
        description="Budget vs actual, cost-to-complete projections, vendor spend analysis, labour productivity, and QC pass rates - all in one place."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/construction')}>
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </BrandPrimaryButton>
            <button
              onClick={printPage}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 rounded-full text-sm font-semibold transition-all hover:bg-white"
              style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
            >
              <Download className="w-4 h-4" /> Print / Export
            </button>
          </>
        }
      />

      {/* ── SUMMARY STAT CARDS ── */}
      {!loading && dashError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Dashboard summary failed to load: {dashError}</span>
          <button onClick={loadDashboard} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}
      {!loading && summary && (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <BrandStatCard
            title="Total Allocated"
            primary={formatToCrore(summary.budget?.totalAllocated)}
            subLabel={`${summary.budget?.projectCount || 0} projects tracked`}
            icon={<BarChart3 className="w-7 h-7 text-white" />}
            accentColor={brandPalette.primary}
          />
          <BrandStatCard
            title="Total Spent"
            primary={formatToCrore(summary.budget?.totalSpent)}
            subLabel={`${summary.budget?.overBudgetCount || 0} project${summary.budget?.overBudgetCount !== 1 ? 's' : ''} over budget`}
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            accentColor={summary.budget?.overBudgetCount > 0 ? '#DC2626' : '#16A34A'}
          />
          <BrandStatCard
            title="At-Risk Projects"
            primary={String(summary.costToComplete?.atRiskCount ?? '-')}
            subLabel={`${summary.costToComplete?.onTrackCount || 0} on track`}
            icon={<AlertTriangle className="w-7 h-7 text-white" />}
            accentColor={summary.costToComplete?.atRiskCount > 0 ? '#D97706' : '#16A34A'}
          />
          <BrandStatCard
            title="QC Pass Rate"
            primary={`${summary.qc?.overallPassRate ?? 0}%`}
            subLabel={`${summary.qc?.totalOpenDefects || 0} open defect${summary.qc?.totalOpenDefects !== 1 ? 's' : ''}`}
            icon={<CheckCircle2 className="w-7 h-7 text-white" />}
            accentColor={
              (summary.qc?.overallPassRate ?? 0) >= 80 ? '#16A34A' :
              (summary.qc?.overallPassRate ?? 0) >= 60 ? '#D97706' : '#DC2626'
            }
          />
        </section>
      )}

      {/* ── TABS + CONTENT ── */}
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: `${brandPalette.neutral}80` }}>

        {/* Tab bar */}
        <div className="border-b overflow-x-auto" style={{ borderColor: `${brandPalette.neutral}80` }}>
          <div className="flex px-2 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#A8211B] text-[#A8211B] bg-red-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {tabLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading report data…</span>
            </div>
          ) : tabErrors[activeTab] ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-700 font-medium mb-1">Failed to load this report</p>
              <p className="text-red-500 text-sm mb-4">{tabErrors[activeTab]}</p>
              <button
                onClick={() => loadTab(activeTab)}
                className="px-4 py-2 text-sm text-white rounded-xl font-medium"
                style={{ backgroundColor: '#A8211B' }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>

              {/* ══ TAB 1: BUDGET VS ACTUAL ══════════════════════════════════ */}
              {activeTab === 'budget' && budgetData && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg" style={{ color: brandPalette.primary }}>Budget vs Actual - All Projects</h2>
                  </div>

                  {/* Totals strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Allocated', value: fmtCur(budgetData.totals?.totalAllocated),  color: 'text-gray-900' },
                      { label: 'Total Spent',     value: fmtCur(budgetData.totals?.totalSpent),      color: 'text-red-600' },
                      { label: 'Total Variance',  value: fmtCur(Math.abs(budgetData.totals?.totalVariance)), color: budgetData.totals?.totalVariance >= 0 ? 'text-green-600' : 'text-red-600' },
                      { label: 'Over Budget',     value: `${budgetData.totals?.overBudgetCount || 0} projects`, color: 'text-orange-600' },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border px-5 py-4" style={{ borderColor: `${brandPalette.neutral}80` }}>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  {budgetData.rows?.length === 0 ? (
                    <EmptyState icon="📊" message="No project budget data found." />
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: `${brandPalette.neutral}80` }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b" style={{ borderColor: `${brandPalette.neutral}80` }}>
                            {['Project', 'Property', 'Status', 'Progress', 'Allocated', 'Spent', 'Variance', 'Utilisation'].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {budgetData.rows.map((row: any) => (
                            <tr
                              key={row.id}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => router.push(`/construction/projects/${row.id}`)}
                            >
                              <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px] truncate">{row.projectName}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{row.propertyName}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {row.status?.replace(/_/g,' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 min-w-[100px]">
                                <div className="flex items-center gap-2">
                                  <ProgressBar pct={row.overallProgress} />
                                  <span className="text-xs font-bold w-8 text-right" style={{ color: brandPalette.primary }}>{row.overallProgress}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700 font-medium">{fmtCur(row.budgetAllocated)}</td>
                              <td className="px-4 py-3 font-medium" style={{ color: brandPalette.primary }}>{fmtCur(row.budgetSpent)}</td>
                              <td className={`px-4 py-3 font-semibold ${row.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                {row.isOverBudget ? '−' : '+'}{fmtCur(Math.abs(row.variance))}
                              </td>
                              <td className="px-4 py-3 min-w-[100px]">
                                <div className="flex items-center gap-2">
                                  <ProgressBar pct={row.utilizationPct} color={row.isOverBudget ? '#DC2626' : row.utilizationPct > 80 ? '#D97706' : '#16A34A'} />
                                  <span className="text-xs font-bold w-10 text-right">{row.utilizationPct}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB 2: COST-TO-COMPLETE ══════════════════════════════════ */}
              {activeTab === 'ctc' && ctcData && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-bold text-lg mb-1" style={{ color: brandPalette.primary }}>Cost-to-Complete Projection</h2>
                    <p className="text-sm text-gray-500">Estimated final cost based on current burn rate vs budget. Projects with projected overrun are flagged as At Risk.</p>
                  </div>

                  {/* Summary strip */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { label: 'Total Estimated Cost', value: fmtCur(ctcData.summary?.totalEstimatedCost), color: 'text-gray-900' },
                      { label: 'Cost to Complete',     value: fmtCur(ctcData.summary?.totalCostToComplete), color: 'text-blue-600' },
                      { label: 'Projected Overrun',    value: fmtCur(ctcData.summary?.totalProjectedOverrun), color: ctcData.summary?.totalProjectedOverrun > 0 ? 'text-red-600' : 'text-green-600' },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border px-5 py-4" style={{ borderColor: `${brandPalette.neutral}80` }}>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {ctcData.rows?.length === 0 ? (
                    <EmptyState icon="📈" message="No project data available." />
                  ) : (
                    <div className="space-y-4">
                      {ctcData.rows.map((row: any) => (
                        <div
                          key={row.id}
                          className={`rounded-2xl border-2 p-5 cursor-pointer hover:shadow-sm transition-all ${row.isAtRisk ? 'border-red-200 bg-red-50/40' : 'border-gray-100 bg-white'}`}
                          onClick={() => router.push(`/construction/projects/${row.id}`)}
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-900">{row.projectName}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {row.status?.replace(/_/g,' ')}
                                </span>
                                {row.isAtRisk && (
                                  <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    <AlertTriangle className="w-3 h-3" /> At Risk
                                  </span>
                                )}
                                {row.isOnTrack && !row.isAtRisk && (
                                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> On Track
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{row.propertyName}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-gray-400">Days left</p>
                              <p className={`font-bold text-lg ${row.daysLeft !== null && row.daysLeft < 0 ? 'text-red-600' : row.daysLeft !== null && row.daysLeft < 30 ? 'text-yellow-600' : 'text-gray-700'}`}>
                                {row.daysLeft === null ? '-' : row.daysLeft < 0 ? `${Math.abs(row.daysLeft)}d OVER` : `${row.daysLeft}d`}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Progress</p>
                              <div className="flex items-center gap-2">
                                <ProgressBar pct={row.overallProgress} />
                                <span className="font-bold text-xs w-8 text-right" style={{ color: brandPalette.primary }}>{row.overallProgress}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Allocated</p>
                              <p className="font-semibold text-gray-900">{fmtCur(row.budgetAllocated)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Estimated Final</p>
                              <p className={`font-semibold ${row.isAtRisk ? 'text-red-600' : 'text-gray-900'}`}>{fmtCur(row.estimatedTotal)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Projected Overrun</p>
                              <p className={`font-bold ${row.projectedOverrun > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {row.projectedOverrun > 0 ? '+' : ''}{fmtCur(row.projectedOverrun)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB 3: VENDOR SPEND ══════════════════════════════════════ */}
              {activeTab === 'vendor' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-bold text-lg" style={{ color: brandPalette.primary }}>Vendor Spend Summary</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Total amount billed and paid per vendor across all RA Bills.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input type="date" value={vendorFrom} onChange={e => setVendorFrom(e.target.value)}
                        className="border rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="From" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="date" value={vendorTo} onChange={e => setVendorTo(e.target.value)}
                        className="border rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="To" />
                      <button
                        onClick={() => loadTab('vendor')}
                        className="px-4 py-2 text-sm text-white rounded-xl font-medium"
                        style={{ backgroundColor: brandPalette.primary }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {!vendorData ? (
                    <EmptyState icon="🤝" message="Loading vendor data…" />
                  ) : vendorData.rows?.length === 0 ? (
                    <EmptyState icon="🤝" message="No vendor bills found for the selected period." />
                  ) : (
                    <>
                      {/* Totals */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                          { label: 'Total Gross',      value: fmtCur(vendorData.totals?.totalGross),      color: 'text-gray-900' },
                          { label: 'Total Net Payable',value: fmtCur(vendorData.totals?.totalNetPayable), color: 'text-gray-900' },
                          { label: 'Total Paid',       value: fmtCur(vendorData.totals?.totalPaid),       color: 'text-green-600' },
                          { label: 'Retention Held',   value: fmtCur(vendorData.totals?.totalRetention),  color: 'text-orange-600' },
                        ].map(s => (
                          <div key={s.label} className="rounded-2xl border px-5 py-4" style={{ borderColor: `${brandPalette.neutral}80` }}>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: `${brandPalette.neutral}80` }}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b" style={{ borderColor: `${brandPalette.neutral}80` }}>
                              {['Vendor', 'Code', 'Bills', 'Gross Amount', 'Net Payable', 'Paid', 'Retention', 'Projects'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {vendorData.rows.map((row: any, i: number) => (
                              <tr key={row.vendorId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2 ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                                    {i + 1}
                                  </span>
                                  {row.vendorName}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{row.vendorCode}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{row.billCount}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{fmtCur(row.totalGross)}</td>
                                <td className="px-4 py-3 font-semibold text-gray-900">{fmtCur(row.totalNetPayable)}</td>
                                <td className="px-4 py-3 font-semibold text-green-600">{fmtCur(row.totalPaid)}</td>
                                <td className="px-4 py-3 text-orange-600">{fmtCur(row.totalRetention)} <span className="text-xs text-gray-400">({row.retentionPct}%)</span></td>
                                <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px]">
                                  {row.projectNames?.join(', ') || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-bold bg-gray-50 border-t-2" style={{ borderColor: `${brandPalette.neutral}80` }}>
                              <td className="px-4 py-3" colSpan={3}>TOTAL ({vendorData.totals?.vendorCount} vendors)</td>
                              <td className="px-4 py-3">{fmtCur(vendorData.totals?.totalGross)}</td>
                              <td className="px-4 py-3">{fmtCur(vendorData.totals?.totalNetPayable)}</td>
                              <td className="px-4 py-3 text-green-600">{fmtCur(vendorData.totals?.totalPaid)}</td>
                              <td className="px-4 py-3 text-orange-600">{fmtCur(vendorData.totals?.totalRetention)}</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ══ TAB 4: LABOUR PRODUCTIVITY ═══════════════════════════════ */}
              {activeTab === 'labour' && labourData && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-bold text-lg" style={{ color: brandPalette.primary }}>Labour Productivity</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Average workers on site per day vs progress achieved, per project.</p>
                  </div>

                  {labourData.rows?.length === 0 ? (
                    <EmptyState icon="👷" message="No progress logs recorded yet." />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                        {labourData.rows.map((row: any) => (
                          <div key={row.projectId} className="rounded-2xl border p-5" style={{ borderColor: `${brandPalette.neutral}80` }}>
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{row.projectName}</h3>
                            <p className="text-xs text-gray-500 mb-4">{row.logCount} log{row.logCount !== 1 ? 's' : ''} recorded</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs text-blue-500 mb-1">Avg Workers/Day</p>
                                <p className="text-2xl font-bold text-blue-700">{row.avgWorkersPerDay}</p>
                              </div>
                              <div className="bg-green-50 rounded-xl p-3">
                                <p className="text-xs text-green-500 mb-1">Avg Progress/Day</p>
                                <p className="text-2xl font-bold text-green-700">{row.avgProgressPerDay}%</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-400 mb-1">Day/Night Split</p>
                                <p className="font-semibold text-gray-700 text-sm">☀️ {row.dayShiftCount} / 🌙 {row.nightShiftCount}</p>
                              </div>
                              <div className={`rounded-xl p-3 ${row.issueRate > 30 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <p className="text-xs text-gray-400 mb-1">Issue Rate</p>
                                <p className={`font-semibold text-sm ${row.issueRate > 30 ? 'text-red-600' : 'text-gray-700'}`}>{row.issueRate}% days</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Recent log history */}
                      {labourData.logHistory?.length > 0 && (
                        <div>
                          <h3 className="font-bold text-base mb-4" style={{ color: brandPalette.secondary }}>Recent Daily Logs</h3>
                          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: `${brandPalette.neutral}80` }}>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50 border-b" style={{ borderColor: `${brandPalette.neutral}80` }}>
                                  {['Date', 'Project', 'Shift', 'Present', 'Absent', 'Progress', 'Issues'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {labourData.logHistory.map((log: any) => (
                                  <tr key={log.id} className={log.hasIssues ? 'bg-orange-50/40' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-3 text-gray-500">{fmt(log.logDate)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{log.projectName || '-'}</td>
                                    <td className="px-4 py-3">{log.shift === 'DAY' ? '☀️ Day' : log.shift === 'NIGHT' ? '🌙 Night' : '-'}</td>
                                    <td className="px-4 py-3 font-semibold text-blue-600">{log.workersPresent}</td>
                                    <td className="px-4 py-3 text-gray-500">{log.workersAbsent}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <ProgressBar pct={log.progressPct} />
                                        <span className="text-xs font-bold w-8" style={{ color: brandPalette.primary }}>{log.progressPct}%</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {log.hasIssues
                                        ? <span className="text-xs text-orange-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Yes</span>
                                        : <span className="text-xs text-green-600">-</span>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ══ TAB 5: QC PASS RATE ═════════════════════════════════════ */}
              {activeTab === 'qc' && qcData && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-bold text-lg" style={{ color: brandPalette.primary }}>Quality Control - Pass Rate Analysis</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Phase-wise inspection results and defect tracking across all projects.</p>
                  </div>

                  {/* Summary strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Inspections', value: qcData.summary?.totalInspections, color: 'text-gray-900' },
                      { label: 'Pass',              value: qcData.summary?.totalPass,         color: 'text-green-600' },
                      { label: 'Fail / Partial',    value: (qcData.summary?.totalFail || 0) + (qcData.summary?.totalPartial || 0), color: 'text-red-600' },
                      { label: 'Open Defects',      value: qcData.summary?.totalOpenDefects, color: qcData.summary?.totalOpenDefects > 0 ? 'text-orange-600' : 'text-gray-500' },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border px-5 py-4" style={{ borderColor: `${brandPalette.neutral}80` }}>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
                      </div>
                    ))}
                  </div>

                  {/* Phase bars */}
                  <h3 className="font-bold text-base mb-4" style={{ color: brandPalette.secondary }}>Phase-wise Pass Rate</h3>
                  <div className="space-y-3 mb-8">
                    {qcData.phaseRows?.map((p: any) => (
                      <div key={p.phase} className="rounded-2xl border p-5" style={{ borderColor: `${brandPalette.neutral}80` }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{{ FOUNDATION:'🪨', STRUCTURE:'🏗️', MEP:'⚡', FINISHING:'🎨', HANDOVER:'🔑' }[p.phase as string] || '📋'}</span>
                            <div>
                              <p className="font-bold text-gray-900">{p.phase}</p>
                              <p className="text-xs text-gray-500">{p.total} inspection{p.total !== 1 ? 's' : ''} · {p.openDefects} open defect{p.openDefects !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-600 font-semibold">✓ {p.pass} Pass</span>
                            <span className="text-red-500 font-semibold">✗ {p.fail} Fail</span>
                            {p.partial > 0 && <span className="text-orange-500 font-semibold">~ {p.partial} Partial</span>}
                            <span className="font-bold text-xl w-16 text-right" style={{ color: p.passRate >= 80 ? '#16A34A' : p.passRate >= 60 ? '#D97706' : '#DC2626' }}>
                              {p.passRate}%
                            </span>
                          </div>
                        </div>
                        <ProgressBar
                          pct={p.passRate}
                          color={p.passRate >= 80 ? '#16A34A' : p.passRate >= 60 ? '#D97706' : '#DC2626'}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Project breakdown */}
                  {qcData.projectRows?.length > 0 && (
                    <>
                      <h3 className="font-bold text-base mb-4" style={{ color: brandPalette.secondary }}>Project-wise QC Summary</h3>
                      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: `${brandPalette.neutral}80` }}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b" style={{ borderColor: `${brandPalette.neutral}80` }}>
                              {['Project', 'Inspections', 'Pass', 'Fail', 'Pass Rate', 'Open Defects'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide text-xs">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {qcData.projectRows.map((row: any) => (
                              <tr key={row.projectId} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/construction/projects/${row.projectId}`)}>
                                <td className="px-4 py-3 font-semibold text-gray-900">{row.projectName}</td>
                                <td className="px-4 py-3 text-gray-600">{row.total}</td>
                                <td className="px-4 py-3 text-green-600 font-medium">{row.pass}</td>
                                <td className="px-4 py-3 text-red-600 font-medium">{row.fail}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <ProgressBar pct={row.passRate} color={row.passRate >= 80 ? '#16A34A' : row.passRate >= 60 ? '#D97706' : '#DC2626'} />
                                    <span className="font-bold text-xs w-10 text-right">{row.passRate}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {row.openDefects > 0
                                    ? <span className="text-orange-600 font-semibold">{row.openDefects} open</span>
                                    : <span className="text-gray-400">None</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {qcData.summary?.totalInspections === 0 && (
                    <EmptyState icon="✅" message="No QC inspections recorded yet." />
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </div>

      <div className="pt-6 text-center text-sm text-gray-500">
        Eastern Estate ERP • Life Long Bonding...
      </div>
    </div>
  );
}

// ── Empty state helper ────────────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="py-16 text-center rounded-2xl border-2 border-dashed border-gray-200">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}
