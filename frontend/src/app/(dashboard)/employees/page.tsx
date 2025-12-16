'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Search, Mail, Phone, Briefcase, UserCog, Shield } from 'lucide-react';
import { employeesService, Employee, EmployeeFilters } from '@/services/employees.service';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<EmployeeFilters>({
    page: 1,
    limit: 12,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesService.getEmployees(filters);
      setEmployees(response.data || []);
      setMeta(response.meta || { total: 0, page: 1, limit: 12, totalPages: 0 });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
      setEmployees([]);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
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

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    const amount = Number(value) || 0;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Employees
          </h1>
        </div>
        <p className="text-gray-600">
          Manage employee information, attendance, and payroll.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.department || ''}
            onChange={(e) => setFilters({ ...filters, department: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Departments</option>
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

          <select
            value={filters.employmentStatus || ''}
            onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
            <option value="RESIGNED">Resigned</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/users')}
            className="px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ borderColor: '#A8211B', color: '#A8211B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <UserCog className="h-5 w-5" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => router.push('/roles')}
            className="px-4 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ borderColor: '#A8211B', color: '#A8211B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Shield className="h-5 w-5" />
            <span>View Roles</span>
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/employees/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        </div>
      ) : (employees || []).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Employees Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.department || filters.employmentStatus
              ? 'No employees match your search criteria.'
              : 'Start by adding your first employee.'}
          </p>
          <button
            onClick={() => router.push('/employees/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Add First Employee</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {((employees || [])).map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1" style={{ color: '#7B1E12' }}>
                        {employee.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.employeeCode}</p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(employee.employmentStatus)}20`,
                        color: getStatusColor(employee.employmentStatus),
                      }}
                    >
                      {formatStatus(employee.employmentStatus)}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <div
                      className="inline-block px-3 py-1 rounded-lg text-sm font-medium mb-3"
                      style={{
                        backgroundColor: `${getDepartmentColor(employee.department)}20`,
                        color: getDepartmentColor(employee.department),
                      }}
                    >
                      {formatStatus(employee.department)}
                    </div>
                    <p className="text-base font-semibold text-gray-800">{employee.designation}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    {employee.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{employee.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{formatStatus(employee.employmentType)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Gross Salary</p>
                        <p className="font-bold" style={{ color: '#3DA35D' }}>
                          {formatCurrency(employee.grossSalary)}/mo
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Joining Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(employee.joiningDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(employee.casualLeaveBalance !== undefined || employee.sickLeaveBalance !== undefined) && (
                    <div className="pt-3 border-t mt-3">
                      <p className="text-xs text-gray-500 mb-1">Leave Balance</p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          CL: {employee.casualLeaveBalance || 0}
                        </span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                          SL: {employee.sickLeaveBalance || 0}
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                          EL: {employee.earnedLeaveBalance || 0}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => router.push(`/employees/${employee.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3E2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(meta.totalPages, (filters.page || 1) + 1) })}
                disabled={(filters.page || 1) === meta.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#A8211B', color: '#A8211B' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Eastern Estate ERP • Building Homes, Nurturing Bonds
        </p>
      </div>
    </div>
  );
}
