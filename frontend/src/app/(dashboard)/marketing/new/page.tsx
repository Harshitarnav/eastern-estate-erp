'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CampaignForm from '@/components/forms/CampaignForm';
import { marketingService } from '@/services/marketing.service';

export default function NewMarketingPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await marketingService.createCampaign(data);
            alert('Marketing campaign created successfully!');
            router.push('/marketing');
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            alert(error.response?.data?.message || 'Failed to create marketing campaign');
        }
    };

    const handleCancel = () => {
        router.push('/marketing');
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
                    <span>Back to Marketing Campaigns</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Create Marketing Campaign
                </h1>
                <p className="text-gray-600 mt-2">
                    Launch a new marketing campaign to generate leads and track ROI.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <CampaignForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
