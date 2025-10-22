'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IndianRupee,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { paymentsService, Payment, PaymentFilters } from '@/services/payments.service';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';

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

  const stats = useMemo(() => {
    const total = meta.total || (payments || []).length;
    const verified = ((payments || [])).filter((payment) => payment.isVerified).length;
    const pending = ((payments || [])).filter((payment) => payment.status === 'PENDING').length;
    const totalAmount = ((payments || [])).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const outstandingAmount = ((payments || [])).reduce(
      (sum, payment: any) => sum + Number(payment?.balanceAmount ?? 0),
      0,
    );
    const averageAmount =
      ((payments || [])).reduce((sum, payment) => sum + Number(payment.amount || 0), 0) /
      ((payments || []).length || 1);
    return {
      total,
      verified,
      pending,
      totalAmount,
      outstandingAmount,
      averageAmount,
      verificationRate: total > 0 ? (verified / total) * 100 : 0,
    };
  }, [payments, meta.total]);

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
      await paymentsService.verifyPayment(id, 'current-user-id'); // TODO: inject actual user ID
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return brandPalette.success;
      case 'RECEIVED':
        return '#3B82F6';
      case 'PENDING':
        return brandPalette.accent;
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

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      <BrandHero
        eyebrow="Cashflow Command Center"
        title={
          <>
            Every rupee tracked with{' '}
            <span style={{ color: brandPalette.accent }}>Eastern precision</span>
          </>
        }
        description="Review incoming receipts, pending clearances, and verification status to keep project finances transparent for stakeholders."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/payments/new')}>
              <Plus className="w-4 h-4" />
              Record Payment
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/accounting')}>
              Accounting Dashboard
            </BrandSecondaryButton>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Transactions"
          primary={formatIndianNumber(stats.total)}
          subLabel={`${stats.verificationRate.toFixed(1)}% verified`}
          icon={<IndianRupee className="w-8 h-8" />}
          accentColor={brandPalette.accent}
        />
        <BrandStatCard
          title="Value Received"
          primary={formatToCrore(stats.totalAmount)}
          subLabel="Cumulative collection"
          icon={<CheckCircle className="w-8 h-8" />}
          accentColor="rgba(61, 163, 93, 0.25)"
        />
        <BrandStatCard
          title="Outstanding"
          primary={formatToCrore(stats.outstandingAmount)}
          subLabel={`${formatIndianNumber(stats.pending)} payments pending`}
          icon={<Clock className="w-8 h-8" />}
          accentColor="rgba(168, 33, 27, 0.18)"
        />
        <BrandStatCard
          title="Average Ticket"
          primary={formatAmount(stats.averageAmount || 0)}
          subLabel="Across current selection"
          icon={<AlertCircle className="w-8 h-8" />}
          accentColor={brandPalette.neutral}
        />
      </section>

      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <BrandPrimaryButton onClick={() => router.push('/payments/new')}>
            <Plus className="w-4 h-4" />
            Record Payment
          </BrandPrimaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
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
            onChange={(e) =>
              setFilters({ ...filters, paymentMode: e.target.value || undefined, page: 1 })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
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
            value={
              filters.isVerified === true ? 'true' : filters.isVerified === false ? 'false' : ''
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                isVerified:
                  e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
          >
            <option value="">All Payments</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
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
            <p className="text-gray-600 text-sm">Loading payments...</p>
          </div>
        </div>
      ) : (payments || []).length === 0 ? (
        <div className="bg-white/90 rounded-3xl border p-12 text-center shadow-sm">
          <IndianRupee className="h-16 w-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.55 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            No Payments Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.paymentMode || filters.isVerified !== undefined
              ? 'No payments match your search criteria. Try adjusting your filters.'
              : 'Record your first payment to start tracking cashflow.'}
          </p>
          <BrandPrimaryButton onClick={() => router.push('/payments/new')}>
            <Plus className="w-4 h-4" />
            Record Payment
          </BrandPrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {((payments || [])).map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: `${brandPalette.neutral}80` }}
                >
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: brandPalette.secondary }}>
                      {payment.paymentNumber}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      {payment.paymentMode?.replace(/_/g, ' ') || 'N/A'} {payment.paymentMode && getPaymentModeIcon(payment.paymentMode)}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${getStatusColor(payment.status)}15`,
                      color: getStatusColor(payment.status),
                    }}
                  >
                    {formatStatus(payment.status)}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="border rounded-xl p-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-semibold" style={{ color: brandPalette.success }}>
                        {formatAmount(payment.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="text-sm font-semibold" style={{ color: brandPalette.secondary }}>
                        {formatAmount((payment as any)?.balanceAmount ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                        : '—'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {(payment as any)?.dueDate
                        ? new Date((payment as any).dueDate).toLocaleDateString('en-IN')
                        : 'No due date'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/payments/${payment.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:bg-[#F9F7F3]"
                      style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/payments/${payment.id}/edit`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#FEF3E2]"
                      style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id, payment.paymentNumber)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleVerify(payment.id)}
                      className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                      style={{
                        backgroundColor: payment.isVerified
                          ? 'rgba(61, 163, 93, 0.15)'
                          : 'rgba(242, 201, 76, 0.2)',
                        color: payment.isVerified ? brandPalette.success : brandPalette.secondary,
                      }}
                    >
                      {payment.isVerified ? 'Verified' : 'Verify'}
                    </button>
                    {payment.receiptNumber && (
                      <span className="text-xs text-gray-500">
                        Receipt #{payment.receiptNumber}
                      </span>
                    )}
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
                className="px-4 py-2 border rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
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
                className="px-4 py-2 border rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
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
