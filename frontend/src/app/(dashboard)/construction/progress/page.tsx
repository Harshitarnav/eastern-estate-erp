'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import AddProgressLogModal from '@/components/modals/AddProgressLogModal';
import { CardGridSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { ClipboardList, Plus, TrendingUp, Users, AlertTriangle, ChevronDown, ChevronUp, Trash2, Camera, X } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3001';

const WEATHER_LABELS: Record<string, string> = {
  SUNNY: 'Sunny', CLOUDY: 'Cloudy', RAINY: 'Rainy', STORMY: 'Stormy', FOGGY: 'Foggy',
};

const PROGRESS_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  STRUCTURE:     { label: 'Structure',     color: 'text-blue-700',   bg: 'bg-blue-100' },
  INTERIOR:      { label: 'Interior',      color: 'text-purple-700', bg: 'bg-purple-100' },
  FINISHING:     { label: 'Finishing',     color: 'text-green-700',  bg: 'bg-green-100' },
  QUALITY_CHECK: { label: 'Quality Check', color: 'text-orange-700', bg: 'bg-orange-100' },
};

function ProgressLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('projectId') ?? '';

  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState(projectIdFromUrl);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      // api.get() returns response.data directly (not a full Axios response)
      const res = await api.get('/construction-projects');
      setProjects(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const url = selectedProject
        ? `/construction-progress-logs?constructionProjectId=${selectedProject}`
        : '/construction-progress-logs';
      const res = await api.get(url);
      setLogs(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error('Failed to load logs', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this progress log?')) return;
    try {
      await api.delete(`/construction-progress-logs/${id}`);
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      alert('Failed to delete log');
    }
  };

  const handleDeletePhoto = async (logId: string, photoUrl: string) => {
    if (!confirm('Remove this photo?')) return;
    try {
      const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';
      await fetch(
        `${API_BASE}/api/v1/construction-progress-logs/${logId}/photos`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ photoUrl }),
        },
      );
      setLogs(prev =>
        prev.map(l =>
          l.id === logId
            ? { ...l, photos: (l.photos as string[]).filter((u: string) => u !== photoUrl) }
            : l,
        ),
      );
      if (lightboxUrl === `${API_BASE}${photoUrl}`) setLightboxUrl(null);
    } catch {
      alert('Failed to remove photo');
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const filteredLogs = logs.filter(l => {
    if (!searchDate) return true;
    return l.logDate?.startsWith(searchDate);
  });

  const totalWorkersToday = filteredLogs.length > 0 && filteredLogs[0]
    ? (filteredLogs[0].workersPresent || 0) + (filteredLogs[0].workersAbsent || 0)
    : 0;

  const avgProgress = filteredLogs.length
    ? Math.round(filteredLogs.reduce((s, l) => s + (l.progressPercentage || 0), 0) / filteredLogs.length)
    : 0;

  const issuesCount = filteredLogs.filter(l => l.issuesDelays && l.issuesDelays.trim()).length;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Hero */}
      <BrandHero
        eyebrow="Daily Progress Logs"
        title={<>Your site <span style={{ color: brandPalette.accent }}>diary, day by day</span></>}
        description="Log each day's work, workforce headcount, material usage, and any issues or delays. Build a complete picture of your project's progress over time."
        actions={
          <BrandPrimaryButton onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Today's Log
          </BrandPrimaryButton>
        }
      />

      {/* Stat Cards */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Logs"
          primary={formatIndianNumber(filteredLogs.length)}
          subLabel={`${logs.length} total entries`}
          icon={<ClipboardList className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Avg. Progress"
          primary={`${avgProgress}%`}
          subLabel="Across filtered logs"
          icon={<TrendingUp className="w-7 h-7" />}
          accentColor="rgba(37,99,235,0.2)"
        />
        <BrandStatCard
          title="Latest Workforce"
          primary={formatIndianNumber(totalWorkersToday)}
          subLabel="Workers on site (most recent)"
          icon={<Users className="w-7 h-7" />}
          accentColor="rgba(22,163,74,0.2)"
        />
        <BrandStatCard
          title="Logs with Issues"
          primary={formatIndianNumber(issuesCount)}
          subLabel="Delays or problems reported"
          icon={<AlertTriangle className="w-7 h-7" />}
          accentColor={issuesCount > 0 ? '#D97706' : 'rgba(22,163,74,0.2)'}
        />
      </section>

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="flex-1 px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
          </select>
          <input
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          />
          {(selectedProject || searchDate) && (
            <button
              onClick={() => { setSelectedProject(''); setSearchDate(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <CardGridSkeleton cards={3} />
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl border p-12 text-center shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <ClipboardList className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>No Progress Logs Yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              {selectedProject ? 'No logs for this project yet.' : 'Start logging daily site progress to track your project.'}
            </p>
            <BrandPrimaryButton onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add First Log
            </BrandPrimaryButton>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isExpanded = expandedLog === log.id;
            const hasIssues = log.issuesDelays && log.issuesDelays.trim();
            const ptConfig = log.progressType ? (PROGRESS_TYPE_CONFIG[log.progressType] || null) : null;
            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                style={{ borderColor: hasIssues ? 'rgba(234,88,12,0.4)' : `${brandPalette.neutral}60` }}
              >
                {/* Log Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: hasIssues ? '#EA580C' : brandPalette.success }}
                      >
                        {new Date(log.logDate).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{formatDate(log.logDate)}</p>
                        {log.shift && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.shift === 'NIGHT' ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {log.shift === 'NIGHT' ? 'Night' : 'Day'}
                          </span>
                        )}
                        {ptConfig && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ptConfig.bg} ${ptConfig.color}`}>
                            {ptConfig.label}
                          </span>
                        )}
                        {hasIssues && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">Issues</span>
                        )}
                        {Array.isArray(log.photos) && log.photos.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                            <Camera className="w-3 h-3" /> {log.photos.length}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {log.supervisorName || 'No supervisor'}
                        {log.weatherCondition ? ` · ${WEATHER_LABELS[log.weatherCondition] || log.weatherCondition}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 ml-4">
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-gray-400">Progress</p>
                      <p className="font-bold text-lg" style={{ color: brandPalette.primary }}>{log.progressPercentage || 0}%</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-gray-400">Workers</p>
                      <p className="font-bold text-lg text-blue-600">{(log.workersPresent || 0)}</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-5 h-5 text-gray-400" />
                      : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Progress bar */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400 font-medium uppercase">Progress</span>
                          <span className="text-sm font-bold" style={{ color: brandPalette.primary }}>{log.progressPercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(log.progressPercentage || 0, 100)}%`, backgroundColor: brandPalette.primary }}
                          />
                        </div>
                      </div>

                      {log.description && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Work Completed</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.description}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Workforce</h4>
                        <div className="flex gap-5 text-sm">
                          <div>
                            <span className="font-bold text-green-600 text-lg">{log.workersPresent || 0}</span>
                            <span className="text-gray-400 text-xs ml-1">present</span>
                          </div>
                          <div>
                            <span className="font-bold text-red-500 text-lg">{log.workersAbsent || 0}</span>
                            <span className="text-gray-400 text-xs ml-1">absent</span>
                          </div>
                        </div>
                      </div>
                      {log.materialsUsed && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Materials Used</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.materialsUsed}</p>
                        </div>
                      )}
                      {hasIssues && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                          <h4 className="text-xs font-semibold text-orange-700 uppercase mb-1.5">Issues / Delays</h4>
                          <p className="text-sm text-orange-800 whitespace-pre-wrap">{log.issuesDelays}</p>
                        </div>
                      )}
                      {log.nextDayPlan && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Next Day Plan</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.nextDayPlan}</p>
                        </div>
                      )}
                      {log.remarks && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Remarks</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.remarks}</p>
                        </div>
                      )}

                      {/* Site Photos */}
                      {Array.isArray(log.photos) && log.photos.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5" /> Site Photos ({log.photos.length})
                          </h4>
                          <div className="flex gap-2 flex-wrap">
                            {log.photos.map((url: string, idx: number) => (
                              <div
                                key={idx}
                                className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer"
                                style={{ width: 80, height: 80, flexShrink: 0 }}
                                onClick={() => setLightboxUrl(API_BASE + url)}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={API_BASE + url}
                                  alt={'site photo ' + (idx + 1)}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeletePhoto(log.id, url); }}
                                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-4 pt-3 border-t" style={{ borderColor: `${brandPalette.neutral}60` }}>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Life Long Bonding...
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxUrl}
              alt="Site photo"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }}
            />
          </div>
        </div>
      )}

      {showAddModal && (
        <AddProgressLogModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadLogs(); }}
          propertyId=""
        />
      )}
    </div>
  );
}

export default function ProgressLogsPage() {
  return (
    <Suspense fallback={<div className="p-6"><CardGridSkeleton cards={3} /></div>}>
      <ProgressLogsContent />
    </Suspense>
  );
}
