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
} from 'lucide-react';
import { paymentPlansService, FlatPaymentPlan, FlatPaymentMilestone } from '@/services/payment-plans.service';
import { toast } from 'sonner';

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

  // Editable copies
  const [editedMilestones, setEditedMilestones] = useState<FlatPaymentMilestone[]>([]);
  const [editedTotalAmount, setEditedTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await paymentPlansService.getFlatPaymentPlan(planId);
      setPlan(data);
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/flats/${plan.flatId}`)}
              className="mt-2"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Flat Details
            </Button>
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
                    <TableCell colSpan={editMode ? 8 : 8} className="text-center text-muted-foreground py-8">
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
    </div>
  );
}
