'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BookingForm from '@/components/forms/BookingForm';
import { bookingsService } from '@/services/bookings.service';

export default function NewBookingPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await bookingsService.createBooking(data);
            alert('Booking created successfully!');
            router.push('/bookings');
        } catch (error: any) {
            console.error('Error creating booking:', error);
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
