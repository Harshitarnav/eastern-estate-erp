'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm';
import { purchaseOrdersService } from '@/services/purchase-orders.service';

export default function NewPurchaseOrderPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await purchaseOrdersService.createPurchaseOrder(data);
            alert('Purchase order created successfully!');
            router.push('/purchase-orders');
        } catch (error: any) {
            console.error('Error creating purchase order:', error);
            alert(error.response?.data?.message || 'Failed to create purchase order');
        }
    };

    const handleCancel = () => {
        router.push('/purchase-orders');
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
                    <span>Back to Purchase Orders</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Create Purchase Order
                </h1>
                <p className="text-gray-600 mt-2">
                    Create a new purchase order for procurement.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <PurchaseOrderForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
