'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  FilePlus,
} from 'lucide-react';
import { paymentPlansService, FlatPaymentPlan, FlatPaymentMilestone } from '@/services/payment-plans.service';
import { demandDraftsService } from '@/services/demand-drafts.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const CONSTRUCTION_PHASES = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'] as const;
const MILESTONE_STATUSES = ['PENDING', 'TRIGGERED', 'PAID', 'OVERDUE'] as const;

function newMilestone(sequence: number): FlatPaymentMilestone {
  return {
    sequence,
    name: '',
    constructionPhase: null,
    phasePercentage: null,
    amount: 0,
    dueDate: null,
    status: 'PENDING',
    paymentScheduleId: null,
    constructionCheckpointId: null,
    demandDraftId: null,
    paymentId: null,
    completedAt: null,
    description: '',
  };
}

export default function PaymentPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [plan, setPlan] = useState<FlatPaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingInvoiceFor, setGeneratingInvoiceFor] = useState<number | null>(null); // milestone sequence
  // Map of demandDraftId → current status (fetched after load)
  const [draftStatusMap, setDraftStatusMap] = useState<Record<string, string>>({});
  // Preview-before-generate state
  const [previewMilestone, setPreviewMilestone] = useState<FlatPaymentMilestone | null>(null);

  // Editable copies
  const [editedMilestones, setEditedMilestones] = useState<FlatPaymentMilestone[]>([]);
  const [editedTotalAmount, setEditedTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const loadDraftStatuses = async (data: FlatPaymentPlan) => {
    // Collect all milestone demandDraftIds that exist
    const ids = (data.milestones ?? [])
      .map(m => m.demandDraftId)
      .filter((id): id is string => !!id);
    if (ids.length === 0) return;
    try {
      // Fetch each draft in parallel and build a status map
      const results = await Promise.allSettled(
        ids.map(id => demandDraftsService.getDemandDraft(id))
      );
      const map: Record<string, string> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[ids[i]] = r.value.status;
      });
      setDraftStatusMap(map);
    } catch {
      // Non-critical — just skip
    }
  };

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await paymentPlansService.getFlatPaymentPlan(planId);
      setPlan(data);
      loadDraftStatuses(data);
    } catch (error: any) {
      toast.error('Failed to load payment plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const enterEditMode = () => {
    if (!plan) return;
    setEditedMilestones(plan.milestones.map(m => ({ ...m })));
    setEditedTotalAmount(Number(plan.totalAmount));
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedMilestones([]);
  };

  const saveChanges = async () => {
    if (!plan) return;
    try {
      setSaving(true);

      // Reassign sequences to be contiguous
      const normalised = editedMilestones.map((m, i) => ({ ...m, sequence: i + 1 }));

      // Update total if changed
      if (Number(editedTotalAmount) !== Number(plan.totalAmount)) {
        await paymentPlansService.updatePlan(planId, { totalAmount: Number(editedTotalAmount) });
      }

      // Bulk replace milestones
      const updated = await paymentPlansService.updateMilestonesBulk(planId, normalised);
      setPlan(updated);
      setEditMode(false);
      toast.success('Payment plan saved successfully');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Failed to save payment plan');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ── generate demand invoice for a milestone ────────────────────────────────

  /** Builds a branded HTML demand notice using data already on the page */
  const buildDraftHtml = (milestone: FlatPaymentMilestone): string => {
    if (!plan) return '';
    const customerName = plan.customer?.fullName ?? 'Customer';
    const propertyName = plan.flat?.property?.name ?? '';
    const towerName   = plan.flat?.tower?.name ?? '';
    const flatNumber  = plan.flat?.flatNumber ?? '';
    const bookingNo   = plan.booking?.bookingNumber ?? '';
    const today       = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const dueDate     = milestone.dueDate
      ? new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—';
    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; margin: 0; padding: 0; }
    .page { max-width: 800px; margin: 0 auto; padding: 32px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #A8211B; padding-bottom: 16px; margin-bottom: 24px; }
    .header .company { font-size: 22px; font-weight: 700; color: #7B1E12; }
    .header .sub { font-size: 12px; color: #666; margin-top: 2px; }
    .title { text-align: center; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #A8211B; margin-bottom: 24px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .meta-item label { font-size: 11px; color: #666; text-transform: uppercase; }
    .meta-item .val { font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #A8211B; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    tr.total td { font-weight: 700; background: #fef9f0; }
    .note { background: #fef3cd; border-left: 4px solid #F2C94C; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 12px; }
    .footer { border-top: 1px solid #eee; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
    .sign-block { text-align: right; }
    .sign-block .line { margin-top: 40px; border-top: 1px solid #999; width: 180px; display: inline-block; }
    .sign-block p { margin: 4px 0; font-size: 11px; color: #444; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company">Eastern Estate</div>
      <div class="sub">Construction &amp; Development</div>
    </div>
    <div style="text-align:right; font-size:11px; color:#666;">
      <div>Date: ${today}</div>
      ${bookingNo ? `<div>Booking No: ${bookingNo}</div>` : ''}
    </div>
  </div>

  <div class="title">Demand Notice</div>

  <div class="meta-grid">
    <div class="meta-item">
      <label>To</label>
      <div class="val">${customerName}</div>
    </div>
    <div class="meta-item">
      <label>Unit</label>
      <div class="val">${[propertyName, towerName, flatNumber].filter(Boolean).join(' › ')}</div>
    </div>
    <div class="meta-item">
      <label>Milestone</label>
      <div class="val">${milestone.name}</div>
    </div>
    ${milestone.constructionPhase ? `
    <div class="meta-item">
      <label>Construction Phase</label>
      <div class="val">${milestone.constructionPhase}${milestone.phasePercentage != null ? ` (${milestone.phasePercentage}%)` : ''}</div>
    </div>` : ''}
  </div>

  <p>Dear <strong>${customerName}</strong>,</p>
  <p>
    As per your registered payment plan, the construction of your unit has reached the
    <strong>${milestone.name}</strong> milestone. The following installment is now due.
  </p>

  <table>
    <thead>
      <tr>
        <th>#</th><th>Description</th><th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${milestone.sequence}</td>
        <td>${milestone.name}${milestone.description ? ` – ${milestone.description}` : ''}</td>
        <td style="text-align:right">${fmt(milestone.amount)}</td>
      </tr>
      <tr class="total">
        <td colspan="2" style="text-align:right">Amount Payable</td>
        <td style="text-align:right">${fmt(milestone.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="meta-grid" style="margin-bottom:16px;">
    <div class="meta-item">
      <label>Total Property Value</label>
      <div class="val">${fmt(plan.totalAmount)}</div>
    </div>
    <div class="meta-item">
      <label>Total Paid So Far</label>
      <div class="val">${fmt(plan.paidAmount)}</div>
    </div>
    <div class="meta-item">
      <label>Current Installment</label>
      <div class="val" style="color:#A8211B;">${fmt(milestone.amount)}</div>
    </div>
    <div class="meta-item">
      <label>Due Date</label>
      <div class="val">${dueDate}</div>
    </div>
  </div>

  <div class="note">
    ⚠ Please make the payment on or before <strong>${dueDate}</strong> to avoid any delays.
    For payment instructions or queries, please contact our accounts department.
  </div>

  <div class="footer">
    <div>Eastern Estate Construction &amp; Development</div>
    <div class="sign-block">
      <div class="line"></div>
      <p>Authorised Signatory</p>
      <p>Accounts Department</p>
    </div>
  </div>
</div>
</body>
</html>`;
  };

  const generateInvoice = async (milestone: FlatPaymentMilestone) => {
    if (!plan) return;
    try {
      setGeneratingInvoiceFor(milestone.sequence);
      const flatNumber  = plan.flat?.flatNumber ?? '';
      const towerName   = plan.flat?.tower?.name ?? '';
      const propertyName = plan.flat?.property?.name ?? '';
      const customerName = plan.customer?.fullName ?? '';

      // Build a human-readable title: "A-101 / Tower A - On Possession"
      const titleParts = [flatNumber, towerName].filter(Boolean).join(' / ');
      const draftTitle = titleParts
        ? `${titleParts} – ${milestone.name}`
        : milestone.name;

      const draft = await demandDraftsService.create({
        flatId: plan.flatId,
        customerId: plan.customerId,
        bookingId: plan.bookingId,
        amount: milestone.amount,
        title: draftTitle,
        dueDate: milestone.dueDate ?? undefined,
        status: 'DRAFT',
        content: buildDraftHtml(milestone),
        metadata: {
          milestoneName: milestone.name,
          milestoneSequence: milestone.sequence,
          constructionPhase: milestone.constructionPhase,
          phasePercentage: milestone.phasePercentage,
          flatPaymentPlanId: plan.id,
          flatNumber,
          towerName,
          propertyName,
          customerName,
        },
      });
      toast.success(`Demand invoice created for "${milestone.name}"`);
      router.push(`/demand-drafts/${draft.id}`);
    } catch (err: any) {
      toast.error(err?.userMessage || 'Failed to create demand invoice');
      console.error(err);
    } finally {
      setGeneratingInvoiceFor(null);
    }
  };

  // ── milestone edit helpers ──────────────────────────────────────────────────

  const updateMilestone = useCallback((index: number, field: keyof FlatPaymentMilestone, value: any) => {
    setEditedMilestones(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addMilestone = () => {
    setEditedMilestones(prev => [
      ...prev,
      newMilestone(prev.length + 1),
    ]);
  };

  const removeMilestone = (index: number) => {
    setEditedMilestones(prev => prev.filter((_, i) => i !== index));
  };

  // ── derived totals for edit mode ──────────────────────────────────────────

  const editPaidAmount = editedMilestones
    .filter(m => m.status === 'PAID')
    .reduce((s, m) => s + Number(m.amount), 0);
  const editBalanceAmount = Number(editedTotalAmount) - editPaidAmount;
  const editMilestoneTotal = editedMilestones.reduce((s, m) => s + Number(m.amount), 0);

  // ── display helpers ───────────────────────────────────────────────────────

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'PAID': return 'bg-green-600';
      case 'TRIGGERED': return 'bg-blue-600';
      case 'OVERDUE': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  // ── loading / not-found states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading payment plan...</span>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Payment Plan Not Found</h2>
        <Button onClick={() => router.push('/payment-plans')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payment Plans
        </Button>
      </div>
    );
  }

  const displayMilestones = editMode ? editedMilestones : plan.milestones;
  const completedMilestones = plan.milestones.filter(m => m.status === 'PAID').length;
  const progressPercentage = plan.milestones.length > 0
    ? (completedMilestones / plan.milestones.length) * 100
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/payment-plans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Plan Details</h1>
            <p className="text-muted-foreground">
              {plan.flat?.property?.name} – {plan.flat?.tower?.name} – {plan.flat?.flatNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(plan.status)} variant="default">
            {plan.status}
          </Badge>
          {!editMode ? (
            <Button variant="outline" onClick={enterEditMode}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Plan
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveChanges} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {editMode ? (
              <Input
                type="number"
                value={editedTotalAmount}
                onChange={e => setEditedTotalAmount(Number(e.target.value))}
                className="text-lg font-bold h-8"
              />
            ) : (
              <div className="text-2xl font-bold">₹{Number(plan.totalAmount).toLocaleString('en-IN')}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{(editMode ? editPaidAmount : Number(plan.paidAmount)).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayMilestones.filter(m => m.status === 'PAID').length} of {displayMilestones.length} milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₹{(editMode ? editBalanceAmount : Number(plan.balanceAmount)).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayMilestones.filter(m => m.status !== 'PAID').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-green-500" style={{ width: `${progressPercentage}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Edit mode: milestone total vs total amount warning ── */}
      {editMode && (
        <div
          className={`rounded-md border px-4 py-3 text-sm flex items-center justify-between
            ${Math.abs(editMilestoneTotal - Number(editedTotalAmount)) > 1
              ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
              : 'bg-green-50 border-green-300 text-green-800'}`}
        >
          <span>
            Milestone total: <strong>₹{editMilestoneTotal.toLocaleString('en-IN')}</strong>
            &nbsp;/ Plan total: <strong>₹{Number(editedTotalAmount).toLocaleString('en-IN')}</strong>
          </span>
          {Math.abs(editMilestoneTotal - Number(editedTotalAmount)) > 1 ? (
            <span className="font-medium">⚠ Milestone amounts don't sum to plan total</span>
          ) : (
            <span className="font-medium">✓ Amounts match</span>
          )}
        </div>
      )}

      {/* ── Property & Customer Details ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Property</div>
              <div className="font-medium">{plan.flat?.property?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tower</div>
              <div className="font-medium">{plan.flat?.tower?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Flat Number</div>
              <div className="font-medium">{plan.flat?.flatNumber || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Booking Number</div>
              <div className="font-medium">{plan.booking?.bookingNumber || 'N/A'}</div>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/flats/${plan.flatId}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Flat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/ledger/${plan.bookingId}`)}
                className="border-orange-600 text-orange-700 hover:bg-orange-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                View Ledger
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{plan.customer?.fullName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{plan.customer?.email || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{plan.customer?.phoneNumber || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Payment Plan Template</div>
              <div className="font-medium">{plan.paymentPlanTemplate?.name || 'N/A'}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/customers/${plan.customerId}`)}
              className="mt-2"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Customer Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Milestones ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Milestones</CardTitle>
            <CardDescription>
              {editMode
                ? 'Edit milestones inline — add, remove or reorder rows, then Save Changes.'
                : 'Construction-linked payment milestones'}
            </CardDescription>
          </div>
          {editMode && (
            <Button variant="outline" size="sm" onClick={addMilestone}>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="min-w-[180px]">Milestone Name</TableHead>
                  <TableHead className="min-w-[150px]">Construction Phase</TableHead>
                  <TableHead className="w-24">Phase %</TableHead>
                  <TableHead className="min-w-[140px]">Amount (₹)</TableHead>
                  <TableHead className="w-36">Due Date</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                  {!editMode && <TableHead className="w-32">Completed At</TableHead>}
                  {!editMode && <TableHead className="w-40">Invoice</TableHead>}
                  {editMode && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayMilestones
                  .slice()
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((milestone, index) => (
                    <TableRow key={editMode ? index : milestone.sequence}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        {editMode ? (
                          <Input
                            value={milestone.name}
                            onChange={e => updateMilestone(index, 'name', e.target.value)}
                            placeholder="e.g. On Possession"
                            className="h-8"
                          />
                        ) : (
                          <div>
                            <div className="font-medium">{milestone.name}</div>
                            {milestone.description && (
                              <div className="text-xs text-muted-foreground">{milestone.description}</div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Construction Phase */}
                      <TableCell>
                        {editMode ? (
                          <Select
                            value={milestone.constructionPhase ?? '__none__'}
                            onValueChange={v =>
                              updateMilestone(index, 'constructionPhase', v === '__none__' ? null : v)
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">None</SelectItem>
                              {CONSTRUCTION_PHASES.map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : milestone.constructionPhase ? (
                          <Badge variant="outline">{milestone.constructionPhase}</Badge>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>

                      {/* Phase % */}
                      <TableCell>
                        {editMode ? (
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={milestone.phasePercentage ?? ''}
                            onChange={e =>
                              updateMilestone(
                                index,
                                'phasePercentage',
                                e.target.value === '' ? null : Number(e.target.value),
                              )
                            }
                            placeholder="–"
                            className="h-8 w-20"
                          />
                        ) : milestone.phasePercentage != null ? (
                          <span className="font-medium">{milestone.phasePercentage}%</span>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        {editMode ? (
                          <Input
                            type="number"
                            min={0}
                            value={milestone.amount}
                            onChange={e => updateMilestone(index, 'amount', Number(e.target.value))}
                            className="h-8"
                          />
                        ) : (
                          <span className="font-medium">
                            ₹{Number(milestone.amount).toLocaleString('en-IN')}
                          </span>
                        )}
                      </TableCell>

                      {/* Due Date */}
                      <TableCell>
                        {editMode ? (
                          <Input
                            type="date"
                            value={milestone.dueDate ? milestone.dueDate.slice(0, 10) : ''}
                            onChange={e =>
                              updateMilestone(index, 'dueDate', e.target.value || null)
                            }
                            className="h-8"
                          />
                        ) : milestone.dueDate ? (
                          new Date(milestone.dueDate).toLocaleDateString('en-IN')
                        ) : (
                          '–'
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {editMode ? (
                          <Select
                            value={milestone.status}
                            onValueChange={v =>
                              updateMilestone(index, 'status', v as FlatPaymentMilestone['status'])
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MILESTONE_STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Completed At (read mode only) */}
                      {!editMode && (
                        <TableCell>
                          {milestone.completedAt
                            ? new Date(milestone.completedAt).toLocaleDateString('en-IN')
                            : '–'}
                        </TableCell>
                      )}

                      {/* Generate / View Invoice (read mode only) */}
                      {!editMode && (
                        <TableCell>
                          {milestone.demandDraftId ? (
                            <div className="flex flex-col items-start gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/demand-drafts/${milestone.demandDraftId}`)}
                                className="h-7 text-xs"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Invoice
                              </Button>
                              {draftStatusMap[milestone.demandDraftId] && (
                                <Badge
                                  className={`text-[10px] h-4 px-1.5 ${
                                    draftStatusMap[milestone.demandDraftId] === 'SENT'
                                      ? 'bg-green-600'
                                      : draftStatusMap[milestone.demandDraftId] === 'READY'
                                      ? 'bg-blue-500'
                                      : draftStatusMap[milestone.demandDraftId] === 'DRAFT'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'
                                  }`}
                                >
                                  {draftStatusMap[milestone.demandDraftId]}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={generatingInvoiceFor === milestone.sequence}
                              onClick={() => setPreviewMilestone(milestone)}
                              className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              {generatingInvoiceFor === milestone.sequence ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <FilePlus className="mr-1 h-3 w-3" />
                              )}
                              Gen. Invoice
                            </Button>
                          )}
                        </TableCell>
                      )}

                      {/* Remove row (edit mode only) */}
                      {editMode && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => removeMilestone(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

                {displayMilestones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={editMode ? 8 : 9} className="text-center text-muted-foreground py-8">
                      {editMode ? 'No milestones yet — click "Add Milestone" to start.' : 'No milestones found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Related Links (read mode only) ── */}
      {!editMode && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/construction-milestones')}>
            View Construction Milestones
          </Button>
          <Button variant="outline" onClick={() => router.push('/construction-progress-simple')}>
            Log Construction Progress
          </Button>
        </div>
      )}

      {/* ── Preview Before Generate Invoice Dialog ──────────────────────────── */}
      <Dialog open={!!previewMilestone} onOpenChange={(open) => { if (!open) setPreviewMilestone(null); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Confirm Demand Invoice</DialogTitle>
            <DialogDescription>
              Review the details below. A demand draft will be created and you'll be taken to
              its edit page where you can make further adjustments before sending.
            </DialogDescription>
          </DialogHeader>

          {previewMilestone && plan && (
            <div className="space-y-4 py-2">
              {/* Key details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Customer',   plan.customer?.fullName ?? '—'],
                  ['Property',   plan.flat?.property?.name ?? '—'],
                  ['Tower',      plan.flat?.tower?.name ?? '—'],
                  ['Flat / Unit', plan.flat?.flatNumber ?? '—'],
                  ['Booking No', plan.booking?.bookingNumber ?? '—'],
                  ['Milestone',  previewMilestone.name],
                  previewMilestone.constructionPhase
                    ? ['Phase', `${previewMilestone.constructionPhase}${previewMilestone.phasePercentage != null ? ` (${previewMilestone.phasePercentage}%)` : ''}`]
                    : null,
                  ['Due Date', previewMilestone.dueDate
                    ? new Date(previewMilestone.dueDate).toLocaleDateString('en-IN')
                    : '—'],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label as string} className="border-b pb-2">
                    <p className="text-[11px] uppercase text-gray-400 tracking-wide">{label}</p>
                    <p className="font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Amount highlight */}
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">Demand Amount</span>
                <span className="text-2xl font-bold" style={{ color: '#A8211B' }}>
                  ₹{Number(previewMilestone.amount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Draft title preview */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                <span className="font-medium">Draft title will be: </span>
                {[plan.flat?.flatNumber, plan.flat?.tower?.name].filter(Boolean).join(' / ')}
                {previewMilestone.name ? ` – ${previewMilestone.name}` : ''}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewMilestone(null)}>
              Cancel
            </Button>
            <Button
              disabled={generatingInvoiceFor === previewMilestone?.sequence}
              onClick={() => {
                if (previewMilestone) {
                  setPreviewMilestone(null);
                  generateInvoice(previewMilestone);
                }
              }}
              style={{ backgroundColor: '#A8211B', color: '#fff' }}
            >
              {generatingInvoiceFor === previewMilestone?.sequence
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
                : <><FilePlus className="mr-2 h-4 w-4" /> Create Invoice</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
