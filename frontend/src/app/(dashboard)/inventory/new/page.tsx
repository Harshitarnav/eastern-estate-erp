'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import InventoryForm from '@/components/forms/InventoryForm';
import { inventoryService } from '@/services/inventory.service';

export default function NewInventoryPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await inventoryService.createItem(data);
            alert('Inventory item added successfully!');
            router.push('/inventory');
        } catch (error: any) {
            console.error('Error adding inventory item:', error);
            alert(error.response?.data?.message || 'Failed to add inventory item');
        }
    };

    const handleCancel = () => {
        router.push('/inventory');
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
                    <span>Back to Inventory</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Add Inventory Item
                </h1>
                <p className="text-gray-600 mt-2">
                    Add a new item to your inventory.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <InventoryForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
