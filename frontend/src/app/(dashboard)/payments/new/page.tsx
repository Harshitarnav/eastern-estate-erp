'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Edit, Loader2 } from 'lucide-react';
import PaymentForm from '@/components/forms/PaymentForm';
import { paymentsService } from '@/services/payments.service';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';
import { toast } from 'sonner';

// ── helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const fmtAmt  = (n: any)    => n && Number(n) > 0 ? '₹' + Number(n).toLocaleString('en-IN') : null;

const MODE_LABELS: Record<string, string> = {
  CASH: 'Cash', CHEQUE: 'Cheque', BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI', CARD: 'Debit/Credit Card', RTGS: 'RTGS', NEFT: 'NEFT',
  IMPS: 'IMPS', DD: 'Demand Draft', ONLINE: 'Online Payment', OTHER: 'Other',
};
const TYPE_LABELS: Record<string, string> = {
  TOKEN: 'Token', AGREEMENT: 'Agreement', INSTALLMENT: 'Installment',
  FINAL: 'Final Payment', ADVANCE: 'Advance', REFUND: 'Refund',
  BOOKING: 'Booking', OTHER: 'Other',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', RECEIVED: 'Received', CLEARED: 'Cleared',
  BOUNCED: 'Bounced', CANCELLED: 'Cancelled', REFUNDED: 'Refunded',
};

// ── Transform form data to API-compatible payload ──────────────────────────────
// The form uses different field names than the backend DTO:
//   paymentMode      → paymentMethod  (column: payment_mode)
//   transactionId    → transactionReference (column: transaction_id)
//   paymentNumber    → paymentCode    (column: payment_number)
function buildApiPayload(data: any) {
  return {
    paymentCode:          data.paymentNumber   || undefined,
    bookingId:            data.bookingId        || undefined,
    customerId:           data.customerId       || undefined,
    paymentType:          data.paymentType      || 'OTHER',
    paymentCategory:      data.paymentType      || undefined,  // copy type to category for legacy compat
    paymentMethod:        data.paymentMode      || undefined,  // ← RENAMED field
    amount:               Number(data.amount)   || 0,
    paymentDate:          data.paymentDate,
    bankName:             data.bankName         || undefined,
    transactionReference: data.transactionId    || undefined,  // ← RENAMED field
    chequeNumber:         data.chequeNumber     || undefined,
    chequeDate:           data.chequeDate       || undefined,
    upiId:                data.upiId            || undefined,
    status:               data.status           || 'PENDING',
    receiptNumber:        data.receiptNumber    || undefined,
    notes:                data.notes            || data.internalNotes || undefined,
    remarks:              data.remarks          || undefined,
  };
}

interface ReviewMeta { customerName: string; bookingNumber: string }

