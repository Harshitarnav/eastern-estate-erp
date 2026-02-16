'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { employeesService, Employee } from '@/services/employees.service';
import uploadService from '@/services/upload.service';
import EmployeeForm from '@/components/forms/EmployeeForm';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const employee = await employeesService.getEmployee(employeeId);
      
      // Format the data for the form
      const formattedData = {
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
      };
      
      setInitialData(formattedData);
    } catch (error) {
      console.error('Error fetching employee:', error);
      alert('Failed to load employee data');
      router.push('/employees');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      console.log('📝 Edit Employee - Form data received:', data.profilePicture);
      
      // Handle profile picture upload if present
      if (data.profilePicture && Array.isArray(data.profilePicture) && data.profilePicture.length > 0) {
        const file = data.profilePicture[0];
        if (file instanceof File) {
          try {
            console.log('📤 Uploading new profile picture:', file.name, 'Size:', file.size);
            const uploadResponse = await uploadService.uploadFile(file, 'employee-profiles');
            console.log('📦 Upload response received:', uploadResponse);
            
            // Extract the URL from the response object
            if (uploadResponse && uploadResponse.url) {
              data.profilePicture = uploadResponse.url;
              console.log('✅ Upload successful! URL:', data.profilePicture);
            } else {
              throw new Error('Upload response missing URL');
            }
          } catch (uploadError: any) {
            console.error('❌ Error uploading profile picture:', uploadError);
            const errorMessage = uploadError?.message || 'Unknown error';
            alert(`Failed to upload profile picture: ${errorMessage}. Employee will be updated without changing the photo.`);
            // Keep the existing profile picture URL
            data.profilePicture = initialData.profilePicture;
          }
        }
      } else if (!data.profilePicture || data.profilePicture === '') {
        // If profilePicture is empty, keep the existing one
        console.log('🔄 No new picture uploaded, keeping existing:', initialData.profilePicture);
        data.profilePicture = initialData.profilePicture;
      } else if (typeof data.profilePicture === 'string') {
        // If it's already a URL string, keep it
        console.log('🔗 Profile picture is already a URL:', data.profilePicture);
      }

      // Clean up the data - remove any empty or invalid fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => {
          // Keep the value if it's not null, undefined, or empty string
          // But keep 0 and false as valid values
          return value !== null && value !== undefined && value !== '';
        })
      );

      console.log('💾 Saving employee with profilePicture:', cleanedData.profilePicture);
      const updatedEmployee = await employeesService.updateEmployee(employeeId, cleanedData);
      console.log('✅ Employee updated:', updatedEmployee);
      
      alert('Employee updated successfully!');
      // Use router.push with refresh to ensure data is reloaded
      router.push(`/employees/${employeeId}`);
      router.refresh();
    } catch (error: any) {
      console.error('❌ Error updating employee:', error);
      alert(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleCancel = () => {
    router.push(`/employees/${employeeId}`);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#A8211B' }}></div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load employee data</p>
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <EmployeeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
