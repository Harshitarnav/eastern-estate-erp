'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Camera, X, Upload, ImageIcon, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { towersService } from '@/services/towers.service';
import { flatsService } from '@/services/flats.service';
import {
  paymentPlansService,
  type FlatPaymentPlan,
  type FlatPaymentMilestone,
} from '@/services/payment-plans.service';

interface AddProgressLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

const WEATHER_CONDITIONS = ['SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'FOGGY'];
const SHIFTS = ['DAY', 'NIGHT'];

const WORKFLOW_PHASES = [
  { value: 'FOUNDATION', label: 'Foundation' },
  { value: 'STRUCTURE', label: 'Structure' },
  { value: 'MEP', label: 'MEP (Mechanical, Electrical, Plumbing)' },
  { value: 'FINISHING', label: 'Finishing' },
  { value: 'HANDOVER', label: 'Handover' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3001';

export default function AddProgressLogModal({ isOpen, onClose, onSuccess, propertyId }: AddProgressLogModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Photo state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    projectId: '',
    logDate: new Date().toISOString().split('T')[0],
    shift: 'DAY',
    workCompleted: '',
    workersPresent: '',
    workersAbsent: '',
    weatherCondition: 'SUNNY',
    progressPercentage: '0',
    materialsUsed: '',
    issuesDelays: '',
    supervisorName: '',
    nextDayPlan: '',
    remarks: '',
  });

  // ── Demand-draft workflow section (opt-in) ────────────────────────────────
  const [wfEnabled, setWfEnabled] = useState(false);
  const [wfScope, setWfScope] = useState<'all' | 'single'>('all');
  const [wfPhase, setWfPhase] = useState('FOUNDATION');
  const [wfPhaseProgress, setWfPhaseProgress] = useState<string>('');
  const [wfTowerId, setWfTowerId] = useState('');
  const [wfFlatId, setWfFlatId] = useState('');
  const [wfTowers, setWfTowers] = useState<any[]>([]);
  const [wfFlats, setWfFlats] = useState<any[]>([]);
  const [wfLoadingTowers, setWfLoadingTowers] = useState(false);
  const [wfLoadingFlats, setWfLoadingFlats] = useState(false);

  // Payment plan shown when a specific flat is picked. Lets the user tick
  // the actual milestone that was reached today instead of guessing phase +
  // percentage. Selecting a milestone auto-fills wfPhase + wfPhaseProgress.
  const [wfPlan, setWfPlan] = useState<FlatPaymentPlan | null>(null);
  const [wfPlanLoading, setWfPlanLoading] = useState(false);
  const [wfSelectedMilestoneSeq, setWfSelectedMilestoneSeq] = useState<number | null>(null);

  const selectedProject = projects.find((p: any) => p.id === formData.projectId);
  const selectedPropertyId: string | undefined =
    selectedProject?.propertyId || selectedProject?.property?.id || (propertyId || undefined);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  // When the user opens the workflow section (or changes project), load towers
  // for the selected project's property.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!wfEnabled || !selectedPropertyId) {
        setWfTowers([]);
        return;
      }
      try {
        setWfLoadingTowers(true);
        const rows = await towersService.getTowersByProperty(selectedPropertyId);
        if (!cancelled) setWfTowers(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error('Failed to load towers', e);
        if (!cancelled) setWfTowers([]);
      } finally {
        if (!cancelled) setWfLoadingTowers(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [wfEnabled, selectedPropertyId]);

  // Reset tower/flat selection whenever the project changes or section is toggled.
  useEffect(() => {
    setWfTowerId('');
    setWfFlatId('');
    setWfFlats([]);
  }, [formData.projectId, wfEnabled]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!wfEnabled || wfScope !== 'single' || !wfTowerId) {
        setWfFlats([]);
        return;
      }
      try {
        setWfLoadingFlats(true);
        const rows = await flatsService.getFlatsByTower(wfTowerId);
        if (!cancelled) setWfFlats(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error('Failed to load flats', e);
        if (!cancelled) setWfFlats([]);
      } finally {
        if (!cancelled) setWfLoadingFlats(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [wfEnabled, wfScope, wfTowerId]);

  // When a specific flat is chosen, fetch its payment plan so we can show
  // the actual milestones the accountant needs to track. `getFlatPaymentPlanByFlatId`
  // returns null for unsold flats - that's a valid state, we just don't
  // render the milestone picker in that case.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setWfPlan(null);
      setWfSelectedMilestoneSeq(null);
      if (!wfEnabled || wfScope !== 'single' || !wfFlatId) return;
      try {
        setWfPlanLoading(true);
        const plan = await paymentPlansService.getFlatPaymentPlanByFlatId(wfFlatId);
        if (!cancelled) setWfPlan(plan ?? null);
      } catch (e) {
        // Not found / no plan / unsold flat - all the same for the picker
        if (!cancelled) setWfPlan(null);
      } finally {
        if (!cancelled) setWfPlanLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [wfEnabled, wfScope, wfFlatId]);

  /** Select a milestone from the plan and auto-fill phase + phase% inputs. */
  const pickMilestone = (m: FlatPaymentMilestone) => {
    if (!m.constructionPhase || m.phasePercentage == null) return;
    setWfSelectedMilestoneSeq(m.sequence);
    setWfPhase(m.constructionPhase);
    setWfPhaseProgress(String(m.phasePercentage));
  };

  const loadProjects = async () => {
    try {
      // api.get() returns response.data directly (not a full Axios response)
      // If propertyId is empty, load all projects instead of filtering by empty string
      const url = propertyId ? `/construction-projects?propertyId=${propertyId}` : '/construction-projects';
      const response = await api.get(url);
      const data = Array.isArray(response) ? response : (response?.data || []);
      setProjects((data || []).filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'));
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const allowed = files.filter(f => f.type.startsWith('image/'));
    const combined = [...selectedFiles, ...allowed].slice(0, 5); // max 5
    setSelectedFiles(combined);
    // Generate preview URLs
    const urls = combined.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return urls; });
    // Reset input so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreview = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.workCompleted || !formData.supervisorName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate workflow fields only when the section is enabled.
    if (wfEnabled) {
      const phasePct = parseFloat(wfPhaseProgress);
      if (!Number.isFinite(phasePct) || phasePct < 0 || phasePct > 100) {
        toast.error('Please enter a valid phase progress (0-100%)');
        return;
      }
      if (wfScope === 'single' && (!wfTowerId || !wfFlatId)) {
        toast.error('Please pick a tower and flat for the workflow update');
        return;
      }
      if (wfScope === 'all' && !selectedPropertyId) {
        toast.error('Cannot determine the property for "all sold flats" - pick a project first');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        constructionProjectId: formData.projectId,
        logDate: formData.logDate,
        shift: formData.shift,
        workCompleted: formData.workCompleted,
        workersPresent: parseInt(formData.workersPresent) || 0,
        workersAbsent: parseInt(formData.workersAbsent) || 0,
        weatherCondition: formData.weatherCondition,
        progressPercentage: parseFloat(formData.progressPercentage),
        materialsUsed: formData.materialsUsed || null,
        issuesDelays: formData.issuesDelays || null,
        supervisorName: formData.supervisorName,
        nextDayPlan: formData.nextDayPlan || null,
        remarks: formData.remarks || null,
      };

      if (wfEnabled) {
        payload.phase = wfPhase;
        payload.phaseProgress = parseFloat(wfPhaseProgress);
        payload.overallProgress = parseFloat(formData.progressPercentage) || 0;
        if (wfScope === 'single') {
          payload.flatId = wfFlatId;
        } else {
          payload.applyToAllSoldFlats = true;
          if (selectedPropertyId) payload.propertyId = selectedPropertyId;
        }
      }

      const log: any = await api.post('/construction-progress-logs', payload);

      // ── Upload photos if any ──────────────────────────────────────────────
      if (selectedFiles.length > 0 && log?.id) {
        setUploadingPhotos(true);
        try {
          const formPayload = new FormData();
          selectedFiles.forEach(f => formPayload.append('photos', f));
          const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';
          await fetch(
            `${API_BASE}/api/v1/construction-progress-logs/${log.id}/photos`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formPayload,
            },
          );
        } catch (photoErr) {
          console.warn('Photos upload failed (log was saved):', photoErr);
        } finally {
          setUploadingPhotos(false);
        }
      }

      toast.success('Daily progress log saved');

      // ── Workflow feedback: show one toast per auto-raised DD ──────────────
      const wf = log?.workflow as
        | {
            flatsProcessed: number;
            milestonesTriggered: number;
            generatedDemandDrafts: Array<{
              id: string;
              refNumber?: string;
              milestoneName?: string;
              amount?: number;
              customerName?: string;
              flatNumber?: string;
              towerName?: string;
            }>;
            errors: Array<{ flatId: string; message: string }>;
          }
        | undefined;

      if (wf) {
        if (wf.generatedDemandDrafts.length === 0 && wf.flatsProcessed > 0) {
          toast.info(
            `Checked ${wf.flatsProcessed} sold flat(s) - no new milestones hit yet`,
            { duration: 5000 },
          );
        }
        wf.generatedDemandDrafts.forEach((dd) => {
          const unit = [dd.flatNumber, dd.towerName].filter(Boolean).join(' · ');
          const amt =
            typeof dd.amount === 'number' && Number.isFinite(dd.amount)
              ? `₹${dd.amount.toLocaleString('en-IN')}`
              : '';
          const description = [dd.milestoneName, dd.customerName, unit, amt]
            .filter(Boolean)
            .join(' · ');
          toast.success(
            `Demand draft raised${dd.refNumber ? ` (${dd.refNumber})` : ''}`,
            {
              description,
              duration: 8000,
              action: {
                label: 'View',
                onClick: () => {
                  window.location.href = `/demand-drafts/${dd.id}`;
                },
              },
            },
          );
        });
        if (wf.errors.length > 0) {
          toast.warning(
            `${wf.errors.length} flat(s) could not be processed - check the server logs`,
          );
        }
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to add progress log:', error);
      toast.error(error.response?.data?.message || 'Failed to add progress log');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      projectId: '',
      logDate: new Date().toISOString().split('T')[0],
      shift: 'DAY',
      workCompleted: '',
      workersPresent: '',
      workersAbsent: '',
      weatherCondition: 'SUNNY',
      progressPercentage: '0',
      materialsUsed: '',
      issuesDelays: '',
      supervisorName: '',
      nextDayPlan: '',
      remarks: '',
    });
    previews.forEach(u => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviews([]);
    setWfEnabled(false);
    setWfScope('all');
    setWfPhase('FOUNDATION');
    setWfPhaseProgress('');
    setWfTowerId('');
    setWfFlatId('');
    setWfTowers([]);
    setWfFlats([]);
    setWfPlan(null);
    setWfSelectedMilestoneSeq(null);
    setWfPlanLoading(false);
    onClose();
  };

  const totalWorkers = (parseInt(formData.workersPresent) || 0) + (parseInt(formData.workersAbsent) || 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Daily Progress Log" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Log Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select Project</option>
                {((projects || [])).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.logDate}
                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {((SHIFTS || [])).map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weather Condition
              </label>
              <select
                value={formData.weatherCondition}
                onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {((WEATHER_CONDITIONS || [])).map((weather) => (
                  <option key={weather} value={weather}>
                    {weather}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Work Progress */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Work Progress
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Completed Today <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.workCompleted}
                onChange={(e) => setFormData({ ...formData, workCompleted: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the work completed today..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Percentage: {formData.progressPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #A8211B 0%, #A8211B ${formData.progressPercentage}%, #e5e7eb ${formData.progressPercentage}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workforce */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Workforce Attendance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workers Present
              </label>
              <input
                type="number"
                value={formData.workersPresent}
                onChange={(e) => setFormData({ ...formData, workersPresent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workers Absent
              </label>
              <input
                type="number"
                value={formData.workersAbsent}
                onChange={(e) => setFormData({ ...formData, workersAbsent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="flex items-end">
              <div className="w-full bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Total Workforce</p>
                <p className="text-2xl font-bold text-blue-700">{totalWorkers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Materials & Issues */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Materials & Issues
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materials Used Today
              </label>
              <textarea
                value={formData.materialsUsed}
                onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="List materials consumed (e.g., 10 bags cement, 2 tons steel...)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issues / Delays (if any)
              </label>
              <textarea
                value={formData.issuesDelays}
                onChange={(e) => setFormData({ ...formData, issuesDelays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Report any issues, delays, or concerns..."
              />
            </div>
          </div>
        </div>

        {/* Supervisor & Planning */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#A8211B' }}>
            Supervisor & Next Day Plan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Name of supervisor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Day Plan
              </label>
              <textarea
                value={formData.nextDayPlan}
                onChange={(e) => setFormData({ ...formData, nextDayPlan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Plan for tomorrow's work..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={2}
                placeholder="Any other notes or observations..."
              />
            </div>
          </div>
        </div>

        {/* Demand-Draft Workflow (opt-in) */}
        <div className="rounded-xl border border-dashed p-4" style={{ borderColor: '#A8211B40', background: '#FFF8F7' }}>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#A8211B] focus:ring-[#A8211B]"
              checked={wfEnabled}
              onChange={(e) => setWfEnabled(e.target.checked)}
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#A8211B' }}>
                <Zap className="w-4 h-4" />
                Tick off a payment-plan milestone
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Pick a flat and the milestone you reached today. We update
                construction progress and auto-raise the demand draft for
                that milestone - no need to guess phase names or percentages.
              </p>
            </div>
          </label>

          {wfEnabled && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Apply to
                </label>
                <div className="flex gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wf-scope"
                      value="all"
                      checked={wfScope === 'all'}
                      onChange={() => setWfScope('all')}
                    />
                    <span>All sold flats in this project</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wf-scope"
                      value="single"
                      checked={wfScope === 'single'}
                      onChange={() => setWfScope('single')}
                    />
                    <span>A specific flat</span>
                  </label>
                </div>
              </div>

              {wfScope === 'single' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tower <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={wfTowerId}
                      onChange={(e) => {
                        setWfTowerId(e.target.value);
                        setWfFlatId('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={!selectedPropertyId || wfLoadingTowers}
                    >
                      <option value="">
                        {wfLoadingTowers ? 'Loading towers...' : 'Select tower'}
                      </option>
                      {wfTowers.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.name || t.towerNumber || t.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Flat <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={wfFlatId}
                      onChange={(e) => setWfFlatId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={!wfTowerId || wfLoadingFlats}
                    >
                      <option value="">
                        {wfLoadingFlats ? 'Loading flats...' : 'Select flat'}
                      </option>
                      {wfFlats.map((f: any) => (
                        <option key={f.id} value={f.id}>
                          {f.flatNumber || f.unitNumber || f.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Milestone picker - only shown when a specific flat is
                  selected and that flat has an active payment plan.
                  Tapping a milestone fills in the phase + % below, so the
                  user never has to guess the right abstract values. */}
              {wfScope === 'single' && wfFlatId && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Payment plan milestones
                    </label>
                    {wfPlan?.milestones?.length ? (
                      <span className="text-[11px] text-gray-400">
                        Tap to auto-fill phase &amp; progress below
                      </span>
                    ) : null}
                  </div>

                  {wfPlanLoading ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500 p-3 rounded-lg border border-dashed border-gray-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading payment plan…
                    </div>
                  ) : !wfPlan ? (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200 p-3">
                      No active payment plan on this flat. Enter the phase and
                      progress manually below, or attach a plan from the
                      Payment Plans module.
                    </div>
                  ) : !wfPlan.milestones?.length ? (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200 p-3">
                      This plan has no milestones defined yet.
                    </div>
                  ) : (
                    <MilestoneList
                      milestones={wfPlan.milestones}
                      selectedSeq={wfSelectedMilestoneSeq}
                      onSelect={pickMilestone}
                    />
                  )}
                </div>
              )}

              {/* Phase + % inputs. Prefilled when a milestone is selected,
                  but still editable for edge cases (e.g. a one-off log that
                  does not match any milestone exactly). */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Construction phase <span className="text-red-600">*</span>
                    {wfSelectedMilestoneSeq != null && (
                      <span className="ml-1 text-[10px] text-emerald-600 normal-case font-normal">
                        auto-filled
                      </span>
                    )}
                  </label>
                  <select
                    value={wfPhase}
                    onChange={(e) => {
                      setWfPhase(e.target.value);
                      // Manual edit clears the "linked to milestone" marker
                      setWfSelectedMilestoneSeq(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {WORKFLOW_PHASES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phase progress % <span className="text-red-600">*</span>
                    {wfSelectedMilestoneSeq != null && (
                      <span className="ml-1 text-[10px] text-emerald-600 normal-case font-normal">
                        auto-filled
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={wfPhaseProgress}
                    onChange={(e) => {
                      setWfPhaseProgress(e.target.value);
                      setWfSelectedMilestoneSeq(null);
                    }}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 italic">
                Milestone payment-plans that link to this phase and whose
                required % has been reached will raise a demand draft. Duplicate
                drafts are skipped automatically.
              </p>
            </div>
          )}
        </div>

        {/* Site Photos */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#A8211B' }}>
            <Camera className="w-5 h-5" /> Site Photos
            <span className="text-sm font-normal text-gray-400">(up to 5 images, max 10 MB each)</span>
          </h3>

          {/* Drop zone / file picker */}
          <div
            className="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#A8211B40' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={selectedFiles.length >= 5}
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              {selectedFiles.length >= 5
                ? 'Maximum 5 photos selected'
                : 'Click to select photos - JPEG, PNG, WebP'}
            </p>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex gap-3 flex-wrap mt-3">
              {previews.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ width: 88, height: 88 }}>
                  <Image
                    src={url}
                    alt={`preview-${idx}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">
                    {(selectedFiles[idx]?.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              ))}
              {selectedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-[88px] h-[88px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Add more</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {uploadingPhotos ? 'Uploading photos…' : loading ? 'Saving…' : 'Save Progress Log'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

const PHASE_BADGE: Record<string, string> = {
  FOUNDATION: 'bg-amber-100 text-amber-700',
  STRUCTURE: 'bg-blue-100 text-blue-700',
  MEP: 'bg-purple-100 text-purple-700',
  FINISHING: 'bg-green-100 text-green-700',
  HANDOVER: 'bg-indigo-100 text-indigo-700',
};

const STATUS_BADGE: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  TRIGGERED: 'bg-amber-100 text-amber-700',
  OVERDUE: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-600',
};

/**
 * Scrollable, tappable list of milestones from a FlatPaymentPlan.
 *
 * UX rules:
 *  - PAID milestones are shown (for context) but disabled.
 *  - TRIGGERED / OVERDUE milestones are highlighted - those are the ones
 *    we usually want to log against.
 *  - Milestones with no construction phase (e.g. TIME_LINKED booking fee)
 *    are shown as info-only, not tappable.
 */
function MilestoneList({
  milestones,
  selectedSeq,
  onSelect,
}: {
  milestones: FlatPaymentMilestone[];
  selectedSeq: number | null;
  onSelect: (m: FlatPaymentMilestone) => void;
}) {
  const sorted = [...milestones].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
      {sorted.map((m) => {
        const isPaid = m.status === 'PAID';
        const isTappable = !!m.constructionPhase && m.phasePercentage != null && !isPaid;
        const isSelected = selectedSeq === m.sequence;

        const base =
          'w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors';
        const interactive = isTappable
          ? 'hover:bg-red-50/60 cursor-pointer'
          : 'cursor-default';
        const selected = isSelected
          ? 'bg-red-50 ring-1 ring-inset ring-[#A8211B]'
          : '';
        const disabled = isPaid ? 'opacity-60' : '';

        const body = (
          <>
            <div className="pt-0.5 shrink-0">
              {isSelected ? (
                <CheckCircle2 className="w-4 h-4 text-[#A8211B]" />
              ) : (
                <span
                  className="inline-block w-4 h-4 rounded-full border border-gray-300"
                  aria-hidden
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {m.sequence}. {m.name}
                </p>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                    STATUS_BADGE[m.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                {m.constructionPhase ? (
                  <span
                    className={`px-1.5 py-0.5 rounded-md font-medium ${
                      PHASE_BADGE[m.constructionPhase] ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {m.constructionPhase}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                    TIME-LINKED
                  </span>
                )}
                {m.phasePercentage != null && (
                  <span>@ {m.phasePercentage}%</span>
                )}
                {Number(m.amount) > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="tabular-nums">
                      ₹{Number(m.amount).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
                {m.dueDate && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>due {new Date(m.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </>
                )}
              </div>
              {m.description && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                  {m.description}
                </p>
              )}
            </div>
          </>
        );

        if (!isTappable) {
          return (
            <div key={m.sequence} className={`${base} ${disabled}`}>
              {body}
            </div>
          );
        }

        return (
          <button
            key={m.sequence}
            type="button"
            onClick={() => onSelect(m)}
            className={`${base} ${interactive} ${selected}`}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}
