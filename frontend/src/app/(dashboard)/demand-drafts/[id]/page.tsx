'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  ArrowLeft,
  FileText,
  Send,
  Download,
  Edit,
  Save,
  CheckCircle,
  Loader2,
  X,
  Trash2,
  Info,
  FileDown,
} from 'lucide-react';
import { demandDraftsService, DemandDraft } from '@/services/demand-drafts.service';
import { customersService } from '@/services/customers.service';
import { bookingsService } from '@/services/bookings.service';
import { paymentPlansService } from '@/services/payment-plans.service';
import { generateDemandInvoicePdf, DemandInvoiceData } from '@/lib/generate-demand-invoice-pdf';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500',
  READY: 'bg-blue-500',
  SENT: 'bg-green-600',
  PAID: 'bg-emerald-600',
  CANCELLED: 'bg-red-500',
  FAILED: 'bg-red-700',
};

export default function DemandDraftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [draft, setDraft] = useState<DemandDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit field state
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');

  // WYSIWYG: the content area is contenteditable — we use a ref to read innerHTML on save
  const contentRef = useRef<HTMLDivElement>(null);

  // Dialogs
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // PDF invoice dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfFields, setPdfFields] = useState({
    invoiceNumber: '',
    gstin: '',
    gstRate: '18',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankBranch: '',
    tdNote: 'TDS @ 1% u/s 194-IA applicable if total consideration exceeds ₹50 Lakh.',
    customerAddress: '',
    customerPan: '',
    customerPhone: '',
    flatArea: '',
    flatType: '',
  });

  useEffect(() => {
    if (draftId) loadDraft();
  }, [draftId]);

  // When entering edit mode, ensure the contenteditable div has the latest HTML
  useEffect(() => {
    if (isEditing && contentRef.current && draft?.content) {
      contentRef.current.innerHTML = draft.content;
    }
  }, [isEditing, draft?.content]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      const data = await demandDraftsService.getDemandDraft(draftId);
      setDraft(data as DemandDraft);
      setEditedTitle(data.title || '');
      setEditedAmount(data.amount?.toString() || '');
      setEditedDueDate(data.dueDate ? data.dueDate.toString().slice(0, 10) : '');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Failed to load demand draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      // Read the edited HTML from the contenteditable div
      const editedContent = contentRef.current?.innerHTML || draft.content || '';
      await demandDraftsService.updateDemandDraft(draft.id, {
        content: editedContent,
        title: editedTitle,
        amount: parseFloat(editedAmount),
        dueDate: editedDueDate || null,
      });
      toast.success('Demand draft saved');
      setIsEditing(false);
      await loadDraft();
    } catch (error: any) {
      toast.error(error?.userMessage || 'Failed to save demand draft');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      await demandDraftsService.approveDemandDraft(draft.id);
      toast.success('Draft approved — status is now READY');
      await loadDraft();
    } catch (error: any) {
      toast.error(error?.userMessage || 'Failed to approve draft');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSent = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      await demandDraftsService.sendDemandDraft(draft.id);
      toast.success('Draft marked as SENT');
      setSendDialogOpen(false);
      await loadDraft();
    } catch (error: any) {
      toast.error(error?.userMessage || 'Failed to mark as sent');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      await demandDraftsService.delete(draft.id);
      toast.success('Demand draft deleted');
      router.push('/demand-drafts');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Failed to delete draft');
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!draft?.content) {
      toast.error('No content to download');
      return;
    }
    const blob = new Blob([draft.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (draft.title || 'demand-draft').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded as HTML — open in browser to print as PDF');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (draft && contentRef.current) {
      contentRef.current.innerHTML = draft.content || '';
    }
  };

  /** Open PDF dialog and pre-fill customer / booking / flat data */
  const openPdfDialog = async () => {
    if (!draft) return;
    // Seed with what we already know from metadata
    const m = draft.metadata ?? {};
    const updates: Partial<typeof pdfFields> = {};

    // Pre-fill from customer if available
    if (draft.customerId) {
      try {
        const customer = await customersService.getCustomer(draft.customerId);
        const addrParts = [
          customer.addressLine1,
          customer.addressLine2,
          customer.city,
          customer.state,
          customer.pincode,
        ].filter(Boolean);
        updates.customerAddress = addrParts.join(', ') || customer.address || '';
        updates.customerPan     = customer.panNumber || '';
        updates.customerPhone   = customer.phone || customer.phoneNumber || '';
      } catch { /* non-critical */ }
    }

    // Pre-fill flat area / type from flat if available
    if (draft.flatId) {
      try {
        const { flatsService } = await import('@/services/flats.service');
        const flat = await flatsService.getFlat(draft.flatId);
        const area = flat.carpetArea || flat.builtUpArea || flat.superBuiltUpArea;
        updates.flatArea = area ? `${area} sq ft` : '';
        updates.flatType = flat.type || '';
      } catch { /* non-critical */ }
    }

    setPdfFields(prev => ({ ...prev, ...updates }));
    setPdfDialogOpen(true);
  };

  const handleGeneratePdf = async () => {
    if (!draft) return;
    setGeneratingPdf(true);
    try {
      const m = draft.metadata ?? {};

      // Fetch booking number
      let bookingNumber = '';
      if (draft.bookingId) {
        try {
          const booking = await bookingsService.getBooking(draft.bookingId);
          bookingNumber = booking.bookingNumber || '';
        } catch { /* non-critical */ }
      }

      // Fetch paid amount from the payment plan
      let totalPaid = 0;
      if (m.flatPaymentPlanId) {
        try {
          const plan = await paymentPlansService.getFlatPaymentPlan(m.flatPaymentPlanId);
          totalPaid = plan.paidAmount ?? 0;
        } catch { /* non-critical */ }
      }

      const invoiceData: DemandInvoiceData = {
        invoiceNumber:      pdfFields.invoiceNumber,
        gstin:              pdfFields.gstin,
        gstRate:            parseFloat(pdfFields.gstRate) || 18,
        bankName:           pdfFields.bankName,
        bankAccountNumber:  pdfFields.bankAccountNumber,
        bankIfsc:           pdfFields.bankIfsc,
        bankBranch:         pdfFields.bankBranch,
        tdNote:             pdfFields.tdNote,
        invoiceDate:        draft.createdAt,
        dueDate:            draft.dueDate ? draft.dueDate.toString() : '',
        bookingNumber,
        milestoneName:      m.milestoneName || draft.milestoneId || '',
        customerName:       m.customerName || '',
        customerAddress:    pdfFields.customerAddress,
        customerPan:        pdfFields.customerPan,
        customerPhone:      pdfFields.customerPhone,
        propertyName:       m.propertyName || '',
        towerName:          m.towerName || '',
        flatNumber:         m.flatNumber || '',
        flatArea:           pdfFields.flatArea,
        flatType:           pdfFields.flatType,
        baseAmount:         Number(draft.amount),
        totalPaid,
      };

      generateDemandInvoicePdf(invoiceData);
      toast.success('PDF downloaded!');
      setPdfDialogOpen(false);
    } catch (err: any) {
      toast.error('Failed to generate PDF');
      console.error(err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading demand draft…</span>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Demand draft not found.</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const canEdit = draft.status === 'DRAFT';
  const canApprove = draft.status === 'DRAFT';
  const canSend = draft.status === 'READY';
  const canDelete = draft.status === 'DRAFT' || draft.status === 'FAILED';

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {draft.title || 'Demand Draft'}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">{draft.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[draft.status] ?? 'bg-gray-500'}>
            {draft.status}
          </Badge>
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* ── Action Bar ── */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-3">
            {!isEditing && canEdit && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Draft
              </Button>
            )}

            {isEditing && (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            )}

            {!isEditing && canApprove && (
              <Button
                onClick={handleApprove}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Approve Draft
              </Button>
            )}

            {!isEditing && canSend && (
              <Button
                onClick={() => setSendDialogOpen(true)}
                disabled={saving}
                className="bg-green-700 hover:bg-green-800"
              >
                <Send className="mr-2 h-4 w-4" /> Send to Customer
              </Button>
            )}

            {!isEditing && (
              <>
                <Button
                  onClick={openPdfDialog}
                  className="bg-red-700 hover:bg-red-800"
                >
                  <FileDown className="mr-2 h-4 w-4" /> Download PDF Invoice
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download HTML
                </Button>
              </>
            )}
          </div>

          {draft.status === 'SENT' && draft.sentAt && (
            <p className="text-sm text-green-700 mt-3 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Marked as sent on {new Date(draft.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Main layout ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Content / Editor ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Edit fields: title / amount / due date */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Draft Details</CardTitle>
                <CardDescription>Update the title, amount and due date</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    placeholder="e.g. Demand Notice – On Possession"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editedAmount}
                    onChange={e => setEditedAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={editedDueDate}
                    onChange={e => setEditedDueDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview / WYSIWYG content area */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">
                  {isEditing ? 'Edit Notice Content' : 'Demand Notice Preview'}
                </CardTitle>
                {isEditing && (
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Info className="h-3 w-3" />
                    Click directly in the document below to edit text. Formatting is preserved.
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Read mode — render HTML safely, no children */}
              {!isEditing && draft.content && (
                <div
                  className="rounded-lg bg-white min-h-[400px] overflow-auto border p-6"
                  dangerouslySetInnerHTML={{ __html: draft.content }}
                />
              )}

              {/* Read mode — empty state */}
              {!isEditing && !draft.content && (
                <div className="rounded-lg bg-white min-h-[400px] overflow-auto border p-6">
                  <p className="text-muted-foreground italic">No content yet.</p>
                </div>
              )}

              {/* Edit mode — contenteditable, populated via useEffect ref */}
              {isEditing && (
                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="rounded-lg bg-white min-h-[400px] overflow-auto border-2 border-blue-400 p-6 cursor-text focus:outline-none focus:border-blue-600 transition-all"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Details Sidebar ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Draft Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                <p className="text-2xl font-bold">₹{Number(draft.amount).toLocaleString('en-IN')}</p>
              </div>
              {draft.dueDate && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Due Date</p>
                  <p className="font-medium">
                    {new Date(draft.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <Badge className={STATUS_COLORS[draft.status] ?? 'bg-gray-500'}>{draft.status}</Badge>
              </div>
              {draft.generatedAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Created</p>
                  <p>{new Date(draft.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              )}
              {draft.reviewedAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Approved</p>
                  <p>{new Date(draft.reviewedAt).toLocaleDateString('en-IN')}</p>
                </div>
              )}
              {draft.sentAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Sent</p>
                  <p>{new Date(draft.sentAt).toLocaleDateString('en-IN')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestone / booking info from metadata */}
          {draft.metadata && (draft.metadata.milestoneName || draft.metadata.flatPaymentPlanId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Linked Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {draft.metadata.milestoneName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Milestone</p>
                    <p className="font-medium">{draft.metadata.milestoneName}</p>
                  </div>
                )}
                {draft.metadata.constructionPhase && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Construction Phase</p>
                    <p className="font-medium">
                      {draft.metadata.constructionPhase}
                      {draft.metadata.phasePercentage != null ? ` · ${draft.metadata.phasePercentage}%` : ''}
                    </p>
                  </div>
                )}
                {draft.metadata.flatPaymentPlanId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1"
                    onClick={() => router.push(`/payment-plans/${draft.metadata.flatPaymentPlanId}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Payment Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── PDF Invoice Dialog ── */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-red-700" />
              Download PDF Invoice
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. All fields can be changed — nothing is saved permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Invoice & Tax */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Invoice & Tax</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="invNo">Invoice Number</Label>
                  <Input id="invNo" placeholder="e.g. EE/25-26/0001"
                    value={pdfFields.invoiceNumber}
                    onChange={e => setPdfFields(p => ({ ...p, invoiceNumber: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gstin">Company GSTIN</Label>
                  <Input id="gstin" placeholder="e.g. 09AAAAA0000A1Z5"
                    value={pdfFields.gstin}
                    onChange={e => setPdfFields(p => ({ ...p, gstin: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gst">GST Rate (%)</Label>
                  <Input id="gst" type="number" placeholder="18"
                    value={pdfFields.gstRate}
                    onChange={e => setPdfFields(p => ({ ...p, gstRate: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    Split equally as CGST + SGST (e.g. 18% → 9% + 9%)
                  </p>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Customer Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="addr">Address</Label>
                  <Input id="addr" placeholder="Full address"
                    value={pdfFields.customerAddress}
                    onChange={e => setPdfFields(p => ({ ...p, customerAddress: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input id="pan" placeholder="ABCDE1234F"
                    value={pdfFields.customerPan}
                    onChange={e => setPdfFields(p => ({ ...p, customerPan: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91 XXXXX XXXXX"
                    value={pdfFields.customerPhone}
                    onChange={e => setPdfFields(p => ({ ...p, customerPhone: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Unit */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Unit Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="area">Flat Area</Label>
                  <Input id="area" placeholder="e.g. 1200 sq ft"
                    value={pdfFields.flatArea}
                    onChange={e => setPdfFields(p => ({ ...p, flatArea: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ftype">Flat Type</Label>
                  <Input id="ftype" placeholder="e.g. 3BHK"
                    value={pdfFields.flatType}
                    onChange={e => setPdfFields(p => ({ ...p, flatType: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Bank */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Bank / Payment Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="bname">Bank Name</Label>
                  <Input id="bname" placeholder="e.g. HDFC Bank"
                    value={pdfFields.bankName}
                    onChange={e => setPdfFields(p => ({ ...p, bankName: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bacc">Account Number</Label>
                  <Input id="bacc" placeholder="Account number"
                    value={pdfFields.bankAccountNumber}
                    onChange={e => setPdfFields(p => ({ ...p, bankAccountNumber: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bifsc">IFSC Code</Label>
                  <Input id="bifsc" placeholder="e.g. HDFC0001234"
                    value={pdfFields.bankIfsc}
                    onChange={e => setPdfFields(p => ({ ...p, bankIfsc: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bbranch">Branch</Label>
                  <Input id="bbranch" placeholder="e.g. Noida Sector 18"
                    value={pdfFields.bankBranch}
                    onChange={e => setPdfFields(p => ({ ...p, bankBranch: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* TDS Note */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Footer Note</p>
              <div className="space-y-1">
                <Label htmlFor="tdn">TDS / Legal Note</Label>
                <Input id="tdn"
                  value={pdfFields.tdNote}
                  onChange={e => setPdfFields(p => ({ ...p, tdNote: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              className="bg-red-700 hover:bg-red-800"
            >
              {generatingPdf
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
                : <><FileDown className="mr-2 h-4 w-4" /> Generate & Download PDF</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send Dialog ── */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to Customer</DialogTitle>
            <DialogDescription>
              The system does not send emails automatically yet. Please share this demand
              notice with the customer manually (email / WhatsApp / post), then click
              <strong> Mark as Sent</strong> to update the status in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 flex gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Download the HTML file, open it in a browser, and use <em>Print → Save as PDF</em> to get
              a PDF you can attach to an email.
            </span>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download Notice
            </Button>
            <Button
              onClick={handleMarkSent}
              disabled={saving}
              className="bg-green-700 hover:bg-green-800"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Mark as Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this demand draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The draft will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
