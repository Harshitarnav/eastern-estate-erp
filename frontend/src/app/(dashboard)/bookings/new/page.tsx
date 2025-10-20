'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BookingForm from '@/components/forms/BookingForm';
import { bookingsService } from '@/services/bookings.service';

export default function NewBookingPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            console.log('Form data received:', data);
            
            // Transform form data to match API requirements
            const bookingData = {
                customerId: data.customerId,
                propertyId: data.propertyId,
                towerId: data.towerId,
                flatId: data.flatId,
                bookingNumber: data.bookingNumber,
                bookingDate: data.bookingDate,
                paymentPlan: data.paymentPlan,
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
            };
            
            console.log('Transformed booking data:', bookingData);
            
            await bookingsService.createBooking(bookingData);
            alert('Booking created successfully!');
            router.push('/bookings');
        } catch (error: any) {
            console.error('Error creating booking:', error);
            console.error('Error response:', error.response?.data);
            alert(error.response?.data?.message || 'Failed to create booking');
        }
    };

    const handleCancel = () => {
        router.push('/bookings');
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Bookings</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Create New Booking
                </h1>
                <p className="text-gray-600 mt-2">
                    Record a new flat booking for a customer.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <BookingForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
