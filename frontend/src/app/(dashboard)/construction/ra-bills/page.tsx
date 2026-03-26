'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { CardGridSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';
import {
  FileText, Plus, ChevronRight, Calendar, DollarSign,
  CheckCircle, Clock, AlertTriangle, Search, X,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-700',   bg: 'bg-gray-100',    border: 'border-gray-200' },
  SUBMITTED: { label: 'Submitted', color: 'text-blue-700',   bg: 'bg-blue-50',     border: 'border-blue-200' },
  CERTIFIED: { label: 'Certified', color: 'text-purple-700', bg: 'bg-purple-50',   border: 'border-purple-200' },
  APPROVED:  { label: 'Approved',  color: 'text-green-700',  bg: 'bg-green-50',    border: 'border-green-200' },
  PAID:      { label: 'Paid',      color: 'text-emerald-700',bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  REJECTED:  { label: 'Rejected',  color: 'text-red-700',    bg: 'bg-red-50',      border: 'border-red-200' },
};

function RABillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('projectId') ?? '';

  const [bills, setBills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any | null>(null);
  const [filterProject, setFilterProject] = useState(projectIdFromUrl);
  const [filterStatus, setFilterStatus] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    constructionProjectId: projectIdFromUrl,
    vendorId: '',
    billDate: new Date().toISOString().split('T')[0],
    billPeriodStart: '',
    billPeriodEnd: '',
    workDescription: '',
    grossAmount: '',
    previousBillsAmount: '',
    retentionPercentage: '5',
    advanceDeduction: '0',
    otherDeductions: '0',
    otherDeductionsDescription: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    loadBills();
  }, [filterProject, filterStatus]);

  const loadMasters = async () => {
    try {
      // api.get() returns response.data directly (not a full Axios response)
      const [projData, vendorData] = await Promise.all([
        api.get('/construction-projects'),
        api.get('/vendors'),
      ]);
      setProjects(Array.isArray(projData) ? projData : (projData?.data || []));
      setVendors(Array.isArray(vendorData) ? vendorData : (vendorData?.data || []));
    } catch (e) { console.error(e); }
  };

  const loadBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProject) params.set('constructionProjectId', filterProject);
      if (filterStatus) params.set('status', filterStatus);
      const data = await api.get(`/ra-bills?${params.toString()}`);
      setBills(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const calc = () => {
    const gross = parseFloat(form.grossAmount) || 0;
    const prev = parseFloat(form.previousBillsAmount) || 0;
    const net = gross - prev;
    const retention = Math.round(net * (parseFloat(form.retentionPercentage) || 0) / 100 * 100) / 100;
    const advance = parseFloat(form.advanceDeduction) || 0;
    const other = parseFloat(form.otherDeductions) || 0;
    const payable = net - retention - advance - other;
    return { net, retention, payable };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.constructionProjectId || !form.vendorId || !form.workDescription || !form.grossAmount) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/ra-bills', {
        ...form,
        grossAmount: parseFloat(form.grossAmount),
        previousBillsAmount: parseFloat(form.previousBillsAmount) || 0,
        retentionPercentage: parseFloat(form.retentionPercentage) || 0,
        advanceDeduction: parseFloat(form.advanceDeduction) || 0,
        otherDeductions: parseFloat(form.otherDeductions) || 0,
      });
      setShowCreateModal(false);
      loadBills();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create RA Bill');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      constructionProjectId: filterProject,
      vendorId: '',
      billDate: new Date().toISOString().split('T')[0],
      billPeriodStart: '', billPeriodEnd: '',
      workDescription: '',
      grossAmount: '', previousBillsAmount: '',
      retentionPercentage: '5',
      advanceDeduction: '0', otherDeductions: '0',
      otherDeductionsDescription: '', notes: '',
    });
  };

  const handleAction = async (billId: string, action: string, extra?: any) => {
    setActionLoading(billId + action);
    try {
      await api.post(`/ra-bills/${billId}/${action}`, extra || {});
      loadBills();
      if (showDetailModal?.id === billId) {
        const detail = await api.get(`/ra-bills/${billId}`);
        setShowDetailModal(detail);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtCur = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

  const { net, retention, payable } = calc();

  // Summary stats
  const totalPendingApproval = bills.filter(b => ['SUBMITTED', 'CERTIFIED'].includes(b.status)).length;
  const totalPayable = bills.filter(b => b.status === 'APPROVED').reduce((s, b) => s + Number(b.netPayable), 0);
  const totalPaid = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + Number(b.netPayable), 0);
  const totalRetention = bills.reduce((s, b) => s + Number(b.retentionAmount), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Hero */}
      <BrandHero
        eyebrow="RA Bills — Running Account Bills"
        title={<>Pay contractors by <span style={{ color: brandPalette.accent }}>certified work stages</span></>}
        description="Create, certify, approve and pay Running Account Bills. Track retention held, gross values, and payment status for every contractor and project."
        actions={
          <BrandPrimaryButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> New RA Bill
          </BrandPrimaryButton>
        }
      />

      {/* Stat Cards */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Bills"
          primary={formatIndianNumber(bills.length)}
          subLabel={`${totalPendingApproval} pending approval`}
          icon={<FileText className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Pending Approval"
          primary={formatIndianNumber(totalPendingApproval)}
          subLabel="Submitted or certified"
          icon={<Clock className="w-7 h-7" />}
          accentColor="rgba(234,88,12,0.2)"
        />
        <BrandStatCard
          title="Approved & Due"
          primary={formatToCrore(totalPayable)}
          subLabel="Ready for payment"
          icon={<CheckCircle className="w-7 h-7" />}
          accentColor="rgba(22,163,74,0.2)"
        />
        <BrandStatCard
          title="Retention Held"
          primary={formatToCrore(totalRetention)}
          subLabel="Security deposits"
          icon={<DollarSign className="w-7 h-7" />}
          accentColor="rgba(37,99,235,0.2)"
        />
      </section>

      {/* Workflow Banner */}
      <div
        className="rounded-2xl border bg-white/90 shadow-sm p-4 flex flex-wrap items-center gap-2"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase mr-2">Workflow</span>
        {['Draft', 'Submit', 'Certify', 'Approve', 'Pay'].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1 font-medium">{step}</span>
            {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="flex-1 px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(filterProject || filterStatus) && (
            <button
              onClick={() => { setFilterProject(''); setFilterStatus(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bills List */}
      {loading ? (
        <CardGridSkeleton cards={3} />
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center shadow-sm" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>No RA Bills Yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first Running Account Bill to track contractor payments.</p>
          <BrandPrimaryButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Create First RA Bill
          </BrandPrimaryButton>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map(bill => {
            const sc = STATUS_CONFIG[bill.status] || STATUS_CONFIG.DRAFT;
            return (
              <div
                key={bill.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <p className="font-bold text-gray-900 text-lg">{bill.raBillNumber}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${sc.color} ${sc.bg} ${sc.border}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {bill.vendor?.vendorName || '—'} · {bill.constructionProject?.projectName || '—'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{fmt(bill.billDate)}
                      {bill.billPeriodStart && ` · ${fmt(bill.billPeriodStart)} – ${fmt(bill.billPeriodEnd)}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-right shrink-0">
                    <div>
                      <p className="text-xs text-gray-400">Gross Value</p>
                      <p className="font-bold text-gray-900">{fmtCur(bill.grossAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Retention</p>
                      <p className="font-medium text-orange-600">−{fmtCur(bill.retentionAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Net Payable</p>
                      <p className="font-bold text-lg" style={{ color: brandPalette.success }}>{fmtCur(bill.netPayable)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => setShowDetailModal(bill)}
                      className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50 font-medium"
                      style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
                    >
                      Details
                    </button>
                    {bill.status === 'DRAFT' && (
                      <button onClick={() => handleAction(bill.id, 'submit')}
                        disabled={actionLoading === bill.id + 'submit'}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                        Submit
                      </button>
                    )}
                    {bill.status === 'SUBMITTED' && (
                      <button onClick={() => handleAction(bill.id, 'certify')}
                        disabled={actionLoading === bill.id + 'certify'}
                        className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                        Certify
                      </button>
                    )}
                    {bill.status === 'CERTIFIED' && (
                      <button onClick={() => handleAction(bill.id, 'approve')}
                        disabled={actionLoading === bill.id + 'approve'}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                        Approve
                      </button>
                    )}
                    {bill.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          const ref = prompt('Enter payment reference / NEFT UTR:');
                          if (ref !== null) handleAction(bill.id, 'mark-paid', { paymentReference: ref });
                        }}
                        disabled={actionLoading === bill.id + 'mark-paid'}
                        className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: brandPalette.primary }}>New RA Bill</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Create a running account bill for contractor payment</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
                    <select value={form.constructionProjectId} onChange={e => setForm({ ...form, constructionProjectId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" required>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contractor / Vendor <span className="text-red-500">*</span></label>
                    <select value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" required>
                      <option value="">Select Vendor</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.billDate} onChange={e => setForm({ ...form, billDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retention %</label>
                    <input type="number" value={form.retentionPercentage} min="0" max="20" step="0.5"
                      onChange={e => setForm({ ...form, retentionPercentage: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                    <p className="text-xs text-gray-400 mt-0.5">Usually 5–10% as security deposit</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period From</label>
                    <input type="date" value={form.billPeriodStart} onChange={e => setForm({ ...form, billPeriodStart: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period To</label>
                    <input type="date" value={form.billPeriodEnd} onChange={e => setForm({ ...form, billPeriodEnd: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Description <span className="text-red-500">*</span></label>
                  <textarea value={form.workDescription} onChange={e => setForm({ ...form, workDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" rows={3}
                    placeholder="Describe the work completed in this bill period..." required />
                </div>

                {/* Amount Calculator */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">💰 Amount Calculation</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Total Cumulative Work Value (₹) <span className="text-red-500">*</span></label>
                      <input type="number" value={form.grossAmount} min="0" step="0.01"
                        onChange={e => setForm({ ...form, grossAmount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                        placeholder="Total value certified till date" required />
                      <p className="text-xs text-gray-400 mt-0.5">Cumulative total from all RAs including this one</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Previous Bills Total (₹)</label>
                      <input type="number" value={form.previousBillsAmount} min="0" step="0.01"
                        onChange={e => setForm({ ...form, previousBillsAmount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                        placeholder="Sum of all previous RA bills" />
                      <p className="text-xs text-gray-400 mt-0.5">0 for first RA bill</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Advance Deduction (₹)</label>
                      <input type="number" value={form.advanceDeduction} min="0" step="0.01"
                        onChange={e => setForm({ ...form, advanceDeduction: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Other Deductions (₹)</label>
                      <input type="number" value={form.otherDeductions} min="0" step="0.01"
                        onChange={e => setForm({ ...form, otherDeductions: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>

                  {/* Live Calculation Preview */}
                  {form.grossAmount && (
                    <div className="bg-white rounded-lg p-3 border mt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Net This Bill (Gross − Previous)</span>
                          <span className="font-medium">{fmtCur(net)}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Retention ({form.retentionPercentage}%)</span>
                          <span>− {fmtCur(retention)}</span>
                        </div>
                        {parseFloat(form.advanceDeduction) > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Advance Deduction</span>
                            <span>− {fmtCur(parseFloat(form.advanceDeduction))}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-green-700 border-t pt-1 mt-1">
                          <span>Net Payable</span>
                          <span className="text-lg">{fmtCur(payable)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500" rows={2} />
                </div>

                <div className="flex gap-3 pt-3 border-t">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 text-white rounded-lg font-medium disabled:opacity-50"
                    style={{ backgroundColor: '#A8211B' }}>
                    {saving ? 'Creating...' : 'Create RA Bill'}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 border-2 border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="px-6 py-5 flex items-start justify-between border-b" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{showDetailModal.raBillNumber}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{showDetailModal.vendor?.vendorName} · {showDetailModal.constructionProject?.projectName}</p>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const sc = STATUS_CONFIG[showDetailModal.status] || STATUS_CONFIG.DRAFT;
                  return (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${sc.color} ${sc.bg} ${sc.border}`}>
                      {sc.label}
                    </span>
                  );
                })()}
                <button onClick={() => setShowDetailModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400 text-xs block mb-0.5">Bill Date</span><span className="font-medium">{fmt(showDetailModal.billDate)}</span></div>
                {showDetailModal.billPeriodStart && (
                  <div><span className="text-gray-400 text-xs block mb-0.5">Work Period</span><span className="font-medium">{fmt(showDetailModal.billPeriodStart)} – {fmt(showDetailModal.billPeriodEnd)}</span></div>
                )}
              </div>

              {showDetailModal.workDescription && (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1 font-semibold">Work Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{showDetailModal.workDescription}</p>
                </div>
              )}

              <div className="rounded-xl border divide-y" style={{ borderColor: `${brandPalette.neutral}60` }}>
                {[
                  { label: 'Gross Amount', value: fmtCur(showDetailModal.grossAmount) },
                  { label: 'Previous Bills', value: `−${fmtCur(showDetailModal.previousBillsAmount)}` },
                  { label: 'Net This Bill', value: fmtCur(showDetailModal.netThisBill), bold: true },
                  { label: `Retention (${showDetailModal.retentionPercentage}%)`, value: `−${fmtCur(showDetailModal.retentionAmount)}`, red: true },
                  { label: 'Advance Deduction', value: `−${fmtCur(showDetailModal.advanceDeduction)}` },
                  { label: 'Other Deductions', value: `−${fmtCur(showDetailModal.otherDeductions)}` },
                  { label: 'Net Payable', value: fmtCur(showDetailModal.netPayable), green: true, large: true },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between px-4 py-2.5 text-sm ${row.large ? 'bg-green-50 font-bold' : ''}`}>
                    <span className={row.bold ? 'font-semibold text-gray-800' : 'text-gray-500'}>{row.label}</span>
                    <span className={row.green ? 'text-green-700 font-bold text-base' : row.red ? 'text-orange-600' : ''}>{row.value}</span>
                  </div>
                ))}
              </div>

              {showDetailModal.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <span className="font-semibold block mb-0.5">Notes</span>
                  {showDetailModal.notes}
                </div>
              )}

              {showDetailModal.paymentReference && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                  <span className="font-semibold block mb-0.5">Payment Reference</span>
                  {showDetailModal.paymentReference}
                </div>
              )}

              <button
                onClick={() => setShowDetailModal(null)}
                className="w-full py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RABillsPage() {
  return (
    <Suspense fallback={<div className="p-6"><CardGridSkeleton cards={3} /></div>}>
      <RABillsContent />
    </Suspense>
  );
}
