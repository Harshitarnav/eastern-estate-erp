'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BookingForm from '@/components/forms/BookingForm';
import { bookingsService } from '@/services/bookings.service';

export default function BookingEditPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const booking = await bookingsService.getBooking(bookingId);
      setInitialData({
        bookingNumber: booking.bookingNumber,
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
        status: booking.status || 'TOKEN_PAID',
        customerId: booking.customerId || '',
        propertyId: booking.propertyId || '',
        towerId: booking.towerId || '',
        flatId: booking.flatId || '',
        totalAmount: booking.totalAmount || 0,
        tokenAmount: booking.tokenAmount || 0,
        agreementAmount: booking.agreementAmount || 0,
        discountAmount: booking.discountAmount || 0,
        discountReason: booking.discountReason || '',
        gstAmount: booking.gstAmount || 0,
        stampDuty: booking.stampDuty || 0,
        registrationCharges: booking.registrationCharges || 0,
        maintenanceDeposit: booking.maintenanceDeposit || 0,
        parkingCharges: booking.parkingCharges || 0,
        otherCharges: booking.otherCharges || 0,
        tokenPaidDate: booking.tokenPaidDate ? new Date(booking.tokenPaidDate).toISOString().split('T')[0] : '',
        tokenReceiptNumber: booking.tokenReceiptNumber || '',
        tokenPaymentMode: booking.tokenPaymentMode || '',
        agreementNumber: booking.agreementNumber || '',
        agreementDate: booking.agreementDate ? new Date(booking.agreementDate).toISOString().split('T')[0] : '',
        agreementSignedDate: booking.agreementSignedDate ? new Date(booking.agreementSignedDate).toISOString().split('T')[0] : '',
        expectedPossessionDate: booking.expectedPossessionDate ? new Date(booking.expectedPossessionDate).toISOString().split('T')[0] : '',
        actualPossessionDate: booking.actualPossessionDate ? new Date(booking.actualPossessionDate).toISOString().split('T')[0] : '',
        registrationDate: booking.registrationDate ? new Date(booking.registrationDate).toISOString().split('T')[0] : '',
        isHomeLoan: booking.isHomeLoan || false,
        bankName: booking.bankName || '',
        loanAmount: booking.loanAmount || 0,
        loanApplicationNumber: booking.loanApplicationNumber || '',
        loanApprovalDate: booking.loanApprovalDate ? new Date(booking.loanApprovalDate).toISOString().split('T')[0] : '',
        loanDisbursementDate: booking.loanDisbursementDate ? new Date(booking.loanDisbursementDate).toISOString().split('T')[0] : '',
        nominee1Name: booking.nominee1Name || '',
        nominee1Relation: booking.nominee1Relation || '',
        nominee2Name: booking.nominee2Name || '',
        nominee2Relation: booking.nominee2Relation || '',
        coApplicantName: booking.coApplicantName || '',
        coApplicantEmail: booking.coApplicantEmail || '',
        coApplicantPhone: booking.coApplicantPhone || '',
        coApplicantRelation: booking.coApplicantRelation || '',
        notes: booking.notes || '',
        specialTerms: booking.specialTerms || '',
        paymentPlan: booking.paymentPlan || '',
        paidAmount: booking.paidAmount || 0,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        customerId: data.customerId,
        propertyId: data.propertyId,
        towerId: data.towerId,
        flatId: data.flatId,
        bookingNumber: data.bookingNumber,
        bookingDate: data.bookingDate,
        paymentPlan: data.paymentPlan,
        status: data.status,
        totalAmount: parseFloat(data.totalAmount) || 0,
        tokenAmount: parseFloat(data.tokenAmount) || 0,
        agreementAmount: parseFloat(data.agreementAmount) || 0,
        discountAmount: parseFloat(data.discountAmount) || 0,
        discountReason: data.discountReason || null,
        gstAmount: parseFloat(data.gstAmount) || 0,
        stampDuty: parseFloat(data.stampDuty) || 0,
        registrationCharges: parseFloat(data.registrationCharges) || 0,
        maintenanceDeposit: parseFloat(data.maintenanceDeposit) || 0,
        parkingCharges: parseFloat(data.parkingCharges) || 0,
        otherCharges: parseFloat(data.otherCharges) || 0,
        tokenPaidDate: data.tokenPaidDate || null,
        tokenReceiptNumber: data.tokenReceiptNumber || null,
        tokenPaymentMode: data.tokenPaymentMode || null,
        agreementNumber: data.agreementNumber || null,
        agreementDate: data.agreementDate || null,
        agreementSignedDate: data.agreementSignedDate || null,
        expectedPossessionDate: data.expectedPossessionDate || null,
        actualPossessionDate: data.actualPossessionDate || null,
        registrationDate: data.registrationDate || null,
        isHomeLoan: data.isHomeLoan === 'true' || data.isHomeLoan === true,
        bankName: data.bankName || null,
        loanAmount: parseFloat(data.loanAmount) || 0,
        loanApplicationNumber: data.loanApplicationNumber || null,
        loanApprovalDate: data.loanApprovalDate || null,
        loanDisbursementDate: data.loanDisbursementDate || null,
        nominee1Name: data.nominee1Name || null,
        nominee1Relation: data.nominee1Relation || null,
        nominee2Name: data.nominee2Name || null,
        nominee2Relation: data.nominee2Relation || null,
        coApplicantName: data.coApplicantName || null,
        coApplicantEmail: data.coApplicantEmail || null,
        coApplicantPhone: data.coApplicantPhone || null,
        coApplicantRelation: data.coApplicantRelation || null,
        notes: data.notes || null,
        specialTerms: data.specialTerms || null,
        paidAmount: parseFloat(data.paidAmount) || 0,
      };
      await bookingsService.updateBooking(bookingId, payload);
      alert('Booking updated successfully!');
      window.location.href = '/bookings';
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>
        <button
          onClick={() => router.push('/bookings')}
          className="px-4 py-2 rounded-lg border text-sm"
        >
          Back to bookings
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/bookings/${bookingId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
      </div>

      <BookingForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/bookings/${bookingId}`)}
      />
    </div>
  );
}
