'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EmployeeForm from '@/components/forms/EmployeeForm';
import { employeesService } from '@/services/employees.service';

export default function NewEmployeePage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await employeesService.createEmployee(data);
            alert('Employee added successfully!');
            window.location.href = '/employees';
        } catch (error: any) {
            console.error('Error adding employee:', error);
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
