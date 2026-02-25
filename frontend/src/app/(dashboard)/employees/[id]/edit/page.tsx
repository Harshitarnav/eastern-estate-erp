'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { employeesService, Employee } from '@/services/employees.service';
import uploadService from '@/services/upload.service';
import EmployeeForm from '@/components/forms/EmployeeForm';
import {
  parseApiErrors,
  StatusBanner,
  type Banner,
} from '../../_utils/employeeErrorUtils';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employeeId) fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const employee: Employee = await employeesService.getEmployee(employeeId);

      setInitialData({
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email || '',
        phoneNumber: employee.phoneNumber,
        alternatePhone: employee.alternatePhone || '',
        profilePicture: employee.profilePicture || '',
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
        gender: employee.gender,
        bloodGroup: employee.bloodGroup || '',
        maritalStatus: employee.maritalStatus || '',
        currentAddress: employee.currentAddress,
        permanentAddress: employee.permanentAddress || '',
        city: employee.city || '',
        state: employee.state || '',
        pincode: employee.pincode || '',
        department: employee.department,
        designation: employee.designation,
        employmentType: employee.employmentType,
        employmentStatus: employee.employmentStatus,
        joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
        confirmationDate: employee.confirmationDate ? employee.confirmationDate.split('T')[0] : '',
        resignationDate: employee.resignationDate ? employee.resignationDate.split('T')[0] : '',
        lastWorkingDate: employee.lastWorkingDate ? employee.lastWorkingDate.split('T')[0] : '',
        reportingManagerName: employee.reportingManagerName || '',
        basicSalary: employee.basicSalary ?? 0,
        houseRentAllowance: employee.houseRentAllowance ?? 0,
        transportAllowance: employee.transportAllowance ?? 0,
        medicalAllowance: employee.medicalAllowance || 0,
        otherAllowances: employee.otherAllowances || 0,
        grossSalary: employee.grossSalary ?? 0,
        pfDeduction: employee.pfDeduction || 0,
        esiDeduction: employee.esiDeduction || 0,
        taxDeduction: employee.taxDeduction || 0,
        otherDeductions: employee.otherDeductions || 0,
        netSalary: employee.netSalary ?? 0,
        bankName: employee.bankName || '',
        bankAccountNumber: employee.bankAccountNumber || '',
        ifscCode: employee.ifscCode || '',
        branchName: employee.branchName || '',
        aadharNumber: employee.aadharNumber || '',
        panNumber: employee.panNumber || '',
        pfNumber: employee.pfNumber || '',
        esiNumber: employee.esiNumber || '',
        uanNumber: employee.uanNumber || '',
        emergencyContactName: employee.emergencyContactName || '',
        emergencyContactPhone: employee.emergencyContactPhone || '',
        emergencyContactRelation: employee.emergencyContactRelation || '',
        casualLeaveBalance: employee.casualLeaveBalance || 0,
        sickLeaveBalance: employee.sickLeaveBalance || 0,
        earnedLeaveBalance: employee.earnedLeaveBalance || 0,
        leaveTaken: employee.leaveTaken || 0,
        totalPresent: employee.totalPresent || 0,
        totalAbsent: employee.totalAbsent || 0,
        totalLateArrival: employee.totalLateArrival || 0,
        skills: employee.skills || '',
        qualifications: employee.qualifications || '',
        experience: employee.experience || '',
        performanceRating: employee.performanceRating || '',
        notes: employee.notes || '',
      });
    } catch (error: any) {
      setBanner({
        type: 'error',
        title: 'Could not load the employee record',
        messages: [
          'The employee details could not be fetched. Please check your connection and try again.',
          'If the problem persists, the record may have been deleted.',
        ],
      });
      setInitialLoading(false);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setBanner(null);
    setSaving(true);

    try {
      // Handle profile picture changes
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
                'The employee will be saved with the existing photo.',
                'Make sure the new image is a JPEG or PNG file smaller than 10 MB, then try updating again.',
              ],
            });
            // Fall back to existing photo
            data.profilePicture = initialData?.profilePicture || '';
          }
        }
      } else if (!data.profilePicture || data.profilePicture === '') {
        // Keep the existing photo if the user didn't pick a new one
        data.profilePicture = initialData?.profilePicture || '';
      }
      // (if it's already a URL string, leave it as-is)

      // Strip empty / null fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== ''),
      );

      await employeesService.updateEmployee(employeeId, cleanedData);

      setBanner({
        type: 'success',
        title: '✓ Employee record updated successfully!',
        messages: ['All changes have been saved. You will be redirected shortly…'],
      });

      setTimeout(() => {
        router.push(`/employees/${employeeId}`);
        router.refresh();
      }, 1800);
    } catch (error: any) {
      const messages = parseApiErrors(error);
      setBanner({
        type: 'error',
        title: 'Could not save changes — please fix the following:',
        messages,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push(`/employees/${employeeId}`);

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#A8211B' }} />
      </div>
    );
  }

  // Failed to load
  if (!initialData) {
    return (
      <div className="p-6">
        {banner && <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />}
        <button
          onClick={() => router.push('/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mt-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Employees</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Employee Details</span>
      </button>

      <h1 className="text-3xl font-bold mb-6" style={{ color: '#7B1E12' }}>
        Edit Employee
      </h1>

      {/* Status Banner */}
      {banner && <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />}

      <div className="bg-white rounded-lg shadow-md p-6">
        <EmployeeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
        {saving && (
          <p className="text-sm text-gray-500 mt-3 text-center animate-pulse">Saving changes…</p>
        )}
      </div>
    </div>
  );
}
