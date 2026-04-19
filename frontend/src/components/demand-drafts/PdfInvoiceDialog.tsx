'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DemandDraft } from '@/services/demand-drafts.service';
import { customersService } from '@/services/customers.service';
import { bookingsService } from '@/services/bookings.service';
import { paymentPlansService } from '@/services/payment-plans.service';
import {
  generateDemandInvoicePdf,
  DemandInvoiceData,
} from '@/lib/generate-demand-invoice-pdf';

/**
 * PDF invoice generation dialog. Previously lived inside
 * /demand-drafts/[id]/page.tsx; extracted so both the collections
 * detail page and any future caller can reuse the exact same form and
 * pre-fill logic.
 *
 * The caller is responsible for:
 *   - loading the `DemandDraft`
 *   - controlling `open` / `onOpenChange`
 *
 * We handle everything else: pre-filling customer address / PAN / phone
 * and flat area / type from the server, fetching booking number + paid
 * amount for the invoice footer, and generating + downloading the PDF.
 */
export function PdfInvoiceDialog({
  open,
  onOpenChange,
  draft,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  draft: DemandDraft | null;
}) {
  const [generating, setGenerating] = useState(false);
  const [fields, setFields] = useState({
    invoiceNumber: '',
    gstin: '',
    gstRate: '18',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankBranch: '',
    tdNote:
      'TDS @ 1% u/s 194-IA applicable if total consideration exceeds ₹50 Lakh.',
    customerAddress: '',
    customerPan: '',
    customerPhone: '',
    flatArea: '',
    flatType: '',
  });

  // Pre-fill the form the first time the dialog opens for a given
  // draft. Guarded so re-open doesn't clobber user edits.
  const lastPrefilledDraftId = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open || !draft) return;
    if (lastPrefilledDraftId.current === draft.id) return;

    (async () => {
      const updates: Partial<typeof fields> = {};
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
          updates.customerAddress =
            addrParts.join(', ') || (customer as any).address || '';
          updates.customerPan = (customer as any).panNumber || '';
          updates.customerPhone =
            (customer as any).phone || (customer as any).phoneNumber || '';
        } catch {
          // non-critical
        }
      }
      if (draft.flatId) {
        try {
          const { flatsService } = await import('@/services/flats.service');
          const flat = await flatsService.getFlat(draft.flatId);
          const area =
            (flat as any).carpetArea ||
            (flat as any).builtUpArea ||
            (flat as any).superBuiltUpArea;
          updates.flatArea = area ? `${area} sq ft` : '';
          updates.flatType = (flat as any).type || '';
        } catch {
          // non-critical
        }
      }
      setFields((prev) => ({ ...prev, ...updates }));
      lastPrefilledDraftId.current = draft.id;
    })();
  }, [open, draft]);

  const handleGenerate = async () => {
    if (!draft) return;
    setGenerating(true);
    try {
      const m = draft.metadata ?? {};

      let bookingNumber = '';
      if (draft.bookingId) {
        try {
          const booking = await bookingsService.getBooking(draft.bookingId);
          bookingNumber = booking.bookingNumber || '';
        } catch {
          // non-critical
        }
      }

      let totalPaid = 0;
      if (m.flatPaymentPlanId) {
        try {
          const plan = await paymentPlansService.getFlatPaymentPlan(
            m.flatPaymentPlanId,
          );
          totalPaid = plan.paidAmount ?? 0;
        } catch {
          // non-critical
        }
      }

      const invoiceData: DemandInvoiceData = {
        invoiceNumber: fields.invoiceNumber,
        gstin: fields.gstin,
        gstRate: parseFloat(fields.gstRate) || 18,
        bankName: fields.bankName,
        bankAccountNumber: fields.bankAccountNumber,
        bankIfsc: fields.bankIfsc,
        bankBranch: fields.bankBranch,
        tdNote: fields.tdNote,
        invoiceDate: draft.createdAt,
        dueDate: draft.dueDate ? draft.dueDate.toString() : '',
        bookingNumber,
        milestoneName: m.milestoneName || draft.milestoneId || '',
        customerName: m.customerName || '',
        customerAddress: fields.customerAddress,
        customerPan: fields.customerPan,
        customerPhone: fields.customerPhone,
        propertyName: m.propertyName || '',
        towerName: m.towerName || '',
        flatNumber: m.flatNumber || '',
        flatArea: fields.flatArea,
        flatType: fields.flatType,
        baseAmount: Number(draft.amount),
        totalPaid,
      };

      generateDemandInvoicePdf(invoiceData);
      toast.success('PDF downloaded!');
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-red-700" />
            Download PDF Invoice
          </DialogTitle>
          <DialogDescription>
            Fill in the details below. All fields can be changed - nothing is
            saved permanently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Invoice & Tax */}
          <Section title="Invoice & Tax">
            <Field id="invNo" label="Invoice Number" placeholder="e.g. EE/25-26/0001"
              value={fields.invoiceNumber}
              onChange={(v) => setFields((p) => ({ ...p, invoiceNumber: v }))} />
            <Field id="gstin" label="Company GSTIN" placeholder="e.g. 09AAAAA0000A1Z5"
              value={fields.gstin}
              onChange={(v) => setFields((p) => ({ ...p, gstin: v }))} />
            <div className="space-y-1">
              <Label htmlFor="gst">GST Rate (%)</Label>
              <Input id="gst" type="number" placeholder="18"
                value={fields.gstRate}
                onChange={(e) => setFields((p) => ({ ...p, gstRate: e.target.value }))} />
              <p className="text-xs text-muted-foreground">
                Split equally as CGST + SGST (e.g. 18% → 9% + 9%)
              </p>
            </div>
          </Section>

          {/* Customer */}
          <Section title="Customer Details">
            <div className="col-span-2">
              <Field id="addr" label="Address" placeholder="Full address"
                value={fields.customerAddress}
                onChange={(v) => setFields((p) => ({ ...p, customerAddress: v }))} />
            </div>
            <Field id="pan" label="PAN Number" placeholder="ABCDE1234F"
              value={fields.customerPan}
              onChange={(v) => setFields((p) => ({ ...p, customerPan: v }))} />
            <Field id="phone" label="Phone" placeholder="+91 XXXXX XXXXX"
              value={fields.customerPhone}
              onChange={(v) => setFields((p) => ({ ...p, customerPhone: v }))} />
          </Section>

          {/* Unit */}
          <Section title="Unit Details">
            <Field id="area" label="Flat Area" placeholder="e.g. 1200 sq ft"
              value={fields.flatArea}
              onChange={(v) => setFields((p) => ({ ...p, flatArea: v }))} />
            <Field id="ftype" label="Flat Type" placeholder="e.g. 3BHK"
              value={fields.flatType}
              onChange={(v) => setFields((p) => ({ ...p, flatType: v }))} />
          </Section>

          {/* Bank */}
          <Section title="Bank / Payment Details">
            <Field id="bname" label="Bank Name" placeholder="e.g. HDFC Bank"
              value={fields.bankName}
              onChange={(v) => setFields((p) => ({ ...p, bankName: v }))} />
            <Field id="bacc" label="Account Number" placeholder="Account number"
              value={fields.bankAccountNumber}
              onChange={(v) => setFields((p) => ({ ...p, bankAccountNumber: v }))} />
            <Field id="bifsc" label="IFSC Code" placeholder="e.g. HDFC0001234"
              value={fields.bankIfsc}
              onChange={(v) => setFields((p) => ({ ...p, bankIfsc: v }))} />
            <Field id="bbranch" label="Branch" placeholder="e.g. Noida Sector 18"
              value={fields.bankBranch}
              onChange={(v) => setFields((p) => ({ ...p, bankBranch: v }))} />
          </Section>

          {/* TDS Note */}
          <Section title="Footer Note">
            <div className="col-span-2">
              <Field id="tdn" label="TDS / Legal Note" value={fields.tdNote}
                onChange={(v) => setFields((p) => ({ ...p, tdNote: v }))} />
            </div>
          </Section>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating || !draft}
            className="bg-red-700 hover:bg-red-800"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" /> Generate &amp; Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
