'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Edit, Loader2 } from 'lucide-react';
import BookingForm from '@/components/forms/BookingForm';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { toast } from 'sonner';

// ── helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const fmtAmt  = (n: any)    => (n ? '₹' + Number(n).toLocaleString('en-IN') : '—');

const STATUS_LABELS: Record<string, string> = {
  TOKEN_PAID: 'Token Paid',
  AGREEMENT_PENDING: 'Agreement Pending',
  AGREEMENT_SIGNED: 'Agreement Signed',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  TRANSFERRED: 'Transferred',
  COMPLETED: 'Completed',
};

interface ReviewMeta {
  customerName: string;
  propertyName: string;
  flatLabel: string;      // "A-101 (2BHK)"
  towerName: string;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function NewBookingPage() {
  const router = useRouter();

  const [pendingData, setPendingData]   = useState<any>(null);
  const [reviewMeta, setReviewMeta]     = useState<ReviewMeta>({ customerName: '', propertyName: '', flatLabel: '', towerName: '' });
  const [resolving, setResolving]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const handleFormSubmit = async (data: any) => {
    setResolving(true);

    let customerName = data.customerId  || '—';
    let propertyName = data.propertyId  || '—';
    let flatLabel    = data.flatId      || '—';
    let towerName    = '';

    try {
      const [customer, flat, property] = await Promise.all([
        data.customerId ? customersService.getCustomer(data.customerId)       : Promise.resolve(null),
        data.flatId     ? flatsService.getFlat(data.flatId)                   : Promise.resolve(null),
        data.propertyId ? propertiesService.getPropertyById(data.propertyId)  : Promise.resolve(null),
      ]);
      if (customer) customerName = (customer as any).fullName || customerName;
      if (property) propertyName = (property as any).name    || propertyName;
      if (flat) {
        const f = flat as any;
        flatLabel = [f.flatNumber, f.flatType].filter(Boolean).join(' – ') || flatLabel;
        towerName = f.tower?.name || '';
      }
    } catch {/* keep raw IDs on failure */}

    setReviewMeta({ customerName, propertyName, flatLabel, towerName });
    setPendingData(data);
    setResolving(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const bookingData = {
        customerId: pendingData.customerId,
        propertyId: pendingData.propertyId,
        towerId: pendingData.towerId || undefined,
        flatId: pendingData.flatId,
        bookingNumber: pendingData.bookingNumber,
        bookingDate: pendingData.bookingDate,
        paymentPlan: pendingData.paymentPlan,
        totalAmount: parseFloat(pendingData.totalAmount) || 0,
        tokenAmount: parseFloat(pendingData.tokenAmount) || 0,
        agreementAmount: parseFloat(pendingData.agreementAmount) || 0,
        discountAmount: parseFloat(pendingData.discountAmount) || 0,
        discountReason: pendingData.discountReason || null,
        gstAmount: parseFloat(pendingData.gstAmount) || 0,
        stampDuty: parseFloat(pendingData.stampDuty) || 0,
        registrationCharges: parseFloat(pendingData.registrationCharges) || 0,
        maintenanceDeposit: parseFloat(pendingData.maintenanceDeposit) || 0,
        parkingCharges: parseFloat(pendingData.parkingCharges) || 0,
        otherCharges: parseFloat(pendingData.otherCharges) || 0,
        tokenPaidDate: pendingData.tokenPaidDate || null,
        tokenReceiptNumber: pendingData.tokenReceiptNumber || null,
        tokenPaymentMode: pendingData.tokenPaymentMode || null,
        rtgsNumber: pendingData.rtgsNumber || null,
        utrNumber: pendingData.utrNumber || null,
        chequeNumber: pendingData.chequeNumber || null,
        chequeDate: pendingData.chequeDate || null,
        paymentBank: pendingData.paymentBank || null,
        paymentBranch: pendingData.paymentBranch || null,
        agreementNumber: pendingData.agreementNumber || null,
        agreementDate: pendingData.agreementDate || null,
        agreementSignedDate: pendingData.agreementSignedDate || null,
        expectedPossessionDate: pendingData.expectedPossessionDate || null,
        actualPossessionDate: pendingData.actualPossessionDate || null,
        registrationDate: pendingData.registrationDate || null,
        isHomeLoan: pendingData.isHomeLoan === 'true' || pendingData.isHomeLoan === true,
        bankName: pendingData.bankName || null,
        loanAmount: parseFloat(pendingData.loanAmount) || 0,
        loanApplicationNumber: pendingData.loanApplicationNumber || null,
        loanApprovalDate: pendingData.loanApprovalDate || null,
        loanDisbursementDate: pendingData.loanDisbursementDate || null,
        nominee1Name: pendingData.nominee1Name || null,
        nominee1Relation: pendingData.nominee1Relation || null,
        nominee2Name: pendingData.nominee2Name || null,
        nominee2Relation: pendingData.nominee2Relation || null,
        coApplicantName: pendingData.coApplicantName || null,
        coApplicantEmail: pendingData.coApplicantEmail || null,
        coApplicantPhone: pendingData.coApplicantPhone || null,
        coApplicantRelation: pendingData.coApplicantRelation || null,
        notes: pendingData.notes || null,
        specialTerms: pendingData.specialTerms || null,
      };

      await bookingsService.createBooking(bookingData);
      toast.success('Booking created successfully!');
      router.push('/bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToForm = () => setPendingData(null);
  const handleCancel     = () => router.push('/bookings');

  // ── Review row — only renders when value is truthy (or required flag is set) ─
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
          <span>{pendingData ? 'Back to Form' : 'Back to Bookings'}</span>
        </button>

        <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
          {pendingData ? 'Review Booking' : 'Create New Booking'}
        </h1>
        <p className="text-gray-600 mt-1">
          {pendingData
            ? 'Check all details carefully before confirming.'
            : 'Record a new flat booking for a customer.'}
        </p>
      </div>

      {/* Loading overlay while resolving names */}
      {resolving && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-700 text-sm">Loading details for review…</span>
        </div>
      )}

      {/* ── Booking Form — hidden (not unmounted) while reviewing ──────────── */}
      <div className={pendingData || resolving ? 'hidden' : ''}>
        <div className="bg-white rounded-lg shadow-md p-6">
          <BookingForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
        </div>
      </div>

      {/* ── Review Panel ──────────────────────────────────────────────────── */}
      {pendingData && !resolving && (
        <div className="space-y-5">

          {/* Notice banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
            ⚠️ Please verify all details. Once confirmed, the flat will be marked as booked and cannot be booked by another customer.
          </div>

          {/* Card: Core booking info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>
              Booking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReviewRow label="Booking Number" value={pendingData.bookingNumber} required />
              <ReviewRow label="Booking Date"   value={fmtDate(pendingData.bookingDate)} required />
              <ReviewRow label="Status"         value={STATUS_LABELS[pendingData.status] || pendingData.status} required />
              <ReviewRow label="Customer"       value={reviewMeta.customerName} required />
              <ReviewRow label="Property"       value={reviewMeta.propertyName} required />
              <ReviewRow label="Tower"          value={reviewMeta.towerName} />
              <ReviewRow label="Flat / Unit"    value={reviewMeta.flatLabel} required />
              <ReviewRow label="Payment Plan"   value={pendingData.paymentPlan} />
            </div>
          </div>

          {/* Card: Financial summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>
              Financial Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold">{fmtAmt(pendingData.totalAmount)}</span>
              </div>
              {Number(pendingData.tokenAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Token Amount</span>
                  <span>{fmtAmt(pendingData.tokenAmount)}</span>
                </div>
              )}
              {Number(pendingData.agreementAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Agreement Amount</span>
                  <span>{fmtAmt(pendingData.agreementAmount)}</span>
                </div>
              )}
              {Number(pendingData.gstAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST</span>
                  <span>{fmtAmt(pendingData.gstAmount)}</span>
                </div>
              )}
              {Number(pendingData.stampDuty) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stamp Duty</span>
                  <span>{fmtAmt(pendingData.stampDuty)}</span>
                </div>
              )}
              {Number(pendingData.registrationCharges) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Registration Charges</span>
                  <span>{fmtAmt(pendingData.registrationCharges)}</span>
                </div>
              )}
              {Number(pendingData.maintenanceDeposit) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maintenance Deposit</span>
                  <span>{fmtAmt(pendingData.maintenanceDeposit)}</span>
                </div>
              )}
              {Number(pendingData.parkingCharges) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Parking Charges</span>
                  <span>{fmtAmt(pendingData.parkingCharges)}</span>
                </div>
              )}
              {Number(pendingData.otherCharges) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Charges</span>
                  <span>{fmtAmt(pendingData.otherCharges)}</span>
                </div>
              )}
              {Number(pendingData.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount {pendingData.discountReason ? `(${pendingData.discountReason})` : ''}</span>
                  <span>− {fmtAmt(pendingData.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-3" style={{ color: '#7B1E12' }}>
                <span>Total Booking Amount</span>
                <span className="text-lg">{fmtAmt(pendingData.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Card: Token details */}
          {(pendingData.tokenPaidDate || pendingData.tokenReceiptNumber || pendingData.tokenPaymentMode) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Token Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingData.tokenPaidDate      && <ReviewRow label="Token Paid Date"    value={fmtDate(pendingData.tokenPaidDate)} />}
                {pendingData.tokenReceiptNumber && <ReviewRow label="Token Receipt No"   value={pendingData.tokenReceiptNumber} />}
                {pendingData.tokenPaymentMode   && <ReviewRow label="Token Payment Mode" value={pendingData.tokenPaymentMode} />}
                {pendingData.chequeNumber       && <ReviewRow label="Cheque No"          value={pendingData.chequeNumber} />}
                {pendingData.chequeDate         && <ReviewRow label="Cheque Date"        value={fmtDate(pendingData.chequeDate)} />}
                {pendingData.rtgsNumber         && <ReviewRow label="RTGS Ref No"        value={pendingData.rtgsNumber} />}
                {pendingData.utrNumber          && <ReviewRow label="UTR Number"         value={pendingData.utrNumber} />}
                {pendingData.paymentBank        && <ReviewRow label="Bank"               value={pendingData.paymentBank} />}
                {pendingData.paymentBranch      && <ReviewRow label="Branch"             value={pendingData.paymentBranch} />}
              </div>
            </div>
          )}

          {/* Card: Agreement details */}
          {(pendingData.agreementNumber || pendingData.agreementDate || pendingData.expectedPossessionDate) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Agreement & Possession</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingData.agreementNumber         && <ReviewRow label="Agreement No"         value={pendingData.agreementNumber} />}
                {pendingData.agreementDate           && <ReviewRow label="Agreement Date"        value={fmtDate(pendingData.agreementDate)} />}
                {pendingData.agreementSignedDate     && <ReviewRow label="Agreement Signed"      value={fmtDate(pendingData.agreementSignedDate)} />}
                {pendingData.expectedPossessionDate  && <ReviewRow label="Expected Possession"   value={fmtDate(pendingData.expectedPossessionDate)} />}
              </div>
            </div>
          )}

          {/* Card: Home Loan */}
          {(pendingData.isHomeLoan === true || pendingData.isHomeLoan === 'true') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Home Loan Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingData.bankName              && <ReviewRow label="Bank"              value={pendingData.bankName} />}
                {pendingData.loanAmount            && <ReviewRow label="Loan Amount"       value={fmtAmt(pendingData.loanAmount)} />}
                {pendingData.loanApplicationNumber && <ReviewRow label="Application No"    value={pendingData.loanApplicationNumber} />}
                {pendingData.loanApprovalDate      && <ReviewRow label="Approval Date"     value={fmtDate(pendingData.loanApprovalDate)} />}
                {pendingData.loanDisbursementDate  && <ReviewRow label="Disbursement Date" value={fmtDate(pendingData.loanDisbursementDate)} />}
              </div>
            </div>
          )}

          {/* Card: Co-applicant & Nominees */}
          {(pendingData.coApplicantName || pendingData.nominee1Name) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Co-applicant & Nominees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingData.coApplicantName && <ReviewRow label="Co-applicant"       value={`${pendingData.coApplicantName} (${pendingData.coApplicantRelation || ''})`} />}
                {pendingData.nominee1Name    && <ReviewRow label="Nominee 1"          value={`${pendingData.nominee1Name} (${pendingData.nominee1Relation || ''})`} />}
                {pendingData.nominee2Name    && <ReviewRow label="Nominee 2"          value={`${pendingData.nominee2Name} (${pendingData.nominee2Relation || ''})`} />}
              </div>
            </div>
          )}

          {/* Card: Notes */}
          {(pendingData.notes || pendingData.specialTerms) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-base font-semibold mb-4" style={{ color: '#7B1E12' }}>Notes & Terms</h2>
              {pendingData.notes        && <><p className="text-xs text-gray-500 mb-1">Notes</p><p className="text-gray-700 mb-3">{pendingData.notes}</p></>}
              {pendingData.specialTerms && <><p className="text-xs text-gray-500 mb-1">Special Terms</p><p className="text-gray-700">{pendingData.specialTerms}</p></>}
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
                ← Edit Details
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
                style={{ backgroundColor: '#3DA35D' }}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><CheckCircle className="h-5 w-5" /> Confirm &amp; Create Booking</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
