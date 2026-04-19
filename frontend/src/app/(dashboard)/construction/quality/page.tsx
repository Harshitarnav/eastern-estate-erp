'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { CardGridSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { ClipboardList, Plus, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const PHASES = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'];
const PHASE_LABELS: Record<string, string> = {
  FOUNDATION: 'Foundation', STRUCTURE: 'Structure', MEP: 'MEP', FINISHING: 'Finishing', HANDOVER: 'Handover',
};
const RESULT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PASS:    { label: 'Pass',    color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  FAIL:    { label: 'Fail',    color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  PARTIAL: { label: 'Partial', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  PENDING: { label: 'Pending', color: 'text-gray-600',   bg: 'bg-gray-100',  border: 'border-gray-200' },
};
const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW:      { label: 'Low',      color: 'text-green-700',  bg: 'bg-green-100' },
  MEDIUM:   { label: 'Medium',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  HIGH:     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-100' },
  CRITICAL: { label: 'Critical', color: 'text-red-700',    bg: 'bg-red-100' },
};

function QualityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('projectId') ?? '';

  const [checklists, setChecklists] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddDefectModal, setShowAddDefectModal] = useState(false);
  const [filterProject, setFilterProject] = useState(projectIdFromUrl);
  const [filterPhase, setFilterPhase] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    constructionProjectId: projectIdFromUrl,
    phase: 'FOUNDATION',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: '',
    locationDescription: '',
    notes: '',
    nextInspectionDate: '',
  });

  const [defectForm, setDefectForm] = useState({
    description: '',
    severity: 'MEDIUM',
    location: '',
    status: 'OPEN',
  });

  useEffect(() => {
    // api.get() returns response.data directly (not a full Axios response)
    api.get('/construction-projects').then(data => {
      setProjects(Array.isArray(data) ? data : (data?.data || []));
    });
  }, []);

  useEffect(() => {
    loadChecklists();
  }, [filterProject, filterPhase]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProject) params.set('constructionProjectId', filterProject);
      if (filterPhase) params.set('phase', filterPhase);
      const data = await api.get(`/qc-checklists?${params.toString()}`);
      setChecklists(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.constructionProjectId || !form.inspectorName) {
      alert('Project and Inspector Name are required');
      return;
    }
    setSaving(true);
    try {
      const created = await api.post('/qc-checklists', form);
      setShowCreateModal(false);
      setSelectedChecklist(created);
      loadChecklists();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create checklist');
    } finally {
      setSaving(false);
    }
  };

  const handleItemUpdate = async (checklistId: string, items: any[]) => {
    try {
      const updated = await api.patch(`/qc-checklists/${checklistId}`, { items });
      if (selectedChecklist?.id === checklistId) setSelectedChecklist(updated);
      loadChecklists();
    } catch (e) {
      alert('Failed to update checklist items');
    }
  };

  const handleAddDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectForm.description) { alert('Description required'); return; }
    setSaving(true);
    try {
      const updated = await api.post(`/qc-checklists/${selectedChecklist.id}/defects`, defectForm);
      setSelectedChecklist(updated);
      setShowAddDefectModal(false);
      setDefectForm({ description: '', severity: 'MEDIUM', location: '', status: 'OPEN' });
      loadChecklists();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add defect');
    } finally {
      setSaving(false);
    }
  };

  const handleDefectResolve = async (defect: any) => {
    try {
      const updated = await api.patch(`/qc-checklists/${selectedChecklist.id}/defects/${defect.id}`, {
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString(),
      });
      setSelectedChecklist(updated);
    } catch (e) {
      alert('Failed to resolve defect');
    }
  };

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const totalPassed = checklists.filter(c => c.overallResult === 'PASS').length;
  const totalFailed = checklists.filter(c => c.overallResult === 'FAIL').length;
  const openDefects = checklists.reduce((s, c) => s + (c.defects?.filter((d: any) => d.status === 'OPEN').length || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Hero */}
      <BrandHero
        eyebrow="Quality Control"
        title={<>Phase-wise inspections and <span style={{ color: brandPalette.accent }}>defect tracking</span></>}
        description="Run structured quality checks at every construction phase. Track pass/fail results, log defects with severity levels, and ensure handover-ready quality."
        actions={
          <BrandPrimaryButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> New Inspection
          </BrandPrimaryButton>
        }
      />

      {/* Stat Cards */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Inspections"
          primary={formatIndianNumber(checklists.length)}
          subLabel={`${totalPassed} passed`}
          icon={<ClipboardList className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Passed"
          primary={formatIndianNumber(totalPassed)}
          subLabel="Inspection certified"
          icon={<CheckCircle className="w-7 h-7" />}
          accentColor="rgba(22,163,74,0.2)"
        />
        <BrandStatCard
          title="Failed / Partial"
          primary={formatIndianNumber(totalFailed)}
          subLabel="Need re-inspection"
          icon={<XCircle className="w-7 h-7" />}
          accentColor="rgba(168,33,27,0.2)"
        />
        <BrandStatCard
          title="Open Defects"
          primary={formatIndianNumber(openDefects)}
          subLabel="Pending resolution"
          icon={<AlertTriangle className="w-7 h-7" />}
          accentColor={openDefects > 0 ? '#D97706' : 'rgba(22,163,74,0.2)'}
        />
      </section>

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            className="flex-1 px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
          </select>
          <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white">
            <option value="">All Phases</option>
            {PHASES.map(p => <option key={p} value={p}>{PHASE_LABELS[p] || p}</option>)}
          </select>
          {(filterProject || filterPhase) && (
            <button onClick={() => { setFilterProject(''); setFilterPhase(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className={`${selectedChecklist ? 'w-1/2' : 'w-full'} space-y-3`}>
          {loading ? <CardGridSkeleton cards={3} /> : checklists.length === 0 ? (
            <div className="bg-white rounded-3xl border p-12 text-center shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <ClipboardList className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>No Inspections Yet</h3>
              <p className="text-gray-500 text-sm mb-6">Start recording quality inspections for each construction phase.</p>
              <BrandPrimaryButton onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" /> New Inspection
              </BrandPrimaryButton>
            </div>
          ) : checklists.map(c => {
            const passCount = c.items?.filter((i: any) => i.status === 'PASS').length || 0;
            const total = c.items?.length || 0;
            const openDef = c.defects?.filter((d: any) => d.status === 'OPEN').length || 0;
            const rc = RESULT_CONFIG[c.overallResult] || RESULT_CONFIG.PENDING;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedChecklist(c)}
                className={`bg-white rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all ${
                  selectedChecklist?.id === c.id
                    ? 'border-[#A8211B] ring-1 ring-[#A8211B]'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-gray-900">{PHASE_LABELS[c.phase] || c.phase}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${rc.color} ${rc.bg} ${rc.border}`}>
                        {rc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{fmt(c.inspectionDate)} · {c.inspectorName || '-'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.constructionProject?.projectName || '-'}</p>
                  </div>
                  <div className="text-right text-sm shrink-0 ml-4">
                    <p className="font-semibold text-gray-800">{passCount}/{total} <span className="text-green-600">pass</span></p>
                    {openDef > 0 && <p className="text-orange-500 text-xs mt-0.5">{openDef} open defects</p>}
                  </div>
                </div>
                {total > 0 && (
                  <div className="mx-4 mb-3 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${(passCount / total) * 100}%`, backgroundColor: brandPalette.success }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedChecklist && (
          <div className="w-1/2 bg-white rounded-2xl border shadow-sm overflow-hidden sticky top-4 self-start max-h-[calc(100vh-120px)] overflow-y-auto"
            style={{ borderColor: `${brandPalette.neutral}60` }}>
            <div className="px-5 py-4 border-b flex items-start justify-between"
              style={{ borderColor: `${brandPalette.neutral}60`, backgroundColor: `${brandPalette.primary}08` }}>
              <div>
                <h3 className="font-bold text-gray-900">{PHASE_LABELS[selectedChecklist.phase] || selectedChecklist.phase} Inspection</h3>
                <p className="text-sm text-gray-500">{fmt(selectedChecklist.inspectionDate)} · {selectedChecklist.inspectorName || '-'}</p>
              </div>
              <button onClick={() => setSelectedChecklist(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Checklist Items */}
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Checklist Items</h4>
              <div className="space-y-2 mb-6">
                {(selectedChecklist.items || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} className="border rounded-xl p-3" style={{ borderColor: `${brandPalette.neutral}60` }}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{item.description}</p>
                        {item.remarks && <p className="text-xs text-gray-400 mt-1">{item.remarks}</p>}
                      </div>
                      <select
                        value={item.status}
                        onChange={e => {
                          const newItems = [...selectedChecklist.items];
                          newItems[idx] = { ...item, status: e.target.value };
                          setSelectedChecklist({ ...selectedChecklist, items: newItems });
                          handleItemUpdate(selectedChecklist.id, newItems);
                        }}
                        className={`text-xs px-2 py-1.5 rounded-lg border font-medium ${
                          item.status === 'PASS' ? 'border-green-300 bg-green-50 text-green-700' :
                          item.status === 'FAIL' ? 'border-red-300 bg-red-50 text-red-700' :
                          'border-gray-300 text-gray-600'
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PASS">Pass</option>
                        <option value="FAIL">Fail</option>
                        <option value="NA">N/A</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Defects */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase">Defects / Snag List</h4>
                <button
                  onClick={() => setShowAddDefectModal(true)}
                  className="text-xs px-3 py-1.5 text-white rounded-lg font-medium"
                  style={{ backgroundColor: brandPalette.primary }}
                >
                  + Defect
                </button>
              </div>
              {(selectedChecklist.defects || []).length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  No defects recorded
                </div>
              ) : (
                <div className="space-y-2">
                  {(selectedChecklist.defects || []).map((defect: any) => {
                    const sc = SEVERITY_CONFIG[defect.severity] || SEVERITY_CONFIG.MEDIUM;
                    return (
                      <div key={defect.id} className={`border rounded-xl p-3 transition-opacity ${defect.status === 'RESOLVED' ? 'opacity-50' : ''}`}
                        style={{ borderColor: `${brandPalette.neutral}60` }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                              {defect.status === 'RESOLVED'
                                ? <span className="text-xs text-green-600 font-medium">Resolved</span>
                                : <span className="text-xs text-red-600 font-medium">Open</span>}
                            </div>
                            <p className="text-sm text-gray-700">{defect.description}</p>
                            {defect.location && <p className="text-xs text-gray-400 mt-0.5">{defect.location}</p>}
                          </div>
                          {defect.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleDefectResolve(defect)}
                              className="text-xs px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex-shrink-0 font-medium"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedChecklist.notes && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Notes</p>
                  <p className="text-sm text-amber-700">{selectedChecklist.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Life Long Bonding...
      </div>

      {/* Create Checklist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b flex items-start justify-between" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: brandPalette.primary }}>New QC Inspection</h2>
                <p className="text-sm text-gray-500 mt-0.5">Checklist items will be auto-filled based on the phase</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
                  <select value={form.constructionProjectId} onChange={e => setForm({ ...form, constructionProjectId: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]" required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phase <span className="text-red-500">*</span></label>
                  <select value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]">
                    {PHASES.map(p => <option key={p} value={p}>{PHASE_LABELS[p] || p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.inspectionDate} onChange={e => setForm({ ...form, inspectionDate: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.inspectorName} onChange={e => setForm({ ...form, inspectorName: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]"
                    placeholder="Site engineer or QC team name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Area</label>
                  <input type="text" value={form.locationDescription} onChange={e => setForm({ ...form, locationDescription: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]"
                    placeholder="e.g. Tower A, Floor 4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Inspection Date</label>
                  <input type="date" value={form.nextInspectionDate} onChange={e => setForm({ ...form, nextInspectionDate: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]" rows={2} />
              </div>
              <div className="flex gap-3 pt-2 border-t">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-white rounded-xl font-medium disabled:opacity-50"
                  style={{ backgroundColor: brandPalette.primary }}>
                  {saving ? 'Creating...' : 'Create Inspection'}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Defect Modal */}
      {showAddDefectModal && selectedChecklist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h3 className="text-lg font-bold" style={{ color: brandPalette.primary }}>Add Defect / Snag</h3>
              <button onClick={() => setShowAddDefectModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDefect} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea value={defectForm.description} onChange={e => setDefectForm({ ...defectForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]" rows={2}
                  placeholder="Describe the defect or issue found" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select value={defectForm.severity} onChange={e => setDefectForm({ ...defectForm, severity: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={defectForm.location} onChange={e => setDefectForm({ ...defectForm, location: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#A8211B]"
                    placeholder="e.g. Floor 3 Col C2" />
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-white rounded-xl font-medium disabled:opacity-50"
                  style={{ backgroundColor: brandPalette.primary }}>
                  {saving ? 'Adding...' : 'Add Defect'}
                </button>
                <button type="button" onClick={() => setShowAddDefectModal(false)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QualityPage() {
  return (
    <Suspense fallback={<div className="p-6"><CardGridSkeleton cards={3} /></div>}>
      <QualityContent />
    </Suspense>
  );
}
