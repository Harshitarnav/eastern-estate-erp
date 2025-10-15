'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Plus, Search, Phone, Mail, Shield, Edit, Trash2, Eye, Award } from 'lucide-react';
import { customersService, Customer, CustomerFilters } from '@/services/customers.service';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 12,
    isActive: true,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersService.getCustomers(filters);
      setCustomers(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return;
    }

    try {
      await customersService.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const getKYCColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return '#3DA35D';
      case 'IN_PROGRESS':
        return '#F2C94C';
      case 'REJECTED':
        return '#EF4444';
      case 'PENDING':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <UserCheck className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Customers
          </h1>
        </div>
        <p className="text-gray-600">
          Manage verified customers, KYC documentation, and purchase history.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="CORPORATE">Corporate</option>
            <option value="NRI">NRI</option>
          </select>

          <select
            value={filters.kycStatus || ''}
            onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All KYC Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={filters.isVIP === true ? 'true' : filters.isVIP === false ? 'false' : ''}
            onChange={(e) => setFilters({ ...filters, isVIP: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Customers</option>
            <option value="true">VIP Only</option>
            <option value="false">Regular</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/customers/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
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
            <p className="text-gray-600">Loading customers...</p>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UserCheck className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Customers Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.type || filters.kycStatus
              ? 'No customers match your search criteria.'
              : 'Start by adding verified customers to your database.'}
          </p>
          <button
            onClick={() => router.push('/customers/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Customer</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{customer.type}</p>
                    </div>
                    {customer.isVIP && (
                      <Award className="h-5 w-5" style={{ color: '#F2C94C' }} />
                    )}
                  </div>
                  <div
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getKYCColor(customer.kycStatus)}20`,
                      color: getKYCColor(customer.kycStatus),
                    }}
                  >
                    <Shield className="h-3 w-3 inline mr-1" />
                    KYC: {customer.kycStatus}
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.city && (
                      <p className="text-sm text-gray-500">{customer.city}</p>
                    )}
                  </div>

                  <div className="mb-3 pb-3 border-b">
                    <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                    <p className="text-lg font-bold" style={{ color: '#3DA35D' }}>
                      {formatAmount(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.totalPurchases} purchase{customer.totalPurchases !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {customer.needsHomeLoan && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Loan
                      </span>
                    )}
                    {customer.hasApprovedLoan && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        Approved
                      </span>
                    )}
                    {customer.totalBookings > 0 && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {customer.totalBookings} Booking{customer.totalBookings > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`View customer: ${customer.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => alert(`Edit customer: ${customer.id}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#F2C94C', color: '#7B1E12' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, `${customer.firstName} ${customer.lastName}`)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
