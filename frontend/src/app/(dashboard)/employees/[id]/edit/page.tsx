'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { employeesService, Employee } from '@/services/employees.service';
import { rolesService, Role } from '@/services/roles.service';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
      fetchRoles();
    }
  }, [employeeId]);

  const fetchRoles = async () => {
    try {
      const rolesData = await rolesService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchEmployee = async () => {
    try {
      const employee = await employeesService.getEmployee(employeeId);
      setFormData({
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email || '',
        phoneNumber: employee.phoneNumber,
        alternatePhone: employee.alternatePhone || '',
        dateOfBirth: employee.dateOfBirth.split('T')[0],
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
        joiningDate: employee.joiningDate.split('T')[0],
        basicSalary: employee.basicSalary,
        houseRentAllowance: employee.houseRentAllowance,
        transportAllowance: employee.transportAllowance,
        medicalAllowance: employee.medicalAllowance || 0,
        grossSalary: employee.grossSalary,
        netSalary: employee.netSalary,
        bankName: employee.bankName || '',
        bankAccountNumber: employee.bankAccountNumber || '',
        ifscCode: employee.ifscCode || '',
        branchName: employee.branchName || '',
        aadharNumber: employee.aadharNumber || '',
        panNumber: employee.panNumber || '',
        roleId: employee.roleId || '',
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      alert('Failed to load employee data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await employeesService.updateEmployee(employeeId, formData);
      alert('Employee updated successfully!');
      router.push(`/employees/${employeeId}`);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      alert(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#A8211B' }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push(`/employees/${employeeId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Employee Details</span>
      </button>

      <h1 className="text-3xl font-bold mb-6" style={{ color: '#7B1E12' }}>
        Edit Employee
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee Code *</label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender *</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Current Address *</label>
            <textarea
              name="currentAddress"
              value={formData.currentAddress || ''}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department *</label>
              <select
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Department</option>
                <option value="MANAGEMENT">Management</option>
                <option value="SALES">Sales</option>
                <option value="MARKETING">Marketing</option>
                <option value="OPERATIONS">Operations</option>
                <option value="FINANCE">Finance</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="CUSTOMER_SERVICE">Customer Service</option>
                <option value="LEGAL">Legal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employment Type *</label>
              <select
                name="employmentType"
                value={formData.employmentType || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Type</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
                <option value="CONSULTANT">Consultant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employment Status *</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
                <option value="RESIGNED">Resigned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assigned Role</label>
              <select
                name="roleId"
                value={formData.roleId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">No Role Assigned</option>
                {((roles || [])).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Assign a role to define employee's access permissions
              </p>
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>Salary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Basic Salary *</label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">House Rent Allowance</label>
              <input
                type="number"
                name="houseRentAllowance"
                value={formData.houseRentAllowance || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Transport Allowance</label>
              <input
                type="number"
                name="transportAllowance"
                value={formData.transportAllowance || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Medical Allowance</label>
              <input
                type="number"
                name="medicalAllowance"
                value={formData.medicalAllowance || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push(`/employees/${employeeId}`)}
            className="px-6 py-2 border rounded-lg"
            style={{ borderColor: '#A8211B', color: '#A8211B' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
