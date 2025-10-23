'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PaymentForm from '@/components/forms/PaymentForm';
import { paymentsService } from '@/services/payments.service';

export default function NewPaymentPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await paymentsService.createPayment(data);
            alert('Payment recorded successfully!');
            window.location.href = '/payments';
        } catch (error: any) {
            console.error('Error recording payment:', error);
            alert(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const handleCancel = () => {
        router.push('/payments');
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
                    <span>Back to Payments</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Record New Payment
                </h1>
                <p className="text-gray-600 mt-2">
                    Record a payment received from a customer.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <PaymentForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
