'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/services/api';
import { DetailSkeleton } from '@/components/Skeletons';
import AddProgressLogModal from '@/components/modals/AddProgressLogModal';
import {
  ArrowLeft, Edit, Trash2, Calendar, User, TrendingUp, Package,
  ClipboardList, Users, BarChart3, ShoppingCart, AlertTriangle,
} from 'lucide-react';
import { brandPalette, brandGradient, formatToCrore } from '@/utils/brand';

const PHASES = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'];
const PHASE_ICONS: Record<string, string> = {
  FOUNDATION: '🪨', STRUCTURE: '🏗️', MEP: '⚡', FINISHING: '🎨', HANDOVER: '🔑',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PLANNING:    { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  IN_PROGRESS: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  ON_HOLD:     { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  COMPLETED:   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  CANCELLED:   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  NOT_STARTED: { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200' },
};

const PO_STATUS_COLORS: Record<string, string> = {
  DRAFT:              'bg-gray-100 text-gray-600',
  PENDING_APPROVAL:   'bg-yellow-100 text-yellow-800',
  APPROVED:           'bg-blue-100 text-blue-800',
  ORDERED:            'bg-indigo-100 text-indigo-800',
  PARTIALLY_RECEIVED: 'bg-orange-100 text-orange-800',
  RECEIVED:           'bg-green-100 text-green-800',
  CANCELLED:          'bg-red-100 text-red-600',
};

const TABS = [
  { id: 'overview',        label: 'Overview',        icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'phases',          label: 'Phases',          icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'progress',        label: 'Daily Logs',      icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'materials',       label: 'Materials',       icon: <Package className="w-4 h-4" /> },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'teams',           label: 'Teams',           icon: <Users className="w-4 h-4" /> },
];

export default function ProjectDetailPage() {
  const router    = useRouter();
  const params    = useParams();
  const projectId = params.id as string;

  const [project, setProject]                   = useState<any>(null);
  const [loading, setLoading]                   = useState(true);
  const [activeTab, setActiveTab]               = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [progressLogs, setProgressLogs]     = useState<any[]>([]);
  const [materials, setMaterials]           = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [teams, setTeams]                   = useState<any[]>([]);
  const [towerProgress, setTowerProgress]   = useState<any[]>([]);
  const [tabLoading, setTabLoading]         = useState(false);

  useEffect(() => { if (projectId) loadProject(); }, [projectId]);
  useEffect(() => { if (!project) return; loadTabData(activeTab); }, [activeTab, project]);

  const loadProject = async () => {
    try {
      const data = await api.get(`/construction-projects/${projectId}`);
      setProject(data);
    } catch (e) {
      console.error('Failed to load project', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: string) => {
    setTabLoading(true);
    try {
      if (tab === 'progress') {
        const data = await api.get(`/construction-progress-logs?constructionProjectId=${projectId}`);
        setProgressLogs(Array.isArray(data) ? data : (data?.data || []));
      } else if (tab === 'materials') {
        const data = await api.get(`/material-exits?constructionProjectId=${projectId}`).catch(() => []);
        setMaterials(Array.isArray(data) ? data : (data?.data || []));
      } else if (tab === 'purchase-orders') {
        const data = await api.get(`/purchase-orders?constructionProjectId=${projectId}`).catch(() => []);
        setPurchaseOrders(Array.isArray(data) ? data : (data?.data || []));
      } else if (tab === 'teams') {
        const data = await api.get(`/construction-teams?constructionProjectId=${projectId}`).catch(() => []);
        setTeams(Array.isArray(data) ? data : (data?.data || []));
      } else if (tab === 'phases') {
        const data = await api.get(`/construction-projects/${projectId}/all-tower-progress`).catch(() => []);
        setTowerProgress(Array.isArray(data) ? data : (data?.data || []));
      }
    } catch (e) {
      console.error(`Failed to load tab ${tab}`, e);
    } finally {
      setTabLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/construction-projects/${projectId}`);
      router.push('/construction/projects');
    } catch {
      alert('Failed to delete project');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await api.patch(`/construction-projects/${projectId}`, { status: newStatus });
      setProject((p: any) => ({ ...p, status: newStatus }));
    } catch {
      alert('Failed to update status');
    }
  };

  const handleProgressUpdate = async (_phase: string, progress: number) => {
    try {
      await api.patch(`/construction-projects/${projectId}`, { overallProgress: progress });
      setProject((p: any) => ({ ...p, overallProgress: progress }));
    } catch {
      alert('Failed to update progress');
    }
  };

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtCur = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

  if (loading) return <DetailSkeleton sidebar={false} />;

  if (!project) {
    return (
      <div
        className="min-h-full flex items-center justify-center p-8"
        style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Project Not Found</h2>
          <p className="text-gray-500 mb-6">This project may have been deleted or you don't have access.</p>
          <button
            onClick={() => router.push('/construction/projects')}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold shadow-lg"
            style={{ backgroundColor: brandPalette.primary }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const budgetPct = project.budgetAllocated > 0
    ? Math.min((Number(project.budgetSpent) / Number(project.budgetAllocated)) * 100, 100)
    : 0;
  const daysLeft  = project.expectedCompletionDate
    ? Math.ceil((new Date(project.expectedCompletionDate).getTime() - Date.now()) / 86400000)
    : null;
  const isDelayed  = daysLeft !== null && daysLeft < 0 && project.status !== 'COMPLETED';
  const statusCfg  = STATUS_COLORS[project.status] || STATUS_COLORS.PLANNING;
  const progress   = Number(project.overallProgress) || 0;

  return (
    <div
      className="p-6 md:p-8 space-y-6 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      {/* ── HERO HEADER ── */}
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-10 text-white shadow-xl"
        style={{ background: brandGradient }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at top right, #F2C94C 0%, transparent 60%)' }} />

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/construction/projects')}
          className="relative inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Projects
        </button>

        <div className="relative flex flex-col lg:flex-row lg:items-start gap-6 justify-between">
          {/* Left: title + meta */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-white/15 backdrop-blur-sm">
              🏗️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{project.projectName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                  {project.status?.replace(/_/g, ' ')}
                </span>
                {isDelayed && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Delayed
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm flex flex-wrap gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  {project.propertyId ? (
                    <button
                      onClick={() => router.push(`/properties/${project.propertyId}`)}
                      className="hover:underline hover:text-white transition-colors"
                    >
                      {project.property?.name || 'View Property'}
                    </button>
                  ) : (
                    project.property?.name || 'No property assigned'
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  PM: {project.projectManager?.fullName || 'Not assigned'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Started {fmt(project.startDate)}
                </span>
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && (
              <select
                value={project.status}
                onChange={e => handleStatusUpdate(e.target.value)}
                className="px-3 py-2 text-sm border-2 border-white/30 bg-white/10 text-white rounded-xl font-medium focus:outline-none backdrop-blur-sm"
              >
                <option value="PLANNING"    className="text-gray-900">Planning</option>
                <option value="IN_PROGRESS" className="text-gray-900">In Progress</option>
                <option value="ON_HOLD"     className="text-gray-900">On Hold</option>
                <option value="COMPLETED"   className="text-gray-900">Completed</option>
                <option value="CANCELLED"   className="text-gray-900">Cancelled</option>
              </select>
            )}
            <button
              onClick={() => router.push(`/construction/projects/${projectId}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 border border-white/30 text-white text-sm font-medium rounded-xl hover:bg-white/25 transition backdrop-blur-sm"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-300/40 text-white text-sm font-medium rounded-xl hover:bg-red-500/30 transition backdrop-blur-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Row */}
        <div className="relative mt-8 pt-6 border-t border-white/20 grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-white/60 text-xs mb-1.5">Overall Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div className="h-2 rounded-full bg-yellow-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-bold text-yellow-300 shrink-0">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1.5">Budget Used</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-400 transition-all" style={{ width: `${budgetPct}%` }} />
              </div>
              <span className="text-sm font-bold text-green-300 shrink-0">{budgetPct.toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1">Allocated</p>
            <p className="text-lg font-bold">{formatToCrore(Number(project.budgetAllocated))}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1">Spent</p>
            <p className="text-lg font-bold">{formatToCrore(Number(project.budgetSpent))}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1">Days Remaining</p>
            <p className={`text-lg font-bold ${isDelayed ? 'text-red-300' : daysLeft !== null && daysLeft < 30 ? 'text-yellow-300' : 'text-white'}`}>
              {daysLeft === null ? '—' : isDelayed ? `${Math.abs(daysLeft)}d OVER` : `${daysLeft} days`}
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        className="bg-white rounded-3xl shadow-sm border overflow-hidden"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        {/* Tab bar */}
        <div className="border-b overflow-x-auto" style={{ borderColor: `${brandPalette.neutral}80` }}>
          <div className="flex px-2 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Timeline */}
              <div className="rounded-2xl border p-6 space-y-1" style={{ borderColor: `${brandPalette.neutral}80` }}>
                <h3 className="font-bold text-base flex items-center gap-2 mb-4" style={{ color: brandPalette.primary }}>
                  <Calendar className="w-5 h-5" /> Project Timeline
                </h3>
                {[
                  { label: 'Start Date',          value: fmt(project.startDate) },
                  { label: 'Expected Completion', value: fmt(project.expectedCompletionDate) },
                  { label: 'Actual Completion',   value: project.actualCompletionDate ? fmt(project.actualCompletionDate) : 'Ongoing' },
                  { label: 'Project Manager',     value: project.projectManager?.fullName || 'Not assigned' },
                  { label: 'Property',            value: project.property?.name || '—' },
                  { label: 'Tower',               value: project.tower?.name || '—' },
                  { label: 'Flat',                value: project.flat?.flatNumber ? `Flat ${project.flat.flatNumber}` : '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Budget */}
              <div className="rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}80` }}>
                <h3 className="font-bold text-base flex items-center gap-2 mb-5" style={{ color: brandPalette.primary }}>
                  💰 Budget Summary
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Budget Utilization</span>
                    <span className="font-bold">{budgetPct.toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="rounded-full h-4 transition-all"
                      style={{
                        width: `${budgetPct}%`,
                        backgroundColor: budgetPct > 90 ? '#DC2626' : budgetPct > 70 ? '#D97706' : '#16A34A',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-5 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Allocated</p>
                      <p className="font-bold text-gray-900">{fmtCur(project.budgetAllocated)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Spent</p>
                      <p className="font-bold" style={{ color: brandPalette.primary }}>{fmtCur(project.budgetSpent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-0.5">Remaining</p>
                      <p className="font-bold text-green-600">
                        {fmtCur(Number(project.budgetAllocated) - Number(project.budgetSpent))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description if present */}
                {project.description && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Project Notes</p>
                    <p className="text-sm text-blue-800">{project.description}</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h3 className="font-bold text-base mb-4" style={{ color: brandPalette.primary }}>⚡ Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '📝', label: 'Add Progress Log',  action: () => setShowProgressModal(true) },
                    { icon: '📊', label: 'View All Logs',     action: () => setActiveTab('progress') },
                    { icon: '📦', label: 'Purchase Orders',   action: () => setActiveTab('purchase-orders') },
                    { icon: '🧱', label: 'Materials Used',    action: () => setActiveTab('materials') },
                    { icon: '👥', label: 'Teams',             action: () => setActiveTab('teams') },
                    { icon: '🏗️', label: 'Phase Progress',   action: () => setActiveTab('phases') },
                    { icon: '⚖️', label: 'RA Bills',          action: () => router.push(`/construction/ra-bills?projectId=${projectId}`) },
                    { icon: '✅', label: 'Quality Checks',    action: () => router.push(`/construction/quality?projectId=${projectId}`) },
                  ].map(a => (
                    <button
                      key={a.label}
                      onClick={a.action}
                      className="group p-4 rounded-2xl border-2 hover:border-[#A8211B] hover:bg-red-50 transition-all text-left"
                      style={{ borderColor: `${brandPalette.neutral}80` }}
                    >
                      <div className="text-2xl mb-2">{a.icon}</div>
                      <div className="text-xs font-semibold text-gray-700 group-hover:text-[#A8211B]">{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PHASES TAB ── */}
          {activeTab === 'phases' && (
            <div>
              <h3 className="font-bold text-base mb-6" style={{ color: brandPalette.primary }}>Construction Phase Tracker</h3>
              <div className="space-y-4 mb-8">
                {PHASES.map((phase, idx) => {
                  const phaseData   = towerProgress.find((t: any) => t.phase === phase);
                  const phasePct    = phaseData ? Number(phaseData.phaseProgress) : 0;
                  const phaseStatus = phaseData?.status || 'NOT_STARTED';
                  const isActive    = phaseStatus === 'IN_PROGRESS';
                  const isDone      = phaseStatus === 'COMPLETED';
                  return (
                    <div key={phase} className={`rounded-2xl border-2 p-5 ${isDone ? 'border-green-200 bg-green-50' : isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{PHASE_ICONS[phase]}</span>
                          <div>
                            <p className="font-bold text-gray-900">{phase}</p>
                            <p className="text-xs text-gray-500">
                              Step {idx + 1} of {PHASES.length}
                              {phaseData?.expectedEndDate && ` · Due ${fmt(phaseData.expectedEndDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[phaseStatus]?.bg || 'bg-gray-50'} ${STATUS_COLORS[phaseStatus]?.text || 'text-gray-600'} ${STATUS_COLORS[phaseStatus]?.border || 'border-gray-200'}`}>
                            {phaseStatus.replace(/_/g, ' ')}
                          </span>
                          <span className="font-bold text-xl" style={{ color: brandPalette.primary }}>{phasePct}%</span>
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="rounded-full h-3 transition-all" style={{
                          width: `${phasePct}%`,
                          backgroundColor: isDone ? '#16A34A' : isActive ? '#2563EB' : brandPalette.primary,
                        }} />
                      </div>
                      {phaseData?.notes && <p className="text-xs text-gray-500 mt-2">📝 {phaseData.notes}</p>}
                    </div>
                  );
                })}
              </div>

              {towerProgress.length === 0 && !tabLoading && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-5xl mb-3">🏗️</div>
                  <p className="font-medium">No phase data yet.</p>
                  <p className="text-sm mt-1 text-gray-400">Phase progress is recorded as you update construction stages.</p>
                </div>
              )}

              <div className="mt-6 rounded-2xl p-5 border bg-gray-50">
                <h4 className="font-semibold text-gray-700 mb-3">Update Overall Progress</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min="0" max="100" step="5"
                    defaultValue={project.overallProgress || 0}
                    onMouseUp={e => handleProgressUpdate('overall', parseInt((e.target as HTMLInputElement).value))}
                    onTouchEnd={e => handleProgressUpdate('overall', parseInt((e.target as HTMLInputElement).value))}
                    className="flex-1 h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: brandPalette.primary }}
                  />
                  <span className="font-bold text-xl w-14 text-right" style={{ color: brandPalette.primary }}>
                    {project.overallProgress || 0}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Drag to update, release to save</p>
              </div>
            </div>
          )}

          {/* ── DAILY LOGS TAB ── */}
          {activeTab === 'progress' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base" style={{ color: brandPalette.primary }}>Daily Progress Logs</h3>
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-full font-semibold shadow"
                  style={{ backgroundColor: brandPalette.primary }}
                >
                  + Add Today's Log
                </button>
              </div>

              {tabLoading ? (
                <div className="text-center py-12 text-gray-400">Loading logs…</div>
              ) : progressLogs.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="font-medium text-gray-600">No progress logs yet.</p>
                  <button
                    onClick={() => setShowProgressModal(true)}
                    className="mt-4 px-5 py-2.5 text-white rounded-full text-sm font-semibold"
                    style={{ backgroundColor: brandPalette.primary }}
                  >
                    Add First Log
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {progressLogs.map(log => (
                    <div key={log.id} className={`rounded-2xl border p-5 ${log.issuesDelays ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {({ SUNNY: '☀️', CLOUDY: '☁️', RAINY: '🌧️', STORMY: '⛈️', FOGGY: '🌫️' } as Record<string, string>)[log.weatherCondition] || '🌤️'}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{fmt(log.logDate)}</p>
                            <p className="text-xs text-gray-500">{log.supervisorName || 'No supervisor'} · {log.shift || 'DAY'} shift</p>
                          </div>
                        </div>
                        <div className="flex gap-5 text-right text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Progress</p>
                            <p className="font-bold" style={{ color: brandPalette.primary }}>{log.progressPercentage || 0}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Workers</p>
                            <p className="font-bold text-blue-600">{(log.workersPresent || 0) + (log.workersAbsent || 0)}</p>
                          </div>
                        </div>
                      </div>
                      {(log.workCompleted || log.description) && (
                        <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                          {log.workCompleted || log.description}
                        </p>
                      )}
                      {log.issuesDelays && (
                        <div className="mt-3 flex items-start gap-2 bg-orange-100 rounded-xl px-3 py-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-orange-700">{log.issuesDelays}</p>
                        </div>
                      )}
                      {log.nextDayPlan && (
                        <p className="text-xs text-gray-500 mt-2">📅 Tomorrow: {log.nextDayPlan}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MATERIALS TAB ── */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base" style={{ color: brandPalette.primary }}>Materials Issued to This Project</h3>
                <button
                  onClick={() => router.push('/construction/materials')}
                  className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-50"
                  style={{ color: brandPalette.secondary, borderColor: brandPalette.neutral }}
                >
                  Manage Inventory →
                </button>
              </div>

              {tabLoading ? (
                <div className="text-center py-12 text-gray-400">Loading materials…</div>
              ) : materials.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-5xl mb-3">🧱</div>
                  <p className="font-medium text-gray-600">No materials issued to this project yet.</p>
                  <button
                    onClick={() => router.push('/construction/materials')}
                    className="mt-4 px-5 py-2.5 border rounded-full text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Go to Materials
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: `${brandPalette.neutral}80` }}>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b" style={{ borderColor: `${brandPalette.neutral}80` }}>
                      <tr>
                        {['Date', 'Material', 'Qty', 'Purpose', 'Issued To'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {materials.map((m: any) => (
                        <tr key={m.id} className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => m.materialId && router.push(`/construction/materials/${m.materialId}`)}>
                          <td className="px-5 py-3 text-gray-500">{fmt(m.exitDate)}</td>
                          <td className="px-5 py-3 font-medium hover:underline" style={{ color: m.materialId ? '#A8211B' : undefined }}>
                            {m.material?.materialName || m.materialId}
                          </td>
                          <td className="px-5 py-3">{m.quantity} {m.material?.unitOfMeasurement}</td>
                          <td className="px-5 py-3 text-gray-500">{m.purpose || '—'}</td>
                          <td className="px-5 py-3 text-gray-500">{m.issuedTo || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PURCHASE ORDERS TAB ── */}
          {activeTab === 'purchase-orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base" style={{ color: brandPalette.primary }}>Purchase Orders</h3>
                <button
                  onClick={() => router.push('/construction/purchase-orders')}
                  className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-50"
                  style={{ color: brandPalette.secondary, borderColor: brandPalette.neutral }}
                >
                  All Purchase Orders →
                </button>
              </div>

              {tabLoading ? (
                <div className="text-center py-12 text-gray-400">Loading purchase orders…</div>
              ) : purchaseOrders.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="font-medium text-gray-600">No purchase orders linked to this project.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseOrders.map((po: any) => (
                    <div key={po.id} className="rounded-2xl border p-5 hover:shadow-sm transition-shadow" style={{ borderColor: `${brandPalette.neutral}80` }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{po.poNumber}</p>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${PO_STATUS_COLORS[po.status] || 'bg-gray-100 text-gray-600'}`}>
                              {po.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Vendor: {po.vendor?.id ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/construction/vendors/${po.vendor.id}`); }}
                                className="hover:underline font-medium"
                                style={{ color: '#A8211B' }}
                              >{po.vendor.vendorName}</button>
                            ) : (po.vendor?.vendorName || '—')} · {fmt(po.poDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{fmtCur(po.totalAmount)}</p>
                          <p className="text-xs text-gray-500">Balance: {fmtCur(po.balanceAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-2xl p-4 flex justify-between font-semibold text-sm" style={{ backgroundColor: brandPalette.neutral }}>
                    <span>Total PO Value</span>
                    <span>{fmtCur(purchaseOrders.reduce((s: number, po: any) => s + Number(po.totalAmount), 0))}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TEAMS TAB ── */}
          {activeTab === 'teams' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base" style={{ color: brandPalette.primary }}>Teams on This Project</h3>
                <button
                  onClick={() => router.push('/construction/teams')}
                  className="text-sm border rounded-full px-4 py-1.5 hover:bg-gray-50"
                  style={{ color: brandPalette.secondary, borderColor: brandPalette.neutral }}
                >
                  Manage Teams →
                </button>
              </div>

              {tabLoading ? (
                <div className="text-center py-12 text-gray-400">Loading teams…</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-5xl mb-3">👥</div>
                  <p className="font-medium text-gray-600">No teams assigned to this project.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team: any) => (
                    <div key={team.id} className="rounded-2xl border p-5" style={{ borderColor: `${brandPalette.neutral}80` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">
                          {({ CONTRACTOR: '🏢', IN_HOUSE: '👷', LABOR: '⚒️' } as Record<string, string>)[team.teamType] || '👥'}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900">{team.teamName}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{team.teamType}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1.5">
                        <p>👤 {team.leaderName}</p>
                        <p>📞 {team.contactNumber}</p>
                        <p>👷 {team.activeMembers || team.totalMembers || 0} workers</p>
                        {team.specialization && <p>🔧 {team.specialization}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-sm text-gray-400">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h2>
              <p className="text-gray-500 text-sm">
                This will permanently delete <strong>{project.projectName}</strong> and all its data. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border-2 rounded-2xl font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Log Modal */}
      {showProgressModal && (
        <AddProgressLogModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          onSuccess={() => { setShowProgressModal(false); loadTabData('progress'); }}
          propertyId={project.propertyId || ''}
        />
      )}
    </div>
  );
}