// ── component ─────────────────────────────────────────────────────────────────
export default function NewPaymentPage() {
  const router = useRouter();

  const [pendingData, setPendingData] = useState<any>(null);
  const [reviewMeta, setReviewMeta]   = useState<ReviewMeta>({ customerName: '', bookingNumber: '' });
  const [resolving, setResolving]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  const handleFormSubmit = async (data: any) => {
    setResolving(true);
    let customerName  = '—';
    let bookingNumber = '—';
    try {
      const [customer, booking] = await Promise.all([
        data.customerId ? customersService.getCustomer(data.customerId) : Promise.resolve(null),
        data.bookingId  ? bookingsService.getBooking(data.bookingId)    : Promise.resolve(null),
      ]);
      if (customer) customerName  = (customer as any).fullName      || customerName;
      if (booking)  bookingNumber = (booking  as any).bookingNumber || bookingNumber;
    } catch { /* keep fallback values */ }
    setReviewMeta({ customerName, bookingNumber });
    setPendingData(data);
    setResolving(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await paymentsService.createPayment(buildApiPayload(pendingData));
      toast.success('Payment recorded successfully!');
      router.push('/payments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToForm = () => setPendingData(null);
  const handleCancel     = () => router.push('/payments');

  // ── Review row — only renders when value is truthy ─────────────────────────
  const ReviewRow = ({ label, value, required }: { label: string; value: React.ReactNode; required?: boolean }) => {
    if (!value && !required) return null;
    return (
      <div className="border-b pb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`font-semibold ${!value ? 'text-red-500 italic' : 'text-gray-800'}`}>
          {value || 'Not filled — go back and enter this'}
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={pendingData ? handleBackToForm : handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{pendingData ? 'Back to Form' : 'Back to Payments'}</span>
        </button>
        <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
          {pendingData ? 'Review Payment' : 'Record New Payment'}
        </h1>
        <p className="text-gray-600 mt-1">
          {pendingData
            ? 'Check all details carefully before confirming.'
            : 'Record a payment received from a customer.'}
        </p>
      </div>

      {resolving && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-700 text-sm">Loading details for review…</span>
        </div>
      )}

      {/* ── Payment Form — hidden while reviewing (NOT unmounted so values are kept) ── */}
      <div className={pendingData || resolving ? 'hidden' : ''}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <PaymentForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
        </div>
      </div>

      {/* ── Review Panel ──────────────────────────────────────────────────── */}
      {pendingData && !resolving && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
            ⚠️ Please review all details before confirming. Once saved, the payment will be recorded in the system.
          </div>

          {/* Card: Core details (required fields always shown) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Required Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReviewRow label="Payment Number"  value={pendingData.paymentNumber} required />
              <ReviewRow label="Payment Date"    value={fmtDate(pendingData.paymentDate)} required />
              <ReviewRow label="Customer"        value={reviewMeta.customerName} required />
              <ReviewRow label="Booking"         value={reviewMeta.bookingNumber} required />
              <ReviewRow label="Payment Type"    value={TYPE_LABELS[pendingData.paymentType] || pendingData.paymentType} required />
              <ReviewRow label="Payment Mode"    value={MODE_LABELS[pendingData.paymentMode] || pendingData.paymentMode} required />
              <ReviewRow label="Status"          value={STATUS_LABELS[pendingData.status] || pendingData.status} required />
              {pendingData.receiptNumber && <ReviewRow label="Receipt Number" value={pendingData.receiptNumber} />}
            </div>
          </div>

          {/* Card: Amount breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Amount Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Amount</span>
                <span className="font-semibold text-red-700">{fmtAmt(pendingData.amount) ?? '—'}</span>
              </div>
              {fmtAmt(pendingData.tdsAmount) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TDS {pendingData.tdsPercentage ? `(${pendingData.tdsPercentage}%)` : ''}</span>
                  <span>{fmtAmt(pendingData.tdsAmount)}</span>
                </div>
              )}
              {fmtAmt(pendingData.gstAmount) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST {pendingData.gstPercentage ? `(${pendingData.gstPercentage}%)` : ''}</span>
                  <span>{fmtAmt(pendingData.gstAmount)}</span>
                </div>
              )}
              {fmtAmt(pendingData.netAmount) && (
                <div className="flex justify-between font-bold border-t pt-3 text-green-700">
                  <span>Net Amount</span>
                  <span className="text-lg">{fmtAmt(pendingData.netAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Payment instrument — only if any instrument detail is filled */}
          {(pendingData.bankName || pendingData.chequeNumber || pendingData.transactionId || pendingData.upiId) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Payment Instrument</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingData.bankName        && <ReviewRow label="Bank Name"          value={pendingData.bankName} />}
                {pendingData.chequeNumber    && <ReviewRow label="Cheque Number"       value={pendingData.chequeNumber} />}
                {pendingData.chequeDate      && <ReviewRow label="Cheque Date"         value={fmtDate(pendingData.chequeDate)} />}
                {pendingData.transactionId   && <ReviewRow label="Transaction / UTR"   value={pendingData.transactionId} />}
                {pendingData.upiId           && <ReviewRow label="UPI Reference"       value={pendingData.upiId} />}
              </div>
            </div>
          )}

          {/* Card: Remarks — only if filled */}
          {pendingData.remarks && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-2" style={{ color: '#7B1E12' }}>Remarks</h2>
              <p className="text-gray-700">{pendingData.remarks}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBackToForm}
                className="flex items-center justify-center gap-2 px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                <Edit className="h-4 w-4" />
                Edit Details
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#3DA35D' }}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><CheckCircle className="h-5 w-5" /> Confirm &amp; Save Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
