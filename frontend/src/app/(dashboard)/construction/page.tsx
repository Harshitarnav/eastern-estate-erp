'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { DashboardSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatToCrore } from '@/utils/brand';
import {
  HardHat, Package, ShoppingCart, Users, AlertTriangle,
  TrendingUp, ChevronRight, Plus, BarChart3,
} from 'lucide-react';

const MODULE_CARDS = [
  { icon: '📋', label: 'Projects',        desc: 'Track all construction projects',       href: '/construction/projects',        color: 'blue' },
  { icon: '🧱', label: 'Materials',       desc: 'Monitor stock levels & inventory',      href: '/construction/materials',       color: 'orange' },
  { icon: '🛒', label: 'Purchase Orders', desc: 'Create & track material orders',        href: '/construction/purchase-orders', color: 'purple' },
  { icon: '🤝', label: 'Vendors',         desc: 'Manage suppliers & payments',           href: '/construction/vendors',         color: 'green' },
  { icon: '⚖️', label: 'RA Bills',        desc: 'Running account bills for contractors', href: '/construction/ra-bills',        color: 'amber' },
  { icon: '✅', label: 'Quality Control', desc: 'Phase inspections & defect tracking',   href: '/construction/quality',         color: 'teal' },
  { icon: '👥', label: 'Teams',           desc: 'Contractors, labour & in-house',        href: '/construction/teams',           color: 'indigo' },
  { icon: '📊', label: 'Daily Logs',      desc: 'Site diary – track work daily',         href: '/construction/progress',        color: 'red' },
  { icon: '📈', label: 'Reports',         desc: 'Budget, cost-to-complete, QC & more',   href: '/construction/reports',         color: 'pink' },
];

