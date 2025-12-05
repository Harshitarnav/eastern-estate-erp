'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  FileText,
  User,
  Home,
  Calendar,
  DollarSign,
  Building,
  CreditCard,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { bookingsService, Booking } from '@/services/bookings.service';
import { BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette } from '@/utils/brand';

export default function BookingViewPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getBooking(bookingId);
      setBooking(response);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch booking');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const customerName =
    booking?.customer?.full_name ||
    booking?.customer?.fullName ||
    [booking?.customer?.first_name, booking?.customer?.last_name].filter(Boolean).join(' ') ||
    'N/A';
  const customerPhone =
    booking?.customer?.phone_number ||
    booking?.customer?.phone ||
    booking?.customer?.phoneNumber ||
    'N/A';
  const customerEmail = booking?.customer?.email || 'N/A';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <BrandSecondaryButton onClick={() => router.push('/bookings')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings
          </BrandSecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6" style={{ backgroundColor: brandPalette.background }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/bookings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to bookings list"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: brandPalette.secondary }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brandPalette.secondary }}>
              {booking.bookingNumber}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Booking Details
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${getStatusColor(booking.status)}15`,
              color: getStatusColor(booking.status),
            }}
          >
            {booking.status}
          </span>
        </div>
        <BrandPrimaryButton onClick={() => router.push(`/bookings/${bookingId}/edit`)}>
          <Edit className="w-4 h-4" />
          Edit Booking
        </BrandPrimaryButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandPalette.primary}10` }}>
              <DollarSign className="w-6 h-6" style={{ color: brandPalette.primary }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold text-lg" style={{ color: brandPalette.secondary }}>
                {formatAmount(booking.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="font-semibold text-lg text-green-600">
                {formatAmount(booking.paidAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-50">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="font-semibold text-lg text-orange-600">
                {formatAmount(booking.balanceAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandPalette.accent}15` }}>
              <CreditCard className="w-6 h-6" style={{ color: brandPalette.accent }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Token Amount</p>
              <p className="font-semibold text-lg" style={{ color: brandPalette.secondary }}>
                {formatAmount(booking.tokenAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
          Payment Progress
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold">
              {((booking.paidAmount / booking.totalAmount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="h-4 rounded-full transition-all"
              style={{
                width: `${(booking.paidAmount / booking.totalAmount) * 100}%`,
                backgroundColor: brandPalette.success,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Property Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Customer & Property
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </p>
                <p className="font-medium">{customerName}</p>
                <p className="text-xs text-gray-500 mt-1">{customerPhone}</p>
                <p className="text-xs text-gray-500">{customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Property
                </p>
                <p className="font-medium">{booking.property?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Flat/Unit
                </p>
                <p className="font-medium">{booking.flat?.flatNumber || booking.flat?.name || 'N/A'}</p>
                {booking.flat?.towerId && (
                  <p className="text-xs text-gray-500">Tower: {booking.flat?.towerId}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Booking Date
                </p>
                <p className="font-medium">{formatDate(booking.bookingDate)}</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Financial Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Discount Amount</p>
                <p className="font-medium">{formatAmount(booking.discountAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stamp Duty</p>
                <p className="font-medium">{formatAmount(booking.stampDuty)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Charges</p>
                <p className="font-medium">{formatAmount(booking.registrationCharges)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">GST Amount</p>
                <p className="font-medium">{formatAmount(booking.gstAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Maintenance Deposit</p>
                <p className="font-medium">{formatAmount(booking.maintenanceDeposit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parking Charges</p>
                <p className="font-medium">{formatAmount(booking.parkingCharges)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Other Charges</p>
                <p className="font-medium">{formatAmount(booking.otherCharges)}</p>
              </div>
              {booking.discountReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Discount Reason</p>
                  <p className="font-medium">{booking.discountReason}</p>
                </div>
              )}
              {booking.paymentPlan && (
                <div>
                  <p className="text-sm text-gray-600">Payment Plan</p>
                  <p className="font-medium">{booking.paymentPlan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment References */}
          {(booking.tokenPaymentMode ||
            booking.rtgsNumber ||
            booking.utrNumber ||
            booking.chequeNumber ||
            booking.paymentBank ||
            booking.paymentBranch) && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Payment References
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {booking.tokenPaymentMode && (
                  <div>
                    <p className="text-sm text-gray-600">Token Payment Mode</p>
                    <p className="font-medium">{booking.tokenPaymentMode}</p>
                  </div>
                )}
                {booking.rtgsNumber && (
                  <div>
                    <p className="text-sm text-gray-600">RTGS Number</p>
                    <p className="font-medium font-mono">{booking.rtgsNumber}</p>
                  </div>
                )}
                {booking.utrNumber && (
                  <div>
                    <p className="text-sm text-gray-600">UTR Number</p>
                    <p className="font-medium font-mono">{booking.utrNumber}</p>
                  </div>
                )}
                {booking.chequeNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Cheque Number</p>
                    <p className="font-medium font-mono">{booking.chequeNumber}</p>
                  </div>
                )}
                {booking.chequeDate && (
                  <div>
                    <p className="text-sm text-gray-600">Cheque Date</p>
                    <p className="font-medium">{formatDate(booking.chequeDate)}</p>
                  </div>
                )}
                {booking.paymentBank && (
                  <div>
                    <p className="text-sm text-gray-600">Bank</p>
                    <p className="font-medium">{booking.paymentBank}</p>
                  </div>
                )}
                {booking.paymentBranch && (
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="font-medium">{booking.paymentBranch}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agreement Details */}
          {(booking.agreementNumber || booking.agreementDate) && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Agreement Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {booking.agreementNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Agreement Number</p>
                    <p className="font-medium font-mono">{booking.agreementNumber}</p>
                  </div>
                )}
                {booking.agreementDate && (
                  <div>
                    <p className="text-sm text-gray-600">Agreement Date</p>
                    <p className="font-medium">{formatDate(booking.agreementDate)}</p>
                  </div>
                )}
                {booking.agreementSignedDate && (
                  <div>
                    <p className="text-sm text-gray-600">Signed Date</p>
                    <p className="font-medium">{formatDate(booking.agreementSignedDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Home Loan Details */}
          {booking.isHomeLoan && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Home Loan Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-medium">{booking.bankName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="font-medium">{formatAmount(booking.loanAmount || 0)}</p>
                </div>
                {booking.loanApplicationNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Application Number</p>
                    <p className="font-medium font-mono">{booking.loanApplicationNumber}</p>
                  </div>
                )}
                {booking.loanApprovalDate && (
                  <div>
                    <p className="text-sm text-gray-600">Approval Date</p>
                    <p className="font-medium">{formatDate(booking.loanApprovalDate)}</p>
                  </div>
                )}
                {booking.loanDisbursementDate && (
                  <div>
                    <p className="text-sm text-gray-600">Disbursement Date</p>
                    <p className="font-medium">{formatDate(booking.loanDisbursementDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nominees & Co-Applicants */}
          {(booking.nominee1Name ||
            booking.nominee2Name ||
            booking.coApplicantName) && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Nominees & Co-Applicants
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {booking.nominee1Name && (
                  <div>
                    <p className="text-sm text-gray-600">Nominee 1</p>
                    <p className="font-medium">{booking.nominee1Name}</p>
                    {booking.nominee1Relation && (
                      <p className="text-xs text-gray-500">{booking.nominee1Relation}</p>
                    )}
                  </div>
                )}
                {booking.nominee2Name && (
                  <div>
                    <p className="text-sm text-gray-600">Nominee 2</p>
                    <p className="font-medium">{booking.nominee2Name}</p>
                    {booking.nominee2Relation && (
                      <p className="text-xs text-gray-500">{booking.nominee2Relation}</p>
                    )}
                  </div>
                )}
                {booking.coApplicantName && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Co-Applicant</p>
                    <p className="font-medium">{booking.coApplicantName}</p>
                    <p className="text-xs text-gray-500">
                      {booking.coApplicantRelation ? `${booking.coApplicantRelation} • ` : ''}
                      {booking.coApplicantPhone || booking.coApplicantEmail || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Notes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}
          {booking.specialTerms && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Special Terms
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.specialTerms}</p>
            </div>
          )}
          {booking.documents && booking.documents.length > 0 && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Documents
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {booking.documents.map((doc, idx) => (
                  <li key={idx}>
                    <a href={doc} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {doc}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Possession Details */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Possession
            </h2>
            <div className="space-y-4">
              {booking.expectedPossessionDate && (
                <div>
                  <p className="text-sm text-gray-600">Expected Date</p>
                  <p className="font-medium">{formatDate(booking.expectedPossessionDate)}</p>
                </div>
              )}
              {booking.actualPossessionDate && (
                <div>
                  <p className="text-sm text-gray-600">Actual Date</p>
                  <p className="font-medium">{formatDate(booking.actualPossessionDate)}</p>
                </div>
              )}
              {booking.registrationDate && (
                <div>
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <p className="font-medium">{formatDate(booking.registrationDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{formatDate(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(booking.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/bookings/${bookingId}/edit`)}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </button>
              <button
                onClick={() => router.push('/bookings')}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
