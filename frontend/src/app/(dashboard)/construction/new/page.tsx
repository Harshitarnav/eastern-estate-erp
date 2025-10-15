'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ConstructionForm from '@/components/forms/ConstructionForm';
import { constructionService } from '@/services/construction.service';

export default function NewConstructionPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await constructionService.createProject(data);
            alert('Construction project created successfully!');
            router.push('/construction');
        } catch (error: any) {
            console.error('Error creating project:', error);
            alert(error.response?.data?.message || 'Failed to create construction project');
        }
    };

    const handleCancel = () => {
        router.push('/construction');
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
                    <span>Back to Construction Projects</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Create Construction Project
                </h1>
                <p className="text-gray-600 mt-2">
                    Add a new construction project to track progress and manage contractors.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <ConstructionForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
