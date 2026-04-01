'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  Award,
  User,
  FileText,
  TrendingUp,
  Loader2,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { customersService, Customer } from '@/services/customers.service';
import { BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { DetailSkeleton } from '@/components/Skeletons';
import DocumentsPanel from '@/components/documents/DocumentsPanel';
import { DocumentEntityType } from '@/services/documents.service';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

export default function CustomerViewPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portalAccount, setPortalAccount] = useState<{ hasAccount: boolean; user?: any } | null>(null);
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePassword, setInvitePassword] = useState('');

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await customersService.getCustomer(customerId);
      setCustomer(response);
      setError('');
      // Also check portal account status
      apiService.get(`/customer-portal/check/${customerId}`)
        .then((r: any) => setPortalAccount(r))
        .catch(() => {});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!invitePassword || invitePassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setInviting(true);
      await apiService.post(`/customer-portal/invite/${customerId}`, { password: invitePassword });
      toast.success('Portal account created! Customer can now log in at /portal/login');
      setShowInviteModal(false);
      setInvitePassword('');
      setPortalAccount({ hasAccount: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create portal account');
    } finally {
      setInviting(false);
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

  const safeKycStatus =
    typeof customer?.kycStatus === 'string' && customer.kycStatus.length > 0
      ? customer.kycStatus
      : 'PENDING';

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-4">{error || 'Customer not found'}</p>
          <BrandSecondaryButton onClick={() => router.push('/customers')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
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
            onClick={() => router.push('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to customers list"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: brandPalette.secondary }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold truncate" style={{ color: brandPalette.secondary }}>
              {customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Customer Code: <span className="font-mono font-semibold">{customer.customerCode}</span>
            </p>
          </div>
          {customer.isVIP && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-700">
              VIP Customer
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Portal invite/status button */}
          {portalAccount?.hasAccount ? (
            <div className="flex items-center gap-1.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-green-700">Portal Active</p>
                <p className="text-[10px] text-gray-400">
                  {portalAccount.user?.lastLoginAt
                    ? `Last login: ${new Date(portalAccount.user.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : 'Never signed in'}
                </p>
              </div>
              <Link href="/customers/portal-accounts"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition">
                <Shield className="w-4 h-4" /> Manage
              </Link>
            </div>
          ) : (
            <button onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition">
              <UserPlus className="w-4 h-4" /> Invite to Portal
            </button>
          )}
          <BrandPrimaryButton onClick={() => router.push(`/customers/${customerId}/edit`)}>
            <Edit className="w-4 h-4" />
            Edit Customer
          </BrandPrimaryButton>
        </div>

        {/* Invite modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Create Portal Account</h3>
              <p className="text-sm text-gray-500 mb-4">
                This will create a login account for <strong>{customer?.fullName}</strong> at
                <code className="ml-1 text-xs bg-gray-100 px-1 py-0.5 rounded">/portal/login</code>
              </p>
              {!customer?.email && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                  ⚠️ This customer has no email address. Please add one before creating a portal account.
                </p>
              )}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-xs text-gray-400 mt-1">Share this with the customer so they can log in.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowInviteModal(false); setInvitePassword(''); }}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleInvite} disabled={inviting || !customer?.email}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${getKYCColor(safeKycStatus)}15` }}>
              <Shield className="w-6 h-6" style={{ color: getKYCColor(safeKycStatus) }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">KYC Status</p>
              <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                {safeKycStatus.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandPalette.primary}10` }}>
              <TrendingUp className="w-6 h-6" style={{ color: brandPalette.primary }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lifetime Value</p>
              <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                {formatAmount(customer.totalSpent || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandPalette.accent}15` }}>
              <Award className="w-6 h-6" style={{ color: brandPalette.accent }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                {customer.totalBookings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4" style={{ borderColor: `${brandPalette.neutral}60` }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandPalette.neutral}` }}>
              <User className="w-6 h-6" style={{ color: brandPalette.secondary }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Type</p>
              <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                {customer.type}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{customer.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{(customer as any).phoneNumber || customer.phone || 'Not provided'}</p>
                </div>
              </div>
              {customer.alternatePhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Alternate Phone</p>
                    <p className="font-medium">{customer.alternatePhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium whitespace-pre-line">
                    {customer.address || (customer as any).addressLine1 || 'Not provided'}
                    {customer.addressLine2 || (customer as any).addressLine2
                      ? `\n${customer.addressLine2 || (customer as any).addressLine2}`
                      : ''}
                    {customer.city || customer.state || customer.pincode
                      ? `\n${[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}`
                      : ''}
                    {customer.country ? `\n${customer.country}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {customer.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{new Date(customer.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              {customer.gender && (
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{customer.gender}</p>
                </div>
              )}
              {customer.occupation && (
                <div>
                  <p className="text-sm text-gray-600">Occupation</p>
                  <p className="font-medium">{customer.occupation}</p>
                </div>
              )}
              {(customer as any).companyName || customer.company && (
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{(customer as any).companyName || customer.company}</p>
                </div>
              )}
              {(customer as any).annualIncome && (
                <div>
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="font-medium">₹{formatIndianNumber((customer as any).annualIncome)}</p>
                </div>
              )}
            </div>
          </div>

          {/* KYC Numbers (static data) */}
          {(customer.panNumber || customer.aadharNumber) && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                KYC Numbers
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {customer.panNumber && (
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="font-medium font-mono">{customer.panNumber}</p>
                  </div>
                )}
                {customer.aadharNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Aadhar Number</p>
                    <p className="font-medium font-mono">{customer.aadharNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC & Customer Documents */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <DocumentsPanel
              entityType={DocumentEntityType.CUSTOMER}
              entityId={customerId}
              customerId={customerId}
              fetchMode="customer"
              title="KYC & Documents"
            />
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                Notes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
              Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{new Date(customer.updatedAt).toLocaleDateString()}</p>
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
                onClick={() => router.push(`/bookings?customerId=${customerId}`)}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
              >
                <FileText className="w-4 h-4" />
                View Bookings
              </button>
              <button
                onClick={() => router.push(`/payments?customerId=${customerId}`)}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
              >
                <Building className="w-4 h-4" />
                View Payments
              </button>
              <button
                onClick={() => router.push(`/customers/${customerId}/edit`)}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
              >
                <Edit className="w-4 h-4" />
                Edit Customer
              </button>
              <button
                onClick={() => router.push('/customers')}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
