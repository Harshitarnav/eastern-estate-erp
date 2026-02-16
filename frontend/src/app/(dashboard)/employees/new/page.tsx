'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EmployeeForm from '@/components/forms/EmployeeForm';
import { employeesService } from '@/services/employees.service';
import uploadService from '@/services/upload.service';

export default function NewEmployeePage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            
            // Handle profile picture upload if present
            if (data.profilePicture && Array.isArray(data.profilePicture) && data.profilePicture.length > 0) {
                const file = data.profilePicture[0];
                if (file instanceof File) {
                    try {
                        const uploadResponse = await uploadService.uploadFile(file, 'employee-profiles');
                        
                        // Extract the URL from the response object
                        if (uploadResponse && uploadResponse.url) {
                            data.profilePicture = uploadResponse.url;
                        } else {
                            throw new Error('Upload response missing URL');
                        }
                    } catch (uploadError: any) {
                        const errorMessage = uploadError?.message || 'Unknown error';
                        alert(`Failed to upload profile picture: ${errorMessage}. Employee will be created without a photo.`);
                        delete data.profilePicture;
                    }
                } else {
                    delete data.profilePicture;
                }
            } else {
                delete data.profilePicture;
            }

            // Clean up the data - remove any empty or invalid fields
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => {
                    // Keep the value if it's not null, undefined, or empty string
                    // But keep 0 and false as valid values
                    return value !== null && value !== undefined && value !== '';
                })
            );
            const newEmployee = await employeesService.createEmployee(cleanedData);
            
            alert('Employee added successfully!');
            router.push('/employees');
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add employee');
        }
    };

    const handleCancel = () => {
        router.push('/employees');
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
                    <span>Back to Employees</span>
                </button>
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Add New Employee
                </h1>
                <p className="text-gray-600 mt-2">
                    Add a new employee to your organization.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <EmployeeForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