const COLOR_MAP: Record<string, { bg: string; hover: string; text: string; badge: string }> = {
  blue:   { bg: 'bg-blue-50',   hover: 'hover:border-blue-400',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-50', hover: 'hover:border-orange-400', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  purple: { bg: 'bg-purple-50', hover: 'hover:border-purple-400', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  green:  { bg: 'bg-green-50',  hover: 'hover:border-green-400',  text: 'text-green-600',  badge: 'bg-green-100 text-green-700' },
  amber:  { bg: 'bg-amber-50',  hover: 'hover:border-amber-400',  text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-700' },
  teal:   { bg: 'bg-teal-50',   hover: 'hover:border-teal-400',   text: 'text-teal-600',   badge: 'bg-teal-100 text-teal-700' },
  indigo: { bg: 'bg-indigo-50', hover: 'hover:border-indigo-400', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  red:    { bg: 'bg-red-50',    hover: 'hover:border-red-400',    text: 'text-red-600',    badge: 'bg-red-100 text-red-700' },
  pink:   { bg: 'bg-pink-50',   hover: 'hover:border-pink-400',   text: 'text-pink-600',   badge: 'bg-pink-100 text-pink-700' },
};

export default function ConstructionDashboard() {
  const router = useRouter();
  const [projects, setProjects]   = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [vendors, setVendors]     = useState<any[]>([]);
  const [purchaseOrders, setPOs]  = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [projData, matsData, vendsData, posData] = await Promise.all([
        api.get('/construction-projects').catch(() => []),
        api.get('/materials').catch(() => []),
        api.get('/vendors').catch(() => []),
        api.get('/purchase-orders').catch(() => []),
      ]);
      setProjects(Array.isArray(projData) ? projData : (projData?.data || []));
      setMaterials(Array.isArray(matsData) ? matsData : (matsData?.data || []));
      setVendors(Array.isArray(vendsData) ? vendsData : (vendsData?.data || []));
      setPOs(Array.isArray(posData) ? posData : (posData?.data || []));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmtCur = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');
  const avgProgress    = projects.length
    ? Math.round(projects.reduce((s, p) => s + Number(p.overallProgress || 0), 0) / projects.length)
    : 0;
  const lowStock       = materials.filter(m => (m.currentStock || 0) <= (m.minimumStockLevel || m.minimumStock || 0));
  const pendingPOs     = purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'PENDING_APPROVAL');
  const activeVendors  = vendors.filter(v => v.isActive);
  const totalBudget    = projects.reduce((s, p) => s + Number(p.budgetAllocated || 0), 0);
  const totalSpent     = projects.reduce((s, p) => s + Number(p.budgetSpent || 0), 0);

  if (loading) return <DashboardSkeleton />;

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      {/* ── HERO ── */}
      <BrandHero
        eyebrow="Construction Management Hub"
        title={<>Build smarter with <span style={{ color: brandPalette.accent }}>real-time visibility</span></>}
        description="Track projects, manage materials & vendors, control budgets, and keep quality standards — all in one place."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/construction/projects/new')}>
              <Plus className="w-4 h-4" /> New Project
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/construction/projects')}>
              <BarChart3 className="w-4 h-4" /> View All Projects
            </BrandSecondaryButton>
          </>
        }
      />

      {/* ── STAT CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Projects"
          primary={String(projects.length)}
          subLabel={`${activeProjects.length} currently active`}
          icon={<HardHat className="w-7 h-7 text-white" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Avg Progress"
          primary={`${avgProgress}%`}
          subLabel={`${projects.filter(p => p.status === 'COMPLETED').length} completed`}
          icon={<TrendingUp className="w-7 h-7 text-white" />}
          accentColor="rgba(61,163,93,0.85)"
        />
        <BrandStatCard
          title="Total Budget"
          primary={formatToCrore(totalBudget)}
          subLabel={`${formatToCrore(totalSpent)} spent · ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}% utilized`}
          icon={<BarChart3 className="w-7 h-7 text-white" />}
          accentColor="rgba(168,33,27,0.75)"
        />
        <BrandStatCard
          title="Materials"
          primary={String(materials.length)}
          subLabel={`${lowStock.length} low-stock alert${lowStock.length !== 1 ? 's' : ''}`}
          icon={<Package className="w-7 h-7 text-white" />}
          accentColor={lowStock.length > 0 ? '#D97706' : brandPalette.success}
        />
      </section>

      {/* ── ALERTS ── */}
      {(lowStock.length > 0 || pendingPOs.length > 0) && (
        <div className="rounded-2xl border-l-4 border-yellow-500 bg-yellow-50 px-6 py-5 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900 mb-1">Attention Required</p>
            <ul className="text-sm text-yellow-800 space-y-0.5">
              {lowStock.length > 0 && <li>• {lowStock.length} material{lowStock.length > 1 ? 's' : ''} running low on stock</li>}
              {pendingPOs.length > 0 && <li>• {pendingPOs.length} purchase order{pendingPOs.length > 1 ? 's' : ''} pending approval</li>}
            </ul>
          </div>
          <div className="flex gap-2 shrink-0">
            {lowStock.length > 0 && (
              <button onClick={() => router.push('/construction/materials')} className="text-xs px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-full font-medium transition">
                View Materials
              </button>
            )}
            {pendingPOs.length > 0 && (
              <button onClick={() => router.push('/construction/purchase-orders')} className="text-xs px-3 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-full font-medium transition">
                View Orders
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── ACTIVE PROJECTS ── */}
      <section className="bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: `${brandPalette.neutral}80` }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: `${brandPalette.neutral}80` }}>
          <h2 className="font-bold text-lg" style={{ color: brandPalette.secondary }}>Active Construction Projects</h2>
          <button
            onClick={() => router.push('/construction/projects')}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: brandPalette.primary }}
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🏗️</div>
            <p className="text-gray-500 mb-4">No active projects right now.</p>
            <button
              onClick={() => router.push('/construction/projects/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-full text-sm font-semibold"
              style={{ backgroundColor: brandPalette.primary }}
            >
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {activeProjects.slice(0, 6).map((project) => {
              const budget    = Number(project.budgetAllocated) || 0;
              const spent     = Number(project.budgetSpent) || 0;
              const budgetPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
              const progress  = Number(project.overallProgress) || 0;
              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/construction/projects/${project.id}`)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  {/* Progress accent bar */}
                  <div className="h-1 w-full rounded-full bg-gray-100 mb-4 overflow-hidden">
                    <div className="h-1 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: brandPalette.primary }} />
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#A8211B] transition-colors line-clamp-1 flex-1">{project.projectName}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#A8211B] shrink-0 mt-0.5 ml-2 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{project.property?.name || 'No property'}</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold" style={{ color: brandPalette.primary }}>{progress}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: brandPalette.primary }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Budget</span>
                        <span className="font-semibold text-gray-700">{fmtCur(spent)} / {fmtCur(budget)}</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${budgetPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── MODULE QUICK-LINKS ── */}
      <section>
        <h2 className="font-bold text-lg mb-4" style={{ color: brandPalette.secondary }}>Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_CARDS.map(({ icon, label, desc, href, color }) => {
            const cfg = COLOR_MAP[color];
            return (
              <button
                key={label}
                onClick={() => router.push(href)}
                className={`group relative bg-white rounded-2xl border-2 border-gray-100 ${cfg.hover} p-5 text-left transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center text-xl`}>
                    {icon}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-200 group-hover:${cfg.text} transition-colors mt-1`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5 text-sm">{label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── SUMMARY STATS STRIP ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'In Progress',   value: activeProjects.length,                                  color: 'text-green-600' },
          { label: 'Planning',      value: projects.filter(p => p.status === 'PLANNING').length,   color: 'text-blue-600' },
          { label: 'On Hold',       value: projects.filter(p => p.status === 'ON_HOLD').length,    color: 'text-yellow-600' },
          { label: 'Completed',     value: projects.filter(p => p.status === 'COMPLETED').length,  color: 'text-purple-600' },
          { label: 'Active Vendors',value: activeVendors.length,                                   color: 'text-green-600' },
          { label: 'Pending POs',   value: pendingPOs.length,                                      color: 'text-yellow-600' },
          { label: 'Low Stock',     value: lowStock.length,                                        color: lowStock.length > 0 ? 'text-red-600' : 'text-gray-600' },
          { label: 'Total Vendors', value: vendors.length,                                         color: 'text-gray-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border px-5 py-4 shadow-sm" style={{ borderColor: `${brandPalette.neutral}80` }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </section>

      {/* ── SECONDARY STAT ROW ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: `${brandPalette.neutral}80` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandPalette.primary}15` }}>
              <ShoppingCart className="w-5 h-5" style={{ color: brandPalette.primary }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Purchase Orders</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{purchaseOrders.length}</p>
          <p className="text-xs text-gray-500 mt-1">{pendingPOs.length} awaiting approval</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: `${brandPalette.neutral}80` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `rgba(61,163,93,0.1)` }}>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Vendors</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{vendors.length}</p>
          <p className="text-xs text-gray-500 mt-1">{activeVendors.length} currently active</p>
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: `${brandPalette.neutral}80` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `rgba(168,33,27,0.1)` }}>
              <Package className="w-5 h-5" style={{ color: brandPalette.primary }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Material Items</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{materials.length}</p>
          <p className={`text-xs mt-1 ${lowStock.length > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {lowStock.length > 0 ? `⚠ ${lowStock.length} below minimum stock` : 'All stock levels healthy'}
          </p>
        </div>
      </section>

      <div className="pt-2 text-center text-sm text-gray-400">
        Eastern Estate ERP • Life Long Bonding...
      </div>
    </div>
  );
}
