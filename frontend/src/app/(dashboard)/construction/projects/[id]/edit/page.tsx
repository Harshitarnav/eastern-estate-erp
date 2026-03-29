'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/services/api';
import { brandPalette } from '@/utils/brand';
import { ChevronLeft, Loader2, Save } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PLANNING',    label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD',     label: 'On Hold' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'CANCELLED',   label: 'Cancelled' },
];

export default function EditConstructionProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [employees, setEmployees]   = useState<any[]>([]);

  const [form, setForm] = useState({
    propertyId:              '',
    projectName:             '',
    startDate:               '',
    expectedCompletionDate:  '',
    actualEndDate:           '',
    status:                  'PLANNING',
    budgetAllocated:         '',
    projectManagerId:        '',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/construction-projects/${id}`),
      api.get('/properties'),
      api.get('/employees'),
    ]).then(([project, props, emps]) => {
      const p = project as any;
      setForm({
        propertyId:             p.propertyId             ?? '',
        projectName:            p.projectName            ?? '',
        startDate:              p.startDate              ? p.startDate.slice(0, 10)              : '',
        expectedCompletionDate: p.expectedCompletionDate ? p.expectedCompletionDate.slice(0, 10) : '',
        actualEndDate:          p.actualEndDate          ? p.actualEndDate.slice(0, 10)          : '',
        status:                 p.status                 ?? 'PLANNING',
        budgetAllocated:        p.budgetAllocated != null ? String(p.budgetAllocated) : '',
        projectManagerId:       p.projectManagerId       ?? '',
      });
      const extractArray = (d: any) => Array.isArray(d) ? d : (d?.data ?? []);
      setProperties(extractArray(props));
      setEmployees(extractArray(emps));
    }).catch(err => {
      console.error('Failed to load project:', err);
      alert('Failed to load project details.');
      router.push('/construction/projects');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        propertyId:             form.propertyId             || null,
        projectName:            form.projectName,
        startDate:              form.startDate,
        expectedCompletionDate: form.expectedCompletionDate,
        status:                 form.status,
        projectManagerId:       form.projectManagerId       || null,
        budgetAllocated:        parseFloat(form.budgetAllocated) || 0,
      };
      // Only include actualEndDate if the column exists in prod (migration v008)
      if (form.actualEndDate) payload.actualEndDate = form.actualEndDate;

      await api.patch(`/construction-projects/${id}`, payload);
      router.push(`/construction/projects/${id}`);
    } catch (err: any) {
      const msg = Array.isArray(err.response?.data?.message)
        ? err.response.data.message.join(', ')
        : (err.response?.data?.message || 'Failed to update project');
      alert(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/construction/projects/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#A8211B] transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Project
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Construction Project</h1>
        <p className="text-sm text-gray-500 mt-0.5">Update project details, timeline, and team assignment.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 max-w-3xl" style={{ borderColor: `${brandPalette.neutral}80` }}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Project Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              required
              placeholder="e.g. Tower A — Phase 1"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm"
            />
          </div>

          {/* Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Property</label>
            <select
              name="propertyId"
              value={form.propertyId}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm bg-white"
            >
              <option value="">No property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm bg-white"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm"
            />
          </div>

          {/* Expected Completion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Expected Completion <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expectedCompletionDate"
              value={form.expectedCompletionDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm"
            />
          </div>

          {/* Actual End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Actual End Date
              <span className="ml-1 text-xs text-gray-400">(fill when completed)</span>
            </label>
            <input
              type="date"
              name="actualEndDate"
              value={form.actualEndDate}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm"
            />
          </div>

          {/* Budget Allocated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Allocated (₹)</label>
            <input
              type="number"
              name="budgetAllocated"
              value={form.budgetAllocated}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm"
            />
          </div>

          {/* Project Manager */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Manager</label>
            <select
              name="projectManagerId"
              value={form.projectManagerId}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8211B] focus:border-transparent text-sm bg-white"
            >
              <option value="">Unassigned</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName}{e.designation ? ` — ${e.designation}` : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <button
            type="button"
            onClick={() => router.push(`/construction/projects/${id}`)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: brandPalette.primary }}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
