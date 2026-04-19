'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileDown,
  FileText,
  Info,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  CollectionsRow,
  CollectionsTimelineEvent,
  TIER_COLORS,
  TIER_LABELS,
  collectionsService,
} from '@/services/collections.service';
import {
  DemandDraft,
  demandDraftsService,
} from '@/services/demand-drafts.service';
import { PdfInvoiceDialog } from '@/components/demand-drafts/PdfInvoiceDialog';
import { HinglishLoader } from '@/components/HinglishLoader';

type Busy = 'warning' | 'send' | 'save' | 'delete' | 'recordPayment' | null;

function formatINR(n: number): string {
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  const [row, setRow] = useState<CollectionsRow | null>(null);
  const [draft, setDraft] = useState<DemandDraft | null>(null);
  const [thread, setThread] = useState<CollectionsRow[]>([]);
  const [timeline, setTimeline] = useState<CollectionsTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Action dialogs
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // Record-payment dialog: the "customer paid this DD" shortcut. The
  // amount defaults to the DD amount, but is editable so finance can
  // log partial payments from here too.
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('NEFT');
  const [payDate, setPayDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [{ row, thread, timeline }, dd] = await Promise.all([
        collectionsService.detail(id),
        demandDraftsService.getDemandDraft(id).catch(() => null),
      ]);
      setRow(row);
      setThread(thread ?? []);
      setTimeline(timeline ?? []);
      setDraft(dd);
      if (dd) {
        setEditedTitle(dd.title || '');
        setEditedAmount(dd.amount?.toString() || '');
        setEditedDueDate(
          dd.dueDate ? dd.dueDate.toString().slice(0, 10) : '',
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.userMessage ||
          'Failed to load collection detail',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // When entering edit mode, seed the contenteditable region with the
  // current HTML. We render it via ref (not children) to avoid React
  // fighting with the DOM on every keystroke.
  useEffect(() => {
    if (editing && contentRef.current) {
      contentRef.current.innerHTML = draft?.content || '';
    }
  }, [editing, draft?.content]);

  const sendWarning = async () => {
    if (!row) return;
    if (
      !confirm(
        'Send this cancellation warning letter to the customer now? This will be recorded as a formal notice.',
      )
    )
      return;
    setBusy('warning');
    try {
      await collectionsService.sendWarning(row.id);
      toast.success('Cancellation warning sent');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send warning');
    } finally {
      setBusy(null);
    }
  };

  const sendDraft = async () => {
    if (!row) return;
    if (
      !confirm(
        'Send this demand draft to the customer now? Email + in-app notification will fire immediately.',
      )
    )
      return;
    setBusy('send');
    try {
      await demandDraftsService.sendDemandDraft(row.id);
      toast.success('Demand draft sent');
      load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to send demand draft',
      );
    } finally {
      setBusy(null);
    }
  };

  const startEditing = () => {
    setEditing(true);
    // title/amount/dueDate already seeded by load(); content seeded by effect.
  };

  const cancelEditing = () => {
    setEditing(false);
    // Reset form fields back to the loaded draft so a re-open is clean.
    if (draft) {
      setEditedTitle(draft.title || '');
      setEditedAmount(draft.amount?.toString() || '');
      setEditedDueDate(
        draft.dueDate ? draft.dueDate.toString().slice(0, 10) : '',
      );
    }
  };

  const saveDraft = async () => {
    if (!row || !draft) return;
    setBusy('save');
    try {
      const editedContent = contentRef.current?.innerHTML ?? draft.content ?? '';
      const amountNum = parseFloat(editedAmount);
      await demandDraftsService.updateDemandDraft(row.id, {
        title: editedTitle,
        amount: Number.isFinite(amountNum) ? amountNum : draft.amount,
        dueDate: editedDueDate || null,
        content: editedContent,
      });
      toast.success('Draft saved');
      setEditing(false);
      await load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.userMessage ||
          'Failed to save changes',
      );
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadHtml = () => {
    if (!draft?.content) {
      toast.error('No content to download');
      return;
    }
    const blob = new Blob([draft.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (draft.title || 'demand-draft')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded as HTML - open in browser to print as PDF');
  };

  const openPayDialog = () => {
    if (!row) return;
    setPayAmount(String(row.amount ?? ''));
    setPayMethod('NEFT');
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayReference('');
    setPayNotes('');
    setPayDialogOpen(true);
  };

  const submitPayment = async () => {
    if (!row) return;
    const amt = Number(payAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setBusy('recordPayment');
    try {
      const res = await collectionsService.recordPayment(row.id, {
        amount: amt,
        paymentMethod: payMethod || undefined,
        paymentDate: payDate || undefined,
        transactionReference: payReference || undefined,
        notes: payNotes || undefined,
      });
      if (res.journalEntryId) {
        toast.success(
          `Payment recorded (${res.paymentCode}). DD closed and journal entry posted.`,
        );
      } else if (res.journalEntrySkipReason === 'missing-default-accounts') {
        toast.warning(
          `Payment recorded (${res.paymentCode}), but no journal entry was posted — your Chart of Accounts is missing a default Bank/Cash or Sales/Revenue account. Add both under /accounting/accounts so future payments auto-post to the ledger.`,
        );
      } else if (res.journalEntrySkipReason) {
        toast.warning(
          `Payment recorded (${res.paymentCode}), but the journal entry was skipped: ${res.journalEntrySkipReason}. Post it manually under /accounting/journal-entries.`,
        );
      } else {
        toast.success(`Payment recorded (${res.paymentCode}). DD closed.`);
      }
      setPayDialogOpen(false);
      await load();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.userMessage ||
          'Failed to record payment',
      );
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!row) return;
    setBusy('delete');
    try {
      await demandDraftsService.delete(row.id);
      toast.success('Demand draft deleted');
      router.push('/collections');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete draft');
      setBusy(null);
    }
  };

  // Edit is allowed for everything except PAID — once money has landed we
  // lock the record because the amount feeds the ledger. The backend also
  // accepts updates for any status, so the only gate is this UI switch.
  const canEdit = !!row && row.status !== 'PAID';
  const canDelete = row?.status === 'DRAFT' || row?.status === 'FAILED';
  const editedAfterSend = row?.status && row.status !== 'DRAFT';
  // Record-payment is offered for any non-closed DD. We don't require
  // SENT here because finance may take the money over the phone before
  // the DD is formally sent - the action short-circuits that handoff.
  const canRecordPayment =
    !!row && row.status !== 'PAID' && !!row.bookingId;

  const isDraftWarning = useMemo(
    () => row?.status === 'DRAFT' && row?.tone === 'CANCELLATION_WARNING',
    [row],
  );
  const isSendableDraft = useMemo(
    () => row?.status === 'DRAFT' && row?.tone !== 'CANCELLATION_WARNING',
    [row],
  );

  if (loading || !row) {
    return (
      <div className="p-6">
        <HinglishLoader context="finance" label="DD details nikal rahe hain" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/collections"
            className="text-sm text-gray-500 hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {row.title || 'Demand Draft'}
          </h1>
          <div className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium">
              {row.customerName || 'Unnamed customer'}
            </span>
            <span>·</span>
            <span>{row.flatCode || 'no unit'}</span>
            {row.bookingCode && (
              <>
                <span>·</span>
                <span>{row.bookingCode}</span>
              </>
            )}
            <Badge variant="outline" className={`${TIER_COLORS[row.tier]} border`}>
              {TIER_LABELS[row.tier]}
            </Badge>
            {row.isLegacyImport && (
              <Badge
                variant="outline"
                className="bg-slate-100 text-slate-700 border-slate-200"
              >
                Legacy
              </Badge>
            )}
            <AutoSendBadge draft={draft} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit flow: while editing, show Save + Cancel. Otherwise, the
              usual Send / Approve & Send Warning / Edit Draft trio. */}
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={cancelEditing}
                disabled={busy === 'save'}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveDraft} disabled={busy === 'save'}>
                {busy === 'save' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {canRecordPayment && (
                <Button
                  onClick={openPayDialog}
                  disabled={busy !== null}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              )}
              {isSendableDraft && (
                <Button onClick={sendDraft} disabled={busy !== null}>
                  {busy === 'send' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Now
                </Button>
              )}
              {isDraftWarning && (
                <Button
                  variant="destructive"
                  onClick={sendWarning}
                  disabled={busy !== null}
                >
                  {busy === 'warning' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Approve &amp; Send Warning
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={startEditing}
                  title={
                    editedAfterSend
                      ? 'This DD has already been finalized — edits update the record only; the customer will not see the change until you re-send.'
                      : 'Edit title, amount, due date and notice copy'
                  }
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {editedAfterSend ? 'Edit' : 'Edit Draft'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setPdfDialogOpen(true)}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF Invoice
              </Button>
              <Button variant="outline" onClick={handleDownloadHtml}>
                <Download className="h-4 w-4 mr-2" />
                HTML
              </Button>
              {canDelete && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={busy !== null}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left rail */}
        <div className="space-y-4 lg:col-span-1">
          {/* Summary card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <KV k="Amount" v={formatINR(row.amount)} tone="strong" />
              <KV k="Due Date" v={formatDate(row.dueDate)} />
              <KV
                k="Days Overdue"
                v={
                  row.daysOverdue > 0
                    ? `${row.daysOverdue} days`
                    : 'on time'
                }
                tone={
                  row.daysOverdue > 30
                    ? 'danger'
                    : row.daysOverdue > 0
                      ? 'warning'
                      : 'muted'
                }
              />
              <KV k="Status" v={row.status} />
              <KV k="Tone" v={row.tone} />
              <KV k="Reminders Sent" v={String(row.reminderCount)} />
              <KV k="Last Reminder" v={formatDateTime(row.lastReminderAt)} />
              <KV
                k="Next Reminder Due"
                v={formatDateTime(row.nextReminderDueAt)}
              />
              {row.cancellationWarningIssuedAt && (
                <KV
                  k="Cancellation Warning Issued"
                  v={formatDateTime(row.cancellationWarningIssuedAt)}
                  tone="danger"
                />
              )}
              {row.pauseRemindersUntil &&
                new Date(row.pauseRemindersUntil) > new Date() && (
                  <KV
                    k="Reminders Paused Until"
                    v={formatDateTime(row.pauseRemindersUntil)}
                    tone="muted"
                  />
                )}
            </CardContent>
          </Card>

          {/* Customer contact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                {row.customerPhone || '—'}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                {row.customerEmail || '—'}
              </div>
              {row.customerId && (
                <Link
                  href={`/customers/${row.customerId}`}
                  className="text-xs text-red-700 hover:underline"
                >
                  Open customer profile →
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Related records */}
          {(row.bookingId || row.customerId || row.flatId) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Related Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {row.bookingId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/bookings/${row.bookingId}`)}
                  >
                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                    View Booking
                  </Button>
                )}
                {row.customerId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/customers/${row.customerId}`)}
                  >
                    <FileText className="mr-2 h-4 w-4 text-green-600" />
                    View Customer
                  </Button>
                )}
                {row.flatId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/flats/${row.flatId}`)}
                  >
                    <FileText className="mr-2 h-4 w-4 text-purple-600" />
                    View Flat/Unit
                  </Button>
                )}
                {draft?.metadata?.flatPaymentPlanId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(
                        `/payment-plans/${draft.metadata.flatPaymentPlanId}`,
                      )
                    }
                  >
                    <FileText className="mr-2 h-4 w-4 text-amber-600" />
                    View Payment Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Thread */}
          {thread.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Reminder Thread</CardTitle>
                <CardDescription className="text-xs">
                  Every reminder / warning generated for this milestone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {thread
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                    )
                    .map((t) => (
                      <li key={t.id} className="border rounded p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {t.tone.replaceAll('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDateTime(t.createdAt)}
                            </div>
                          </div>
                          <Link
                            href={`/collections/${t.id}`}
                            className="text-xs text-red-700 hover:underline"
                          >
                            Open
                          </Link>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Status: {t.status} · {formatINR(t.amount)}
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: DD preview/editor + timeline */}
        <div className="space-y-4 lg:col-span-2">
          {/* Edit fields card: only visible in edit mode */}
          {editing && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Draft Details</CardTitle>
                <CardDescription className="text-xs">
                  Title, amount, and due date shown on every reminder and
                  invoice.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="e.g. Demand Notice – On Possession"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {editing ? 'Edit Notice Content' : 'Draft Preview'}
              </CardTitle>
              <CardDescription className="text-xs">
                {editing ? (
                  <span className="inline-flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Click directly in the document below to edit text.
                    Formatting is preserved.
                  </span>
                ) : (
                  'Content that was (or will be) delivered to the customer.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="rounded-lg bg-white min-h-[400px] overflow-auto border-2 border-blue-400 p-6 cursor-text focus:outline-none focus:border-blue-600 transition-all"
                />
              ) : draft?.content ? (
                <div
                  className="prose prose-sm max-w-none border rounded bg-white p-4 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: draft.content }}
                />
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No content available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Timeline</CardTitle>
              <CardDescription className="text-xs">
                System events (generation, reminders, warnings) link to the
                exact draft that was sent. Manual events (contact attempts,
                pauses) stay inline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="text-sm text-gray-500">No timeline events.</div>
              ) : (
                <ol className="relative border-l border-gray-200 ml-2 space-y-4">
                  {timeline.map((ev, idx) => {
                    const dot = (
                      <span
                        className={`absolute w-2 h-2 rounded-full -left-[5px] mt-2 ${
                          ev.kind === 'warning'
                            ? 'bg-red-500'
                            : ev.kind === 'reminder'
                              ? 'bg-amber-500'
                              : ev.kind === 'contact'
                                ? 'bg-sky-500'
                                : ev.kind === 'pause'
                                  ? 'bg-slate-400'
                                  : ev.kind === 'paid'
                                    ? 'bg-emerald-600'
                                    : 'bg-emerald-500'
                        }`}
                      />
                    );
                    const isClickable =
                      !!ev.demandDraftId && ev.demandDraftId !== row.id;
                    const body = (
                      <>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(ev.at)}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            isClickable
                              ? 'text-red-700 group-hover:underline inline-flex items-center gap-1'
                              : 'text-gray-900'
                          }`}
                        >
                          {ev.label}
                          {isClickable && (
                            <ArrowLeft className="h-3 w-3 rotate-180" />
                          )}
                        </div>
                        {ev.detail && (
                          <div className="text-xs text-gray-600">{ev.detail}</div>
                        )}
                        {ev.demandDraftId === row.id && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            This draft
                          </div>
                        )}
                      </>
                    );
                    return (
                      <li key={idx} className="ml-4">
                        {dot}
                        {isClickable ? (
                          <Link
                            href={`/collections/${ev.demandDraftId}`}
                            className="group block hover:bg-gray-50 -mx-2 px-2 py-0.5 rounded"
                          >
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF invoice dialog (pre-fills from customer/flat/booking) */}
      <PdfInvoiceDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        draft={draft}
      />

      {/* Record-payment dialog: creates + verifies a payment in one
          shot, which closes the DD, updates the booking / milestone
          and posts the journal entry. */}
      <AlertDialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record payment for this DD</AlertDialogTitle>
            <AlertDialogDescription>
              Logs the customer payment, closes this demand draft (and any
              reminder / warning letters chained to it), updates the
              booking balance and milestone, and posts the accounting
              entry automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs">Amount (INR)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Amount"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Defaults to the DD amount. Edit for partial payments.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Payment Method</Label>
                <select
                  className="w-full border rounded-md h-9 px-2 text-sm"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="IMPS">IMPS</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                  <option value="DD">Demand Draft</option>
                  <option value="ONLINE">Online</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Payment Date</Label>
                <Input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Reference / Txn ID (optional)</Label>
              <Input
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="UTR / Cheque #  / UPI ref"
              />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Any handoff notes for finance"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === 'recordPayment'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={submitPayment}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={busy === 'recordPayment'}
            >
              {busy === 'recordPayment' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Record &amp; Close DD
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this demand draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The draft will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === 'delete'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={busy === 'delete'}
            >
              {busy === 'delete' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
                </>
              ) : (
                'Yes, delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Small badge that surfaces WHY a DD was auto-sent (or wasn't) so a
 * support rep can trace which knob in the customer > project > company
 * precedence chain fired. Reads the audit blob that AutoDemandDraftService
 * and ConstructionWorkflowService stamp into metadata.autoSend at
 * creation time. Renders nothing when the blob is missing (older DDs
 * pre-dating the feature, or manual DDs).
 */
function AutoSendBadge({ draft }: { draft: DemandDraft | null }) {
  const auto = (draft?.metadata as any)?.autoSend as
    | {
        triggered?: boolean;
        source?: 'customer' | 'property' | 'company';
      }
    | undefined;
  if (!auto || auto.triggered === undefined) return null;

  const sourceLabel =
    auto.source === 'customer'
      ? 'customer override'
      : auto.source === 'property'
        ? 'project override'
        : 'company default';

  if (auto.triggered) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-700 border-emerald-200"
        title={`Auto-sent at creation because of the ${sourceLabel}.`}
      >
        Auto-sent · {sourceLabel}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-sky-50 text-sky-700 border-sky-200"
      title={`Held for review because of the ${sourceLabel}.`}
    >
      Review required · {sourceLabel}
    </Badge>
  );
}

function KV({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: 'strong' | 'warning' | 'danger' | 'muted';
}) {
  const toneClass =
    tone === 'strong'
      ? 'text-gray-900 font-semibold'
      : tone === 'warning'
        ? 'text-amber-700 font-medium'
        : tone === 'danger'
          ? 'text-red-700 font-medium'
          : tone === 'muted'
            ? 'text-gray-500'
            : 'text-gray-800';
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase text-gray-500 tracking-wide">{k}</span>
      <span className={`text-sm ${toneClass}`}>{v}</span>
    </div>
  );
}
