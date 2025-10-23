'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePropertyStore } from '@/store/propertyStore';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Home,
  User,
  Filter,
  Loader2,
  Eye,
  Edit,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building,
} from 'lucide-react';
import { bookingsService, Booking, BookingFilters } from '@/services/bookings.service';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const { selectedProperties } = usePropertyStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 12,
    isActive: true,
    customerId: customerId || undefined,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, [filters, selectedProperties]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getBookings({
        ...filters,
        propertyId: selectedProperties.length > 0 ? selectedProperties[0] : undefined,
      } as any);
      setBookings(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await bookingsService.getStatistics();
      setStats(response);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return brandPalette.success;
      case 'PENDING':
        return brandPalette.accent;
      case 'CANCELLED':
        return '#EF4444';
      case 'COMPLETED':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      {/* Hero Section */}
      <BrandHero
        eyebrow="Property Bookings Management"
        title={
          <>
            Track every booking from{' '}
            <span style={{ color: brandPalette.accent }}>token to possession</span>
          </>
        }
        description="This is your central hub for managing all property bookings. Monitor booking status, payment progress, track agreements, manage home loans, and oversee the complete booking lifecycle from initial token to final possession."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/bookings/new')}>
              <Plus className="w-4 h-4" />
              New Booking
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/customers')}>
              <User className="w-4 h-4" />
              View Customers
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
              What is a Booking?
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              A <strong>booking</strong> represents a confirmed property purchase where a customer has paid a token amount and signed an agreement. This page tracks the complete journey from initial booking to final possession and registration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm text-gray-900">Payment Tracking</span>
                </div>
                <p className="text-xs text-gray-600">Monitor token, installments, and balance amounts</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm text-gray-900">Agreement Management</span>
                </div>
                <p className="text-xs text-gray-600">Track agreement signing and documentation</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm text-gray-900">Possession Dates</span>
                </div>
                <p className="text-xs text-gray-600">Expected vs actual possession timeline</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm text-gray-900">Home Loan Status</span>
                </div>
                <p className="text-xs text-gray-600">Track bank loans and approval status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <BrandStatCard
            title="Total Bookings"
            primary={formatIndianNumber(stats.total || 0)}
            subLabel={`${stats.confirmed || 0} confirmed bookings`}
            icon={<FileText className="w-8 h-8" />}
            accentColor={brandPalette.accent}
          />
          <BrandStatCard
            title="Total Revenue"
            primary={formatToCrore(stats.totalRevenue || 0)}
            subLabel="All-time booking value"
            icon={<TrendingUp className="w-8 h-8" />}
            accentColor="rgba(168, 33, 27, 0.18)"
          />
          <BrandStatCard
            title="Pending Amount"
            primary={formatToCrore(stats.totalPending || 0)}
            subLabel="Outstanding payments"
            icon={<Clock className="w-8 h-8" />}
            accentColor="rgba(61, 163, 93, 0.25)"
          />
          <BrandStatCard
            title="Completed"
            primary={formatIndianNumber(stats.completed || 0)}
            subLabel="Possession handed over"
            icon={<CheckCircle className="w-8 h-8" />}
            accentColor={brandPalette.neutral}
          />
        </section>
      )}

      {/* Filters Section */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking number, customer, or property..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <div className="flex gap-2">
            <BrandPrimaryButton onClick={() => router.push('/bookings/new')}>
              <Plus className="w-4 h-4" />
              New Booking
            </BrandPrimaryButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            title="Filter by booking status"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={filters.isHomeLoan === true ? 'true' : filters.isHomeLoan === false ? 'false' : ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                isHomeLoan: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            title="Filter by home loan"
          >
            <option value="">All Bookings</option>
            <option value="true">With Home Loan</option>
            <option value="false">Without Home Loan</option>
          </select>

          <input
            type="date"
            value={filters.bookingDateFrom || ''}
            onChange={(e) => setFilters({ ...filters, bookingDateFrom: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            placeholder="From Date"
            title="Filter from date"
          />

          <input
            type="date"
            value={filters.bookingDateTo || ''}
            onChange={(e) => setFilters({ ...filters, bookingDateTo: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            placeholder="To Date"
            title="Filter to date"
          />

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

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
            <p className="text-gray-600 text-sm">Loading bookings...</p>
          </div>
        </div>
      ) : (bookings || []).length === 0 ? (
        <div className="bg-white/90 rounded-3xl border p-12 text-center shadow-sm">
          <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.55 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            No Bookings Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.isHomeLoan !== undefined
              ? 'No bookings match your search criteria. Try adjusting your filters.'
              : 'Start by creating your first property booking.'}
          </p>
          <BrandPrimaryButton onClick={() => router.push('/bookings/new')}>
            <Plus className="w-4 h-4" />
            Create First Booking
          </BrandPrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {((bookings || [])).map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold" style={{ color: brandPalette.secondary }}>
                          {booking.bookingNumber}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${getStatusColor(booking.status)}15`,
                            color: getStatusColor(booking.status),
                          }}
                        >
                          {booking.status}
                        </span>
                        {booking.isHomeLoan && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Home Loan
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 text-xs">Customer</p>
                          <p className="font-medium">{booking.customer?.full_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">Property</p>
                          <p className="font-medium">{booking.property?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">Booking Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">Total Amount</p>
                          <p className="font-semibold text-lg" style={{ color: brandPalette.primary }}>
                            {formatAmount(booking.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Payment Progress */}
                    <div className="lg:w-80">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-600">Payment Progress</span>
                          <span className="text-xs font-semibold">
                            {((booking.paidAmount / booking.totalAmount) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${(booking.paidAmount / booking.totalAmount) * 100}%`,
                              backgroundColor: brandPalette.success,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <div>
                            <p className="text-gray-600">Paid</p>
                            <p className="font-semibold text-green-600">{formatAmount(booking.paidAmount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600">Balance</p>
                            <p className="font-semibold text-orange-600">{formatAmount(booking.balanceAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
                      style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                      title="View full booking details"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                      className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#FEF3E2]"
                      style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                      title="Edit booking information"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
