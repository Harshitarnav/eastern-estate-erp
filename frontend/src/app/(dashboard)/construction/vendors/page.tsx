'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import AddVendorModal from '@/components/modals/AddVendorModal';
import VendorPaymentModal from '@/components/modals/VendorPaymentModal';

export default function VendorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendors');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setVendors((data || []).filter((v: any) => v.isActive));
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {'⭐'.repeat(fullStars)}
        {halfStar && '⭐'}
        {'☆'.repeat(emptyStars)}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Eastern Estate Branded Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/construction')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          ← Back to Construction Hub
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: '#A8211B' }}>
            🤝
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              Vendors Management
            </h1>
            <p className="text-sm text-gray-500">Eastern Estate ERP System</p>
          </div>
        </div>
        <p className="text-gray-600">Manage vendor relationships, payments, and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900">{(vendors || []).length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600 mb-1">Active Vendors</p>
          <p className="text-2xl font-bold text-green-700">{(vendors || []).length}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-600 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency((vendors || []).reduce((sum: number, v: any) => sum + (v.outstandingAmount || 0), 0))}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600 mb-1">Avg Rating</p>
          <p className="text-2xl font-bold text-blue-700">
            {(vendors || []).length > 0 
              ? ((vendors || []).reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / (vendors || []).length).toFixed(1)
              : '0.0'
            }⭐
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 text-white rounded-lg shadow-lg p-4 hover:bg-green-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">➕</div>
            <div>
              <h3 className="font-bold">Add New Vendor</h3>
              <p className="text-sm text-green-100">Register a new vendor</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowPaymentModal(true)}
          className="bg-blue-500 text-white rounded-lg shadow-lg p-4 hover:bg-blue-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">💰</div>
            <div>
              <h3 className="font-bold">Record Payment</h3>
              <p className="text-sm text-blue-100">Pay vendor invoices</p>
            </div>
          </div>
        </button>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow mb-6">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vendors...</p>
          </div>
        ) : (vendors || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">🤝</p>
            <p className="text-gray-600 mb-4">No vendors found. Contact admin to add vendors.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {((vendors || [])).map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                        <div className="text-sm text-gray-500">{vendor.vendorCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{vendor.contactPerson}</div>
                        <div className="text-gray-500">{vendor.phoneNumber}</div>
                        {vendor.email && <div className="text-gray-500">{vendor.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {vendor.materialsSupplied && Array.isArray(vendor.materialsSupplied)
                          ? (vendor.materialsSupplied || []).length + ' types'
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRatingStars(vendor.rating || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${
                        (vendor.outstandingAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(vendor.outstandingAmount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {formatCurrency(vendor.creditLimit || 0)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How to Use Guide */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 border-2" style={{ borderColor: '#A8211B' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#A8211B' }}>
            📖
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#A8211B' }}>
            How to Use Vendors Management
          </h3>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">What is this page for?</h4>
            <p className="text-sm">
              The Vendors Management page helps you maintain relationships with material suppliers, track payments, manage credit limits, 
              and rate vendor performance. Keep organized records of all vendors supplying materials for your construction projects.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Vendor Directory:</strong> Complete contact information for all suppliers</li>
              <li><strong>Outstanding Tracking:</strong> Monitor pending payments to vendors</li>
              <li><strong>Credit Management:</strong> Set and track credit limits for each vendor</li>
              <li><strong>Rating System:</strong> Rate vendors based on quality, delivery time, and service</li>
              <li><strong>Materials Supplied:</strong> Track which materials each vendor provides</li>
              <li><strong>Payment Records:</strong> Maintain payment history and transactions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
              <li>Review vendor list to see all registered suppliers</li>
              <li>Check outstanding amounts to track pending payments</li>
              <li>Use "Add New Vendor" to register new material suppliers</li>
              <li>Click "Record Payment" when making vendor payments</li>
              <li>Monitor credit limits to manage vendor relationships</li>
              <li>Review ratings to identify best-performing vendors</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Pay vendors on time to maintain good relationships</li>
              <li>Keep vendor contact information up to date</li>
              <li>Rate vendors after each delivery for better tracking</li>
              <li>Monitor outstanding amounts to manage cash flow</li>
              <li>Prefer highly-rated vendors for critical materials</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddVendorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadVendors();
        }}
      />

      <VendorPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          loadVendors();
        }}
      />
    </div>
  );
}
