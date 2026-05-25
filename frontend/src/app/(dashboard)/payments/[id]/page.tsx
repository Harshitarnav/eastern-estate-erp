'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import { paymentsService } from '@/services/payments.service';
import { flatsService } from '@/services/flats.service';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';
import { settingsService } from '@/services/settings.service';
import DocumentsPanel from '@/components/documents/DocumentsPanel';
import { DocumentEntityType } from '@/services/documents.service';
import { generateReceiptPdf, ReceiptData } from '@/lib/generate-receipt-pdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DetailSkeleton } from '@/components/Skeletons';

export default function ViewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Receipt dialog state
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptNarration, setReceiptNarration] = useState('');

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const data = await paymentsService.getById(id);
      setPayment(data);
      setError('');
      // Pre-fill receipt number if already stored
      if (data.receiptNumber) {
        setReceiptNumber(data.receiptNumber);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete payment "${payment?.paymentNumber}"?`)) {
      return;
    }
    try {
      await paymentsService.deletePayment(id);
      router.push('/payments');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment');
    }
  };

  const handleOpenReceiptDialog = () => {
    // Pre-fill from payment if available
    if (payment?.receiptNumber && !receiptNumber) {
      setReceiptNumber(payment.receiptNumber);
    }
    setShowReceiptDialog(true);
  };

  const handleGenerateReceipt = async () => {
    if (!receiptNumber.trim()) {
      toast.error('Please enter a receipt number.');
      return;
    }

    setGeneratingReceipt(true);
    try {
      // Pull every piece of context the redesigned receipt needs in one go:
      //   • Flat (project › tower › flat, type, area)
      //   • Booking (totalAmount, paidAmount, balance, GST/TDS context)
      //   • Customer (full address, PAN, Aadhaar, email)
      //   • Company settings (registered name, GSTIN, RERA, bank A/c, signatory)
      const bookingFlatId =
        payment?.booking?.flatId || payment?.booking?.flat?.id || payment?.flatId;
      const bookingId = payment?.bookingId || payment?.booking?.id;
      const customerId = payment?.customerId || payment?.customer?.id;

      const [flat, booking, customer, company] = await Promise.all([
        bookingFlatId
          ? flatsService.getFlat(bookingFlatId).catch(() => null)
          : Promise.resolve(null),
        bookingId
          ? bookingsService.getBooking(bookingId).catch(() => payment?.booking ?? null)
          : Promise.resolve(payment?.booking ?? null),
        customerId
          ? customersService.getCustomer(customerId).catch(() => payment?.customer ?? null)
          : Promise.resolve(payment?.customer ?? null),
        settingsService.getCompanySettings().catch(() => null),
      ]);

      // ── Tax breakup ─────────────────────────────────────────────────────────
      // The redesigned receipt shows gross → GST → TDS → net. If the payment
      // doesn't store these explicitly, we treat the recorded amount as net
      // and zero out the tax lines so the table degrades gracefully.
      const netAmount = Number(payment.amount || payment.netAmount || 0);
      const gstAmount = Number(payment.gstAmount || 0);
      const tdsAmount = Number(payment.tdsAmount || 0);
      // Approximation when gross isn't stored: net = gross + gst − tds  ⇒
      // gross = net − gst + tds.
      const grossAmount = netAmount - gstAmount + tdsAmount;
      const gstPercentage = grossAmount > 0 && gstAmount > 0
        ? +((gstAmount / grossAmount) * 100).toFixed(2)
        : undefined;
      const tdsPercentage = grossAmount > 0 && tdsAmount > 0
        ? +((tdsAmount / grossAmount) * 100).toFixed(2)
        : undefined;

      // ── Ledger summary ──────────────────────────────────────────────────────
      const bookingTotal = Number(
        booking?.totalAmount || payment?.booking?.totalAmount || 0,
      );
      // The booking's stored `paidAmount` is updated server-side as payments
      // clear; if this receipt is being generated for a payment that is
      // already CLEARED, that value is correct as-is. Otherwise we tack the
      // current net amount on so the customer's balance lines up.
      const alreadyPaid = Number(booking?.paidAmount || 0);
      const statusBaked = ['CLEARED', 'RECEIVED', 'COMPLETED'].includes(
        String(payment.status || '').toUpperCase(),
      );
      const totalReceivedTillDate = statusBaked
        ? alreadyPaid
        : alreadyPaid + netAmount;
      const balanceOutstanding = Math.max(
        bookingTotal - totalReceivedTillDate,
        0,
      );

      // ── Description ─────────────────────────────────────────────────────────
      const paymentTypeLabel = (payment.paymentType || '').replace(/_/g, ' ');
      const description =
        paymentTypeLabel
          ? `${paymentTypeLabel.charAt(0) + paymentTypeLabel.slice(1).toLowerCase()} ` +
            `payment received against booking ${booking?.bookingNumber || ''}`.trim()
          : `Payment received against booking ${booking?.bookingNumber || ''}`.trim();

      // ── Customer address (multi-field assembly) ────────────────────────────
      const cust: any = customer || {};
      const customerAddress =
        cust.addressLine1 ||
        cust.address ||
        cust.currentAddress ||
        '';

      // ── Build the final ReceiptData payload ────────────────────────────────
      const receiptData: ReceiptData = {
        receiptNumber: receiptNumber.trim(),
        receiptDate: new Date().toISOString(),
        copyLabel: 'CUSTOMER COPY',
        narration: receiptNarration.trim() || undefined,

        // payment
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMode || payment.paymentMethod || 'OTHER',
        bankName: payment.bankName,
        bankBranch: payment.bankBranch || payment.branch,
        chequeNumber: payment.chequeNumber,
        chequeDate: payment.chequeDate,
        transactionRef:
          payment.transactionId || payment.transactionReference || payment.upiId,
        clearanceDate: payment.clearanceDate,
        paymentNumber: payment.paymentNumber || payment.paymentCode || '-',
        paymentTypeLabel: paymentTypeLabel || undefined,

        // booking
        bookingNumber: booking?.bookingNumber || '-',
        bookingDate: booking?.bookingDate,
        bookingValue: bookingTotal || undefined,

        // customer
        customerName:
          cust.fullName ||
          [cust.firstName, cust.lastName].filter(Boolean).join(' ') ||
          cust.name ||
          '-',
        customerAddress,
        customerCity: cust.city,
        customerState: cust.state,
        customerPincode: cust.pincode,
        customerPan: cust.panNumber || cust.pan,
        customerAadhaar: cust.aadharNumber || cust.aadhaar,
        customerPhone: cust.phoneNumber || cust.phone || cust.mobile,
        customerEmail: cust.email,

        // unit — Flat is loosely typed across the system; we cast to `any` so
        // we can defensively read whichever field happens to be present
        // (older rows have `flatType`, newer ones have `type`; some flats
        // expose `areaSqFt` from the import script while normalised rows use
        // `carpetArea` / `superBuiltUpArea`).
        propertyName:
          (flat as any)?.property?.name || (booking as any)?.property?.name || '',
        towerName: (flat as any)?.tower?.name || '',
        flatNumber: (flat as any)?.flatNumber || (flat as any)?.number || '',
        flatType:
          (flat as any)?.flatType ||
          (flat as any)?.type ||
          (flat as any)?.bhkType,
        flatArea: (() => {
          const f: any = flat || {};
          const parts: string[] = [];
          if (f.carpetArea) parts.push(`${f.carpetArea} Sq.Ft. Carpet`);
          else if (f.areaSqFt) parts.push(`${f.areaSqFt} Sq.Ft.`);
          if (f.superBuiltUpArea) parts.push(`${f.superBuiltUpArea} Sq.Ft. SBA`);
          return parts.join(' • ');
        })(),

        // description
        description,

        // tax breakup
        tax: {
          grossAmount: grossAmount > 0 ? +grossAmount.toFixed(2) : undefined,
          gstPercentage,
          gstAmount: gstAmount || undefined,
          splitCgstSgst: !!gstAmount, // assume intra-state by default (CGST+SGST)
          tdsPercentage,
          tdsAmount: tdsAmount || undefined,
          netAmount,
        },

        // ledger
        ledger: bookingTotal
          ? {
              totalBookingAmount: bookingTotal,
              totalReceivedTillDate,
              balanceOutstanding,
            }
          : undefined,

        // company / signatory — fall back to Eastern Estate defaults when
        // company-settings have not been filled in yet.
        company: {
          name: company?.companyName || 'Eastern Estate Construction & Development Pvt. Ltd.',
          tagline: company?.tagline,
          address: company?.address,
          city: company?.city,
          state: company?.state,
          pincode: company?.pincode,
          phone: company?.phone,
          email: company?.email,
          website: company?.website,
          gstin: company?.gstin,
          reraNumber: company?.reraNumber,
          // PAN and CIN are not currently in company_settings — left blank so
          // they fall away cleanly in the header instead of showing "undefined".
          bankName: company?.bankName,
          accountName: company?.accountName,
          accountNumber: company?.accountNumber,
          ifscCode: company?.ifscCode,
          branch: company?.branch,
          upiId: company?.upiId,
          authorisedSignatoryName: 'Authorised Signatory',
          authorisedSignatoryDesignation: undefined,
          jurisdictionCity: company?.city,
        },
      };

      generateReceiptPdf(receiptData);
      toast.success('Receipt downloaded!');
      setShowReceiptDialog(false);
    } catch (err: any) {
      console.error('Receipt generation error:', err);
      toast.error('Failed to generate receipt. Please try again.');
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':    return '#3DA35D';
      case 'COMPLETED':  return '#3DA35D';
      case 'RECEIVED':   return '#3B82F6';
      case 'PENDING':    return '#F2C94C';
      case 'BOUNCED':    return '#EF4444';
      case 'CANCELLED':  return '#6B7280';
      default:           return '#6B7280';
    }
  };

  if (loading) {
    return (
      <DetailSkeleton sidebar={false} />
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Payment not found'}
        </div>
        <button
          onClick={() => router.push('/payments')}
          className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Payments</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/payments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Payments</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap justify-between items-start mb-6 gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#7B1E12' }}>
              Payment Details
            </h1>
            <p className="text-gray-600 mt-1 truncate">{payment.paymentNumber}</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-end shrink-0">
            {/* Generate Receipt button */}
            <Button
              onClick={handleOpenReceiptDialog}
              className="flex items-center gap-2"
              style={{ backgroundColor: '#3DA35D', color: '#fff' }}
            >
              <Download className="h-4 w-4" />
              Generate Receipt
            </Button>

            <button
              onClick={() => router.push(`/payments/${id}/edit`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              style={{ borderColor: '#A8211B', color: '#A8211B' }}
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <p className="text-lg font-semibold">
              {payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                : '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <p className="text-lg font-semibold text-green-600">
              ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <p className="text-lg font-semibold">
              {payment.paymentMode?.replace(/_/g, ' ') || payment.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${getStatusColor(payment.status)}15`,
                color: getStatusColor(payment.status),
              }}
            >
              {payment.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
            <div className="flex items-center gap-2">
              {payment.isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-semibold">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-semibold">Unverified</span>
                </>
              )}
            </div>
          </div>

          {payment.receiptNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <p className="text-lg font-semibold">{payment.receiptNumber}</p>
            </div>
          )}

          {payment.transactionId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <p className="text-lg font-semibold">{payment.transactionId}</p>
            </div>
          )}

          {payment.chequeNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
              <p className="text-lg font-semibold">{payment.chequeNumber}</p>
            </div>
          )}

          {payment.bankName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <p className="text-lg font-semibold">{payment.bankName}</p>
            </div>
          )}

          {payment.remarks && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <p className="text-gray-800">{payment.remarks}</p>
            </div>
          )}

          {/* Booking info if available */}
          {payment.booking && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking</label>
              <button
                onClick={() => router.push(`/bookings/${payment.bookingId}`)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {payment.booking.bookingNumber || payment.bookingId}
              </button>
            </div>
          )}

          {/* Customer info if available */}
          {payment.customer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <button
                onClick={() => router.push(`/customers/${payment.customerId}`)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {payment.customer.fullName || payment.customer.name || payment.customerId}
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-800">{new Date(payment.createdAt).toLocaleString('en-IN')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-gray-800">{new Date(payment.updatedAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* ── Payment Proof Documents ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <DocumentsPanel
          entityType={DocumentEntityType.PAYMENT}
          entityId={id}
          customerId={payment.customerId || undefined}
          bookingId={payment.bookingId || undefined}
          title="Payment Proof & Documents"
        />
      </div>

      {/* ── Generate Receipt Dialog ─────────────────────────────────────────── */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Generate Money Receipt</DialogTitle>
            <DialogDescription>
              Confirm the receipt number and add any notes. All other details are auto-filled
              from the payment record.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Amount preview */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-green-700 font-medium">Amount Received</span>
              <span className="text-xl font-bold text-green-700">
                ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number *</Label>
              <Input
                id="receiptNumber"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder={payment.receiptNumber || 'e.g. EE/REC/25-26/0001'}
              />
              <p className="text-xs text-gray-500">
                {payment.receiptNumber
                  ? `Pre-filled from stored receipt number: ${payment.receiptNumber}`
                  : 'Enter a receipt number for this payment.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration">Narration / Notes (optional)</Label>
              <Textarea
                id="narration"
                value={receiptNarration}
                onChange={(e) => setReceiptNarration(e.target.value)}
                placeholder="e.g. Payment received against On-Possession demand for Flat A-101"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReceipt}
              disabled={generatingReceipt}
              style={{ backgroundColor: '#3DA35D', color: '#fff' }}
            >
              {generatingReceipt
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                : <><Download className="mr-2 h-4 w-4" /> Download Receipt PDF</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
