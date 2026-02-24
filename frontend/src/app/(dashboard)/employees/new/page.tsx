'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EmployeeForm from '@/components/forms/EmployeeForm';
import { employeesService } from '@/services/employees.service';
import uploadService from '@/services/upload.service';
import {
  parseApiErrors,
  StatusBanner,
  type Banner,
} from '../_utils/employeeErrorUtils';

export default function NewEmployeePage() {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    setBanner(null);
    setSaving(true);

    try {
      // Handle profile picture upload if present
      if (data.profilePicture && Array.isArray(data.profilePicture) && data.profilePicture.length > 0) {
        const file = data.profilePicture[0];
        if (file instanceof File) {
          try {
            const uploadResponse = await uploadService.uploadFile(file, 'employee-profiles');
            if (uploadResponse?.url) {
              data.profilePicture = uploadResponse.url;
            } else {
              throw new Error('Upload response missing URL');
            }
          } catch {
            setBanner({
              type: 'warning',
              title: 'Profile photo could not be uploaded',
              messages: [
                'The employee will be saved without a photo. You can add the photo later by editing the employee record.',
                'Make sure the image is a JPEG or PNG file smaller than 10 MB.',
              ],
            });
            delete data.profilePicture;
          }
        } else {
          delete data.profilePicture;
        }
      } else {
        delete data.profilePicture;
      }

      // Strip empty / null fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== ''),
      );

      await employeesService.createEmployee(cleanedData);

      setBanner({
        type: 'success',
        title: '✓ Employee added successfully!',
        messages: ['The new employee record has been created. You will be redirected shortly…'],
      });

      setTimeout(() => {
        router.push('/employees');
        router.refresh();
      }, 1800);
    } catch (error: any) {
      const messages = parseApiErrors(error);
      setBanner({
        type: 'error',
        title: 'Could not save the employee — please fix the following:',
        messages,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push('/employees');

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
        <p className="text-gray-600 mt-2">Add a new employee to your organisation.</p>
      </div>

      {/* Status Banner */}
      {banner && <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />}

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <EmployeeForm onSubmit={handleSubmit} onCancel={handleCancel} />
        {saving && (
          <p className="text-sm text-gray-500 mt-3 text-center animate-pulse">Saving employee…</p>
        )}
      </div>
    </div>
  );
}
