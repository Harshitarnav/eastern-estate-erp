'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Shield,
  Edit,
  Trash2,
  Eye,
  Award,
  Loader2,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { customersService, Customer, CustomerFilters } from '@/services/customers.service';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';

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

  const stats = useMemo(() => {
    const total = meta.total || customers.length;
    const verified = customers.filter((customer) => customer.kycStatus === 'VERIFIED').length;
    const vip = customers.filter((customer) => customer.isVIP).length;
    const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0);
    const avgValue =
      customers.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0) /
      (customers.length || 1);

    return {
      total,
      verified,
      vip,
      totalSpent,
      avgValue,
      verificationRate: total > 0 ? (verified / total) * 100 : 0,
    };
  }, [customers, meta.total]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate customer "${name}"?\n\nThis will mark the customer as inactive but preserve all their booking history and data.`)) {
      return;
    }

    try {
      await customersService.deleteCustomer(id);
      alert(`Customer "${name}" has been successfully deactivated.`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate customer');
    }
  };

  const getKYCColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return brandPalette.success;
      case 'IN_PROGRESS':
        return brandPalette.accent;
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
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      {/* Hero Section with Clear Purpose */}
      <BrandHero
        eyebrow="Customer Management Hub"
        title={
          <>
            Your verified customers are your{' '}
            <span style={{ color: brandPalette.accent }}>greatest assets</span>
          </>
        }
        description="This is your central hub for managing all verified customers who have completed bookings or purchases. Track KYC verification status, monitor lifetime value, identify VIP relationships, and maintain complete customer intelligence for your sales and CRM teams."
        actions={
          <>
            <BrandPrimaryButton 
              onClick={() => router.push('/customers/new')}
              title="Add a new verified customer to the database"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </BrandPrimaryButton>
            <BrandSecondaryButton 
              onClick={() => router.push('/leads')}
              title="View potential leads who haven't converted yet"
            >
              <Users className="w-4 h-4" />
              View Leads
            </BrandSecondaryButton>
          </>
        }
      />

      {/* Purpose Explanation Card */}
      <div
        className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm"
        style={{ borderColor: `${brandPalette.accent}40` }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${brandPalette.accent}20` }}
          >
            <AlertCircle className="w-6 h-6" style={{ color: brandPalette.accent }} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2" style={{ color: brandPalette.secondary }}>
              Why This Page Exists
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              <strong>Customers vs Leads:</strong> This page shows <strong>verified customers</strong> who have completed bookings or purchases. 
              These are different from <strong>leads</strong> (potential customers still in the sales pipeline).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm text-gray-900">Track KYC Status</span>
                </div>
                <p className="text-xs text-gray-600">Monitor verification progress for compliance and trust-building</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm text-gray-900">Monitor Lifetime Value</span>
                </div>
                <p className="text-xs text-gray-600">Track total revenue and bookings per customer relationship</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm text-gray-900">Identify VIP Customers</span>
                </div>
                <p className="text-xs text-gray-600">Recognize and prioritize high-value customer relationships</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Customers"
          primary={formatIndianNumber(stats.total)}
          subLabel={`${stats.verificationRate.toFixed(1)}% KYC verified`}
          icon={<UserCheck className="w-8 h-8" />}
          accentColor={brandPalette.accent}
        />
        <BrandStatCard
          title="KYC Verified"
          primary={formatIndianNumber(stats.verified)}
          subLabel={`${formatIndianNumber(stats.vip)} VIP relationships`}
          icon={<Shield className="w-8 h-8" />}
          accentColor="rgba(61, 163, 93, 0.25)"
        />
        <BrandStatCard
          title="Total Revenue"
          primary={formatToCrore(stats.totalSpent)}
          subLabel="Lifetime booking value"
          icon={<Award className="w-8 h-8" />}
          accentColor="rgba(168, 33, 27, 0.18)"
        />
        <BrandStatCard
          title="Average Value"
          primary={formatAmount(stats.avgValue || 0)}
          subLabel="Per active customer"
          icon={<Phone className="w-8 h-8" />}
          accentColor={brandPalette.neutral}
        />
      </section>

      {/* Search and Filter Section */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <BrandPrimaryButton 
            onClick={() => router.push('/customers/new')}
            title="Create a new customer record"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </BrandPrimaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            title="Filter by customer type"
          >
            <option value="">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="CORPORATE">Corporate</option>
            <option value="NRI">NRI</option>
          </select>

          <select
            value={filters.kycStatus || ''}
            onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            title="Filter by KYC verification status"
          >
            <option value="">All KYC Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={
              filters.isVIP === true ? 'true' : filters.isVIP === false ? 'false' : ''
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                isVIP:
                  e.target.value === ''
                    ? undefined
                    : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            title="Filter by VIP status"
          >
            <option value="">All Customers</option>
            <option value="true">VIP Only</option>
            <option value="false">Regular</option>
          </select>

          <button
            onClick={() => setFilters({ page: 1, limit: 12, isActive: true })}
            className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(168, 33, 27, 0.25)',
            backgroundColor: 'rgba(168, 33, 27, 0.08)',
            color: brandPalette.primary,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
            <p className="text-gray-600 text-sm">Loading customers...</p>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white/90 rounded-3xl border p-12 text-center shadow-sm">
          <UserCheck className="h-16 w-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.55 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            No Customers Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.type || filters.kycStatus || filters.isVIP !== undefined
              ? 'No customers match your search criteria. Try adjusting your filters.'
              : 'Start by adding verified customers to your database.'}
          </p>
          <BrandPrimaryButton onClick={() => router.push('/customers/new')}>
            <Plus className="w-4 h-4" />
            Add Your First Customer
          </BrandPrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: `${brandPalette.neutral}80` }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate" style={{ color: brandPalette.secondary }}>
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      {customer.type}
                    </p>
                  </div>
                  {customer.isVIP && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
                      VIP
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2 truncate">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </span>
                    <span className="flex items-center gap-2 truncate">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </span>
                  </div>

                  <div className="border rounded-xl p-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Lifetime Value</p>
                      <p className="text-lg font-semibold" style={{ color: brandPalette.secondary }}>
                        {formatAmount(customer.totalSpent || 0)}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: `${getKYCColor(customer.kycStatus)}15`,
                        color: getKYCColor(customer.kycStatus),
                      }}
                    >
                      {customer.kycStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:bg-[#F9F7F3]"
                      style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                      title="View full customer details"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/customers/${customer.id}/edit`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#FEF3E2]"
                      style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                      title="Edit customer information"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, `${customer.firstName} ${customer.lastName}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                      title="Deactivate customer (preserves history)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) === 1}
                className="px-4 py-2 border rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                title="Go to previous page"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: Math.min(meta.totalPages, (filters.page || 1) + 1) })
                }
                disabled={(filters.page || 1) === meta.totalPages}
                className="px-4 py-2 border rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                title="Go to next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="pt-6 text-center text-sm text-gray-500">
        Eastern Estate ERP • Building Homes, Nurturing Bonds
      </div>
    </div>
  );
}
