'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndianRupee, Plus, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { paymentsService, Payment, PaymentFilters } from '@/services/payments.service';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<PaymentFilters>({
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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsService.getPayments(filters);
      setPayments(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const handleDelete = async (id: string, paymentNumber: string) => {
    if (!confirm(`Are you sure you want to delete payment "${paymentNumber}"?`)) {
      return;
    }

    try {
      await paymentsService.deletePayment(id);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await paymentsService.verifyPayment(id, 'current-user-id'); // Replace with actual user ID
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return '#10B981';
      case 'RECEIVED':
        return '#3B82F6';
      case 'PENDING':
        return '#F2C94C';
      case 'BOUNCED':
        return '#EF4444';
      case 'CANCELLED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'CASH':
        return '💵';
      case 'CHEQUE':
        return '📝';
      case 'UPI':
        return '📱';
      case 'BANK_TRANSFER':
      case 'RTGS':
      case 'NEFT':
      case 'IMPS':
        return '🏦';
      case 'CARD':
        return '💳';
      case 'ONLINE':
        return '🌐';
      default:
        return '💰';
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
          <IndianRupee className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Payments
          </h1>
        </div>
        <p className="text-gray-600">
          Track all payment transactions, receipts, and verification status.
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
                placeholder="Search payments..."
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
            <option value="PENDING">Pending</option>
            <option value="RECEIVED">Received</option>
            <option value="CLEARED">Cleared</option>
            <option value="BOUNCED">Bounced</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={filters.paymentMode || ''}
            onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Modes</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>

          <select
            value={filters.isVerified === true ? 'true' : filters.isVerified === false ? 'false' : ''}
            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Payments</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/payments/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Record Payment</span>
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
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <IndianRupee className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Payments Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.paymentMode
              ? 'No payments match your search criteria.'
              : 'Start by recording your first payment transaction.'}
          </p>
          <button
            onClick={() => router.push('/payments/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Record First Payment</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                        {payment.paymentNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-2xl">{getPaymentModeIcon(payment.paymentMode)}</span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(payment.status)}20`,
                        color: getStatusColor(payment.status),
                      }}
                    >
                      {formatStatus(payment.status)}
                    </div>
                    {payment.isVerified ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {payment.customer && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Customer:</strong> {payment.customer.firstName} {payment.customer.lastName}
                    </div>
                  )}

                  <div className="mb-3 pb-3 border-b">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Amount</span>
                      <span className="text-xl font-bold" style={{ color: '#7B1E12' }}>
                        {formatAmount(payment.amount)}
                      </span>
                    </div>
                    {payment.netAmount !== payment.amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Net Amount</span>
                        <span className="text-sm font-semibold" style={{ color: '#3DA35D' }}>
                          {formatAmount(payment.netAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {payment.chequeNumber && (
                    <div className="text-xs text-gray-600 mb-2">
                      Cheque: {payment.chequeNumber}
                    </div>
                  )}
                  {payment.transactionId && (
                    <div className="text-xs text-gray-600 mb-2">
                      TXN: {payment.transactionId}
                    </div>
                  )}
                  {payment.upiId && (
                    <div className="text-xs text-gray-600 mb-2">
                      UPI: {payment.upiId}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {!payment.isVerified && payment.status === 'RECEIVED' && (
                      <button
                        onClick={() => handleVerify(payment.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Verify</span>
                      </button>
                    )}
                    <button
                      onClick={() => alert(`View payment: ${payment.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id, payment.paymentNumber)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
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
