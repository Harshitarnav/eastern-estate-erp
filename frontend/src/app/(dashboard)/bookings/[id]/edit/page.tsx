'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { bookingsService } from '@/services/bookings.service';
import { BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette } from '@/utils/brand';

export default function BookingEditPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: 'PENDING',
    bookingDate: '',
    totalAmount: 0,
    tokenAmount: 0,
    paidAmount: 0,
    discountAmount: 0,
    stampDuty: 0,
    registrationCharges: 0,
    gstAmount: 0,
    maintenanceDeposit: 0,
    parkingCharges: 0,
    otherCharges: 0,
    agreementNumber: '',
    agreementDate: '',
    agreementSignedDate: '',
    expectedPossessionDate: '',
    actualPossessionDate: '',
    registrationDate: '',
    isHomeLoan: false,
    bankName: '',
    loanAmount: 0,
    loanApplicationNumber: '',
    tokenPaymentMode: '',
    notes: '',
    specialTerms: '',
  });

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const booking = await bookingsService.getBooking(bookingId);
      setFormData({
        status: booking.status || 'PENDING',
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
        totalAmount: booking.totalAmount || 0,
        tokenAmount: booking.tokenAmount || 0,
        paidAmount: booking.paidAmount || 0,
        discountAmount: booking.discountAmount || 0,
        stampDuty: booking.stampDuty || 0,
        registrationCharges: booking.registrationCharges || 0,
        gstAmount: booking.gstAmount || 0,
        maintenanceDeposit: booking.maintenanceDeposit || 0,
        parkingCharges: booking.parkingCharges || 0,
        otherCharges: booking.otherCharges || 0,
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
        tokenPaymentMode: booking.tokenPaymentMode || '',
        notes: booking.notes || '',
        specialTerms: booking.specialTerms || '',
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      await bookingsService.updateBooking(bookingId, formData);
      alert('Booking updated successfully!');
      router.push(`/bookings/${bookingId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update booking');
      alert('Failed to update booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/bookings/${bookingId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: brandPalette.secondary }}>Edit Booking</h1>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Booking Date *</label>
              <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Total Amount *</label>
              <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Token Amount *</label>
              <input type="number" name="tokenAmount" value={formData.tokenAmount} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Paid Amount</label>
              <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Amount</label>
              <input type="number" name="discountAmount" value={formData.discountAmount} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stamp Duty</label>
              <input type="number" name="stampDuty" value={formData.stampDuty} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Registration Charges</label>
              <input type="number" name="registrationCharges" value={formData.registrationCharges} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GST Amount</label>
              <input type="number" name="gstAmount" value={formData.gstAmount} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Parking Charges</label>
              <input type="number" name="parkingCharges" value={formData.parkingCharges} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Agreement Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Agreement Number</label>
              <input type="text" name="agreementNumber" value={formData.agreementNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Agreement Date</label>
              <input type="date" name="agreementDate" value={formData.agreementDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Agreement Signed Date</label>
              <input type="date" name="agreementSignedDate" value={formData.agreementSignedDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Possession Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expected Possession</label>
              <input type="date" name="expectedPossessionDate" value={formData.expectedPossessionDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Actual Possession</label>
              <input type="date" name="actualPossessionDate" value={formData.actualPossessionDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Registration Date</label>
              <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Home Loan Details</h2>
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isHomeLoan" checked={formData.isHomeLoan} onChange={handleChange} />
              <span className="text-sm font-medium">Home Loan Required</span>
            </label>
          </div>
          {formData.isHomeLoan && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Loan Amount</label>
                <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Application Number</label>
                <input type="text" name="loanApplicationNumber" value={formData.loanApplicationNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="Add any notes..." />
        </div>

        <div className="flex gap-4">
          <BrandPrimaryButton type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </BrandPrimaryButton>
          <BrandSecondaryButton type="button" onClick={() => router.push(`/bookings/${bookingId}`)}>
            Cancel
          </BrandSecondaryButton>
        </div>
      </form>
    </div>
  );
}
