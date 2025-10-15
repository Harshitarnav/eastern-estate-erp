'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Calendar, IndianRupee, User, Building, Eye, Edit, Trash2, XCircle } from 'lucide-react';
import { bookingsService, Booking, BookingFilters } from '@/services/bookings.service';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({
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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getBookings(filters);
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

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleDelete = async (id: string, bookingNumber: string) => {
    if (!confirm(`Are you sure you want to delete booking "${bookingNumber}"?`)) {
      return;
    }

    try {
      await bookingsService.deleteBooking(id);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleCancel = async (id: string, bookingNumber: string) => {
    const reason = prompt(`Enter cancellation reason for booking "${bookingNumber}":`);
    if (!reason) return;

    const refundAmountStr = prompt('Enter refund amount (or leave blank):');
    const refundAmount = refundAmountStr ? parseFloat(refundAmountStr) : undefined;

    try {
      await bookingsService.cancelBooking(id, reason, refundAmount);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TOKEN_PAID':
        return '#3B82F6';
      case 'AGREEMENT_PENDING':
        return '#F2C94C';
      case 'AGREEMENT_SIGNED':
        return '#8B5CF6';
      case 'CONFIRMED':
        return '#3DA35D';
      case 'COMPLETED':
        return '#10B981';
      case 'CANCELLED':
        return '#EF4444';
      case 'TRANSFERRED':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#3DA35D';
      case 'PARTIAL':
        return '#F2C94C';
      case 'OVERDUE':
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

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Bookings
          </h1>
        </div>
        <p className="text-gray-600">
          Manage property bookings, track payments, and monitor agreements.
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
                placeholder="Search bookings..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="TOKEN_PAID">Token Paid</option>
            <option value="AGREEMENT_PENDING">Agreement Pending</option>
            <option value="AGREEMENT_SIGNED">Agreement Signed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>

          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <select
            value={filters.isHomeLoan === true ? 'true' : filters.isHomeLoan === false ? 'false' : ''}
            onChange={(e) => setFilters({ ...filters, isHomeLoan: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Types</option>
            <option value="true">With Home Loan</option>
            <option value="false">Without Loan</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/bookings/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>New Booking</span>
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
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Bookings Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.paymentStatus
              ? 'No bookings match your search criteria.'
              : 'Start by creating your first property booking.'}
          </p>
          <button
            onClick={() => router.push('/bookings/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Create First Booking</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                        {booking.bookingNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(booking.status)}20`,
                        color: getStatusColor(booking.status),
                      }}
                    >
                      {formatStatus(booking.status)}
                    </div>
                    <div
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getPaymentStatusColor(booking.paymentStatus)}20`,
                        color: getPaymentStatusColor(booking.paymentStatus),
                      }}
                    >
                      {formatStatus(booking.paymentStatus)}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {booking.customer && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="h-4 w-4" />
                      <span>{booking.customer.firstName} {booking.customer.lastName}</span>
                    </div>
                  )}
                  {booking.flat && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Building className="h-4 w-4" />
                      <span>{booking.flat.flatNumber} - {booking.flat.configuration}</span>
                    </div>
                  )}

                  <div className="mb-3 pb-3 border-b">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Total Amount</span>
                      <span className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                        {formatAmount(booking.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Paid</span>
                      <span className="text-sm font-semibold" style={{ color: '#3DA35D' }}>
                        {formatAmount(booking.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Balance</span>
                      <span className="text-sm font-semibold" style={{ color: '#F2C94C' }}>
                        {formatAmount(booking.balanceAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Payment Progress</span>
                      <span className="text-xs font-semibold">
                        {((booking.paidAmount / booking.totalAmount) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(booking.paidAmount / booking.totalAmount) * 100}%`,
                          backgroundColor: '#3DA35D',
                        }}
                      />
                    </div>
                  </div>

                  {booking.isHomeLoan && (
                    <div className="mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Home Loan: {booking.bankName || 'Applied'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`View booking: ${booking.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => alert(`Edit booking: ${booking.id}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#F2C94C', color: '#7B1E12' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {booking.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(booking.id, booking.bookingNumber)}
                        className="px-3 py-2 border border-orange-300 text-orange-600 rounded-lg text-sm font-medium transition-colors hover:bg-orange-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(booking.id, booking.bookingNumber)}
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
