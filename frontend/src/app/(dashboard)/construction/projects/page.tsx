'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { CardGridSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette } from '@/utils/brand';
import {
  Plus, Search, ChevronRight, Calendar, AlertTriangle,
  HardHat, TrendingUp, CheckCircle2, PauseCircle,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PLANNING:    { label: 'Planning',    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  ON_HOLD:     { label: 'On Hold',     bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  COMPLETED:   { label: 'Completed',   bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  CANCELLED:   { label: 'Cancelled',   bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
};

export default function ConstructionProjectsPage() {
  const router = useRouter();
  const [projects, setProjects]     = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [searchTerm, setSearchTerm]         = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [projData, propsData] = await Promise.all([
        api.get('/construction-projects'),
        api.get('/properties'),
      ]);
      setProjects(Array.isArray(projData) ? projData : (projData?.data || []));
      setProperties(Array.isArray(propsData) ? propsData : (propsData?.data || []));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmtCur = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);
  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  const filteredProjects = projects.filter(p => {
    const matchesProperty = !filterProperty || p.propertyId === filterProperty;
    const matchesStatus   = !filterStatus   || p.status === filterStatus;
    const propertyName    = p.property?.name || '';
    const matchesSearch   = !searchTerm     ||
      p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesStatus && matchesSearch;
  });

  const stats = {
    total:     projects.length,
    active:    projects.filter(p => p.status === 'IN_PROGRESS').length,
    planning:  projects.filter(p => p.status === 'PLANNING').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    onHold:    projects.filter(p => p.status === 'ON_HOLD').length,
  };

  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + Number(p.overallProgress || 0), 0) / projects.length)
    : 0;

  const hasFilters = !!(filterProperty || filterStatus || searchTerm);

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      {/* ── HERO ── */}
      <BrandHero
        eyebrow="Construction Projects"
        title={<>Manage every project, <span style={{ color: brandPalette.accent }}>start to finish</span></>}
        description="Track timelines, budgets, progress, and teams across all your construction projects in one unified view."
        actions={
          <BrandPrimaryButton onClick={() => router.push('/construction/projects/new')}>
            <Plus className="w-4 h-4" /> New Project
          </BrandPrimaryButton>
        }
      />

      {/* ── STAT CARDS ── */}
      {!loading && (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <BrandStatCard
            title="Total Projects"
            primary={String(stats.total)}
            subLabel={`${stats.active} currently active`}
            icon={<HardHat className="w-7 h-7 text-white" />}
            accentColor={brandPalette.primary}
          />
          <BrandStatCard
            title="Avg Progress"
            primary={`${avgProgress}%`}
            subLabel={`${stats.completed} completed`}
            icon={<TrendingUp className="w-7 h-7 text-white" />}
            accentColor="rgba(61,163,93,0.85)"
          />
          <BrandStatCard
            title="Planning"
            primary={String(stats.planning)}
            subLabel={`${stats.onHold} on hold`}
            icon={<PauseCircle className="w-7 h-7 text-white" />}
            accentColor={brandPalette.accent}
          />
          <BrandStatCard
            title="Completed"
            primary={String(stats.completed)}
            subLabel={`out of ${stats.total} total`}
            icon={<CheckCircle2 className="w-7 h-7 text-white" />}
            accentColor="rgba(124,58,237,0.85)"
          />
        </section>
      )}

      {/* ── FILTERS ── */}
      <div
        className="bg-white rounded-2xl border shadow-sm p-5"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B] focus:border-transparent"
            />
          </div>

          <select
            value={filterProperty}
            onChange={e => setFilterProperty(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearchTerm(''); setFilterProperty(''); setFilterStatus(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50 whitespace-nowrap"
              style={{ color: brandPalette.secondary, borderColor: brandPalette.neutral }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── PROJECT LIST ── */}
      {loading ? (
        <div className="p-4"><CardGridSkeleton cards={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" /></div>
      ) : filteredProjects.length === 0 ? (
        <div
          className="bg-white rounded-3xl border shadow-sm py-16 text-center"
          style={{ borderColor: `${brandPalette.neutral}80` }}
        >
          <div className="text-5xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            {projects.length === 0
              ? 'Create your first project to get started.'
              : 'Try adjusting or clearing your filters.'}
          </p>
          {projects.length === 0 && (
            <BrandPrimaryButton onClick={() => router.push('/construction/projects/new')}>
              <Plus className="w-4 h-4" /> Create First Project
            </BrandPrimaryButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map(project => {
            const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.PLANNING;
            const budget    = Number(project.budgetAllocated) || 0;
            const spent     = Number(project.budgetSpent) || 0;
            const budgetPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            const daysLeft  = project.expectedCompletionDate
              ? Math.ceil((new Date(project.expectedCompletionDate).getTime() - Date.now()) / 86400000)
              : null;
            const isDelayed = daysLeft !== null && daysLeft < 0 && project.status !== 'COMPLETED';
            const progress  = Number(project.overallProgress) || 0;

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/construction/projects/${project.id}`)}
                className="group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}80` }}
              >
                {/* Card top progress bar */}
                <div className="h-1.5 w-full bg-gray-100">
                  <div
                    className="h-1.5 transition-all"
                    style={{ width: `${progress}%`, backgroundColor: brandPalette.primary }}
                  />
                </div>

                <div className="p-6">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#A8211B] transition-colors line-clamp-1 text-base">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {project.property?.name || 'No property'}{project.tower ? ` · ${project.tower.name}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        {statusCfg.label}
                      </span>
                      {isDelayed && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Delayed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Overall Progress</span>
                      <span className="font-semibold" style={{ color: brandPalette.primary }}>{progress}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: brandPalette.primary }} />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Budget Spent</span>
                      <span className="font-semibold text-gray-700">{fmtCur(spent)} / {fmtCur(budget)}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${budgetPct}%`,
                          backgroundColor: budgetPct > 90 ? '#DC2626' : budgetPct > 75 ? '#D97706' : '#16A34A',
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {fmt(project.startDate)}
                    </span>
                    {project.projectManager && (
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        👤 {project.projectManager.fullName}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#A8211B] transition-colors shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2 text-center text-sm text-gray-400">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>
    </div>
  );
}
