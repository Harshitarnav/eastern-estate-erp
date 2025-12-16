'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign,
  User,
  FileText,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react';
import { employeesService, Employee } from '@/services/employees.service';
import { rolesService, Role } from '@/services/roles.service';

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleName, setRoleName] = useState<string>('');

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeesService.getEmployee(employeeId);
      setEmployee(data);
      
      // Fetch role name if roleId exists
      const resolvedRoleId = (data as any)?.roleId || (data as any)?.role?.id;
      if (resolvedRoleId) {
        try {
          const role = await rolesService.getRole(resolvedRoleId);
          setRoleName(role.name);
        } catch (error) {
          console.error('Error fetching role:', error);
        }
      }

      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employee');
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'ON_LEAVE':
        return '#F59E0B';
      case 'SUSPENDED':
        return '#EF4444';
      case 'TERMINATED':
        return '#DC2626';
      case 'RESIGNED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: any = {
      MANAGEMENT: '#9333EA',
      SALES: '#10B981',
      MARKETING: '#F59E0B',
      OPERATIONS: '#3B82F6',
      FINANCE: '#EF4444',
      HR: '#8B5CF6',
      IT: '#06B6D4',
      CONSTRUCTION: '#F97316',
      CUSTOMER_SERVICE: '#14B8A6',
      LEGAL: '#64748B',
    };
    return colors[department] || '#6B7280';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    const amount = Number(value) || 0;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#A8211B' }}></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Employee not found'}
        </div>
        <button
          onClick={() => router.push('/employees')}
          className="mt-4 px-4 py-2 border rounded-lg"
          style={{ borderColor: '#A8211B', color: '#A8211B' }}
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Employees</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#7B1E12' }}>
              {employee.fullName}
            </h1>
            <p className="text-gray-600">{employee.employeeCode}</p>
          </div>
          <button
            onClick={() => router.push(`/employees/${employeeId}/edit`)}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Edit className="h-5 w-5" />
            <span>Edit Employee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Employee Code</label>
                <p className="font-semibold">{employee.employeeCode}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-semibold">{employee.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{employee.email || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{employee.phoneNumber}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">
                    {new Date(employee.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-semibold">{employee.gender}</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-500">Current Address</label>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <p className="font-semibold">{employee.currentAddress}</p>
              </div>
            </div>
          </div>

          {/* Employment Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>
              Employment Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <div
                  className="inline-block px-3 py-1 rounded-lg text-sm font-medium mt-1"
                  style={{
                    backgroundColor: `${getDepartmentColor(employee.department)}20`,
                    color: getDepartmentColor(employee.department),
                  }}
                >
                  {formatStatus(employee.department)}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Designation</label>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">{employee.designation}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Employment Type</label>
                <p className="font-semibold">{formatStatus(employee.employmentType)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Employment Status</label>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-1"
                  style={{
                    backgroundColor: `${getStatusColor(employee.employmentStatus)}20`,
                    color: getStatusColor(employee.employmentStatus),
                  }}
                >
                  {formatStatus(employee.employmentStatus)}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Joining Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {employee.reportingManagerName && (
                <div>
                  <label className="text-sm text-gray-500">Reporting Manager</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold">{employee.reportingManagerName}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">Assigned Role</label>
                {roleName ? (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div
                      className="inline-block px-3 py-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: '#8B5CF620',
                        color: '#8B5CF6',
                      }}
                    >
                      {roleName}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No role assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Salary Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>
              Salary Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Earnings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Basic Salary</span>
                    <span className="font-semibold">{formatCurrency(Number(employee.basicSalary))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">HRA</span>
                    <span className="font-semibold">{formatCurrency(Number(employee.houseRentAllowance))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transport</span>
                    <span className="font-semibold">{formatCurrency(Number(employee.transportAllowance))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Gross Salary</span>
                    <span className="font-bold text-lg" style={{ color: '#3DA35D' }}>
                      {formatCurrency(Number(employee.grossSalary))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Deductions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">PF</span>
                    <span className="font-semibold">{formatCurrency(Number(employee.pfDeduction))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="font-semibold">{formatCurrency(Number(employee.taxDeduction))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Net Salary</span>
                    <span className="font-bold text-lg" style={{ color: '#3DA35D' }}>
                      {formatCurrency(Number(employee.netSalary))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>
              Quick Stats
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Casual Leave</p>
                  <p className="text-2xl font-bold text-blue-700">{employee.casualLeaveBalance || 0}</p>
                </div>
                <Award className="h-8 w-8 text-blue-700" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Sick Leave</p>
                  <p className="text-2xl font-bold text-green-700">{employee.sickLeaveBalance || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-700" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Earned Leave</p>
                  <p className="text-2xl font-bold text-purple-700">{employee.earnedLeaveBalance || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>
              Attendance Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Present</span>
                <span className="font-semibold text-green-600">{employee.totalPresent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Absent</span>
                <span className="font-semibold text-red-600">{employee.totalAbsent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Late Arrival</span>
                <span className="font-semibold text-orange-600">{employee.totalLateArrival || 0}</span>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          {employee.bankName && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>
                Bank Details
              </h2>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Bank Name</label>
                  <p className="font-semibold">{employee.bankName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Account Number</label>
                  <p className="font-semibold">{employee.bankAccountNumber}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">IFSC Code</label>
                  <p className="font-semibold">{employee.ifscCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
