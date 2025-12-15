'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
} from 'lucide-react';
import { customersService, Customer } from '@/services/customers.service';
import { BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette, formatIndianNumber } from '@/utils/brand';

export default function CustomerViewPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
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

  const safeKycStatus = customer?.kycStatus || 'PENDING';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
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
        <BrandPrimaryButton onClick={() => router.push(`/customers/${customerId}/edit`)}>
          <Edit className="w-4 h-4" />
          Edit Customer
        </BrandPrimaryButton>
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

          {/* KYC Documents */}
          {(customer.panNumber || customer.aadharNumber) && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${brandPalette.neutral}60` }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: brandPalette.secondary }}>
                KYC Documents
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
                onClick={() => router.push(`/customers/${customerId}/edit`)}
                className="w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
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
