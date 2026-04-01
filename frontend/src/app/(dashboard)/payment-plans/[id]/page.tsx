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
import { DetailSkeleton } from '@/components/Skeletons';
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

  /** Builds the canonical Eastern Estate Demand Draft HTML */
  const buildDraftHtml = (milestone: FlatPaymentMilestone): string => {
    if (!plan) return '';

    const customerName = plan.customer?.fullName ?? 'Customer';
    const customerEmail = (plan.customer as any)?.email ?? '';
    const customerPhone = (plan.customer as any)?.phoneNumber ?? '';
    const propertyName  = plan.flat?.property?.name ?? '';
    const towerName     = plan.flat?.tower?.name ?? '';
    const flatNumber    = plan.flat?.flatNumber ?? '';
    const bookingNo     = plan.booking?.bookingNumber ?? '';
    const today         = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const dueDateStr    = milestone.dueDate
      ? new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const amountFmt     = Number(milestone.amount).toLocaleString('en-IN');
    const totalFmt      = Number(plan.totalAmount).toLocaleString('en-IN');
    const paidFmt       = Number(plan.paidAmount).toLocaleString('en-IN');
    const balanceFmt    = Number(Math.max(0, (plan.balanceAmount ?? 0) - milestone.amount)).toLocaleString('en-IN');
    const refNumber     = `DD-${bookingNo || flatNumber}-${String(milestone.sequence).padStart(2, '0')}`;

    const unitParts = [propertyName, towerName, flatNumber ? `Flat ${flatNumber}` : ''].filter(Boolean);
    const unitStr   = unitParts.join(' \u203a');

    const contactParts = [customerEmail, customerPhone].filter(Boolean);
    const contactLine  = contactParts.length
      ? `<div class="to-contact">${contactParts.join(' &nbsp;|&nbsp; ')}</div>`
      : '';

    const constructionLine = milestone.constructionPhase
      ? ` (${milestone.constructionPhase}${milestone.phasePercentage != null ? ` \u2014 ${milestone.phasePercentage}%` : ''})`
      : '';

    const descLine = milestone.description
      ? `<br/><span style="font-size:11.5px;color:#666;">${milestone.description}</span>`
      : '';

    const CSS = `
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; margin: 0; padding: 0; background: #fff; }
.page { max-width: 820px; margin: 0 auto; padding: 40px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 3px solid #A8211B; }
.brand-name { font-size: 26px; font-weight: 700; color: #7B1E12; letter-spacing: 0.5px; }
.brand-sub  { font-size: 12px; color: #555; margin-top: 3px; }
.brand-tag  { font-size: 11px; color: #999; margin-top: 2px; font-style: italic; }
.header-right { text-align: right; font-size: 11px; color: #555; line-height: 1.9; }
.header-right .ref-no { font-weight: 700; font-size: 13px; color: #1a1a1a; }
.doc-title { text-align: center; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #A8211B; margin: 22px 0 26px; }
.to-block { padding: 14px 18px; background: #fafafa; border-left: 3px solid #A8211B; border-radius: 0 4px 4px 0; margin-bottom: 22px; }
.to-label   { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 5px; }
.to-name    { font-size: 16px; font-weight: 700; color: #1a1a1a; }
.to-unit    { font-size: 12px; color: #555; margin-top: 3px; }
.to-contact { font-size: 11px; color: #888; margin-top: 5px; }
.subject-line { font-size: 13px; font-weight: 600; color: #333; padding-bottom: 12px; margin-bottom: 20px; border-bottom: 1px dashed #ddd; }
.subject-line span { color: #A8211B; }
.body-text p { margin: 0 0 10px; line-height: 1.8; color: #333; }
table.dt { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12.5px; }
table.dt th { background: #A8211B; color: #fff; padding: 9px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; }
table.dt td { padding: 10px 14px; border-bottom: 1px solid #eee; vertical-align: top; }
table.dt tr.tr-total td { background: #fef9f0; font-weight: 700; border-top: 2px solid #A8211B; }
table.dt .r { text-align: right; font-weight: 600; }
table.dt tr.tr-total .r { color: #A8211B; font-size: 14px; }
.sg { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e5e7eb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
.sg-cell { background: #fff; padding: 12px 16px; }
.sg-cell label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 4px; }
.sg-val { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.sg-val.red   { color: #A8211B; }
.sg-val.green { color: #16a34a; }
.bank-box { background: #f5f5f5; border-left: 4px solid #A8211B; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0; }
.bank-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #A8211B; margin-bottom: 12px; }
.bank-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 10px; }
.bank-grid label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #9ca3af; }
.bank-grid .bv { font-size: 13px; font-weight: 600; color: #333; margin-top: 1px; }
.bank-note { font-size: 11px; color: #666; margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd; }
.note-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px; padding: 12px 16px; margin-bottom: 28px; font-size: 12px; color: #78350f; line-height: 1.6; }
.sig-section { display: flex; justify-content: flex-end; margin-bottom: 32px; }
.sig-block { text-align: center; min-width: 200px; }
.sig-line { border-top: 1px solid #aaa; margin-top: 52px; margin-bottom: 6px; }
.sig-label { font-size: 12px; font-weight: 700; color: #333; }
.sig-sub   { font-size: 11px; color: #666; margin-top: 2px; }
.page-footer { border-top: 1px solid #eee; padding-top: 12px; font-size: 10.5px; color: #999; display: flex; justify-content: space-between; line-height: 1.8; }
@media print { .page { padding: 24px; } }`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>${CSS}</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="brand-name">Eastern Estate</div>
      <div class="brand-sub">Construction &amp; Development</div>
      <div class="brand-tag">Building Homes, Nurturing Bonds</div>
    </div>
    <div class="header-right">
      <div class="ref-no">Ref: ${refNumber}</div>
      <div>Date: ${today}</div>
      ${bookingNo ? `<div>Booking No: <strong>${bookingNo}</strong></div>` : ''}
    </div>
  </div>

  <div class="doc-title">Payment Demand Notice</div>

  <div class="to-block">
    <div class="to-label">To</div>
    <div class="to-name">${customerName}</div>
    <div class="to-unit">${unitStr}</div>
    ${contactLine}
  </div>

  <div class="subject-line">
    Subject: <span>Demand for Payment &ndash; ${milestone.name}</span>
    &nbsp;&nbsp;|&nbsp;&nbsp; Unit: <span>${flatNumber}</span>
  </div>

  <div class="body-text">
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Greetings from <strong>Eastern Estate</strong>! We hope you are doing well.</p>
    <p>
      We are pleased to inform you that the construction of your registered unit has reached the
      <strong>${milestone.name}</strong> stage${constructionLine}. As per the terms of your
      registered Payment Plan, the following installment is now due for payment:
    </p>
  </div>

  <table class="dt">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th>Milestone / Description</th>
        <th width="18%">Due Date</th>
        <th width="18%" style="text-align:right">Amount (&amp;#x20B9;)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${milestone.sequence}</td>
        <td><strong>${milestone.name}</strong>${descLine}</td>
        <td>${dueDateStr}</td>
        <td class="r">&#x20B9; ${amountFmt}</td>
      </tr>
      <tr class="tr-total">
        <td colspan="3" style="text-align:right">Total Amount Payable</td>
        <td class="r">&#x20B9; ${amountFmt}</td>
      </tr>
    </tbody>
  </table>

  <div class="sg">
    <div class="sg-cell"><label>Total Property Value</label><div class="sg-val">&#x20B9; ${totalFmt}</div></div>
    <div class="sg-cell"><label>Amount Paid to Date</label><div class="sg-val green">&#x20B9; ${paidFmt}</div></div>
    <div class="sg-cell"><label>Current Installment Due</label><div class="sg-val red">&#x20B9; ${amountFmt}</div></div>
    <div class="sg-cell"><label>Balance After This Payment</label><div class="sg-val">&#x20B9; ${balanceFmt}</div></div>
  </div>

  <div class="bank-box">
    <div class="bank-title">Payment Instructions</div>
    <div class="bank-grid">
      <div><label>Bank Name</label><div class="bv">[Bank Name &mdash; to be filled]</div></div>
      <div><label>Account Name</label><div class="bv">Eastern Estate</div></div>
      <div><label>Account Number</label><div class="bv">[Account Number &mdash; to be filled]</div></div>
      <div><label>IFSC Code</label><div class="bv">[IFSC Code &mdash; to be filled]</div></div>
    </div>
    <div class="bank-note">
      Cheques / Demand Drafts should be drawn in favour of <strong>Eastern Estate</strong>.
      For NEFT / RTGS / UPI transfers, please use the Booking Number as the reference.
      Share the transaction receipt with our Accounts team after payment.
    </div>
  </div>

  <div class="note-box">
    &#9888;&#65039; <strong>Important:</strong> Kindly ensure payment reaches us on or before
    <strong>${dueDateStr}</strong>. Delayed payments may attract penalties as per your Booking
    Agreement. For queries or assistance, please contact our Accounts Department.
  </div>

  <div class="sig-section">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Authorised Signatory</div>
      <div class="sig-sub">For Eastern Estate</div>
      <div class="sig-sub">Accounts Department</div>
    </div>
  </div>

  <div class="page-footer">
    <div>Eastern Estate Construction &amp; Development</div>
    <div>System-generated document. Please retain for your records.</div>
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
    return <DetailSkeleton />;
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => router.push('/payment-plans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Payment Plan Details</h1>
            <p className="text-muted-foreground text-sm truncate">
              {plan.flat?.property?.name} – {plan.flat?.tower?.name} – {plan.flat?.flatNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                  {!editMode && <TableHead className="w-36">Invoice / DD</TableHead>}
                  <TableHead className="min-w-[140px]">Amount (₹)</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                  <TableHead className="min-w-[150px]">Construction Phase</TableHead>
                  <TableHead className="w-24">Phase %</TableHead>
                  <TableHead className="w-36">Due Date</TableHead>
                  {!editMode && <TableHead className="w-32">Completed At</TableHead>}
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

                      {/* Generate / View Invoice — 3rd column so it's always visible */}
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
                                View DD
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
                              Gen. DD
                            </Button>
                          )}
                        </TableCell>
                      )}

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

                      {/* Completed At (read mode only) */}
                      {!editMode && (
                        <TableCell>
                          {milestone.completedAt
                            ? new Date(milestone.completedAt).toLocaleDateString('en-IN')
                            : '–'}
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
                ].filter(Boolean).map(([label, value]: any) => (
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
