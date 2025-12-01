'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import CreatePurchaseOrderModal from '@/components/modals/CreatePurchaseOrderModal';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      router.push('/construction');
      return;
    }
    loadOrders();
  }, [propertyId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/purchase-orders');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
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

  const getStatusColor = (status: string) => {
    const colors: any = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-blue-100 text-blue-800',
      'SENT': 'bg-purple-100 text-purple-800',
      'PARTIALLY_RECEIVED': 'bg-orange-100 text-orange-800',
      'RECEIVED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PARTIAL': 'bg-orange-100 text-orange-800',
      'PAID': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!propertyId) return null;

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
            🛒
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              Purchase Orders
            </h1>
            <p className="text-sm text-gray-500">Eastern Estate ERP System</p>
          </div>
        </div>
        <p className="text-gray-600">Create and manage material purchase orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total POs</p>
          <p className="text-2xl font-bold text-gray-900">{(orders || []).length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">
            {((orders || [])).filter(po => po.status === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-blue-700">
            {((orders || [])).filter(po => po.status === 'APPROVED' || po.status === 'SENT').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600 mb-1">Received</p>
          <p className="text-2xl font-bold text-green-700">
            {((orders || [])).filter(po => po.status === 'RECEIVED').length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <p className="text-sm text-purple-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(((orders || [])).reduce((sum, po) => sum + (po.grandTotal || 0), 0))}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => alert('Create PO feature coming soon!')}
          className="bg-blue-500 text-white rounded-lg shadow-lg p-4 hover:bg-blue-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="font-bold">Create New PO</h3>
              <p className="text-sm text-blue-100">Start a new purchase order</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 text-white rounded-lg shadow-lg p-4 hover:bg-green-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤝</div>
            <div>
              <h3 className="font-bold">Manage Vendors</h3>
              <p className="text-sm text-green-100">View and add vendors</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/construction/materials?propertyId=${propertyId}`)}
          className="bg-orange-500 text-white rounded-lg shadow-lg p-4 hover:bg-orange-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧱</div>
            <div>
              <h3 className="font-bold">View Materials</h3>
              <p className="text-sm text-orange-100">Check material inventory</p>
            </div>
          </div>
        </button>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-white rounded-lg shadow mb-6">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading purchase orders...</p>
          </div>
        ) : (orders || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">🛒</p>
            <p className="text-gray-600 mb-4">No purchase orders found. Create your first PO!</p>
            <button
              onClick={() => alert('Create PO feature coming soon!')}
              className="px-6 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#A8211B' }}
            >
              Create Purchase Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {((orders || [])).map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{po.poNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {po.vendor?.vendorName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(po.orderDate).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(po.grandTotal || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(po.status)}`}>
                        {po.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(po.paymentStatus)}`}>
                        {po.paymentStatus}
                      </span>
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
            How to Use Purchase Orders
          </h3>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">What is this page for?</h4>
            <p className="text-sm">
              The Purchase Orders page manages the procurement process for construction materials. Create orders, track approvals, 
              monitor deliveries, and manage payments - all from one centralized location. Streamline your material ordering workflow.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>PO Creation:</strong> Create detailed purchase orders with line items</li>
              <li><strong>Approval Workflow:</strong> Track PO approval status and history</li>
              <li><strong>Delivery Tracking:</strong> Monitor expected and actual delivery dates</li>
              <li><strong>Payment Management:</strong> Track payment status (Pending, Partial, Paid)</li>
              <li><strong>Vendor Integration:</strong> Link POs directly to vendors</li>
              <li><strong>Status Tracking:</strong> Monitor PO lifecycle from draft to received</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
              <li>Click "Create New PO" to start a purchase order</li>
              <li>Select vendor and add materials with quantities</li>
              <li>Submit for approval and track approval status</li>
              <li>Once approved, PO is sent to vendor</li>
              <li>Mark as received when materials arrive at site</li>
              <li>Update payment status when paying the vendor</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Create POs well in advance of material need dates</li>
              <li>Get multiple quotes before creating POs</li>
              <li>Verify material specs match project requirements</li>
              <li>Track delivery dates to avoid construction delays</li>
              <li>Update status promptly when materials are received</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreatePurchaseOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadOrders();
        }}
        propertyId={propertyId}
      />
    </div>
  );
}
