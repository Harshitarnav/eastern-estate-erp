'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Search, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { purchaseOrdersService, PurchaseOrder, PurchaseOrderFilters } from '@/services/purchase-orders.service';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<PurchaseOrderFilters>({
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrdersService.getOrders(filters);
      setOrders(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleApprove = async (id: string, orderNumber: string) => {
    if (!confirm(`Approve purchase order ${orderNumber}?`)) return;

    try {
      await purchaseOrdersService.approveOrder(id, 'user-id', 'Current User');
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve order');
    }
  };

  const handleReject = async (id: string, orderNumber: string) => {
    const reason = prompt(`Reject purchase order ${orderNumber}?\n\nEnter rejection reason:`);
    if (!reason) return;

    try {
      await purchaseOrdersService.rejectOrder(id, 'user-id', 'Current User', reason);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject order');
    }
  };

  const handleReceive = async (id: string, orderNumber: string) => {
    const confirmed = confirm(`Mark items as received for order ${orderNumber}?`);
    if (!confirmed) return;

    try {
      // For now, mark all items as received
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const receivedData = {
        items: order.items.map((item: any) => ({
          itemId: item.itemId,
          quantityOrdered: item.quantity,
          quantityReceived: item.quantity,
          receivedDate: new Date().toISOString(),
          receivedBy: 'Current User',
          condition: 'GOOD',
        })),
      };

      await purchaseOrdersService.receiveItems(id, receivedData);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to receive items');
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'RECEIVED':
        return '#6366F1';
      case 'PENDING_APPROVAL':
        return '#F2C94C';
      case 'REJECTED':
        return '#EF4444';
      case 'DRAFT':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#10B981';
      case 'PARTIALLY_PAID':
        return '#F2C94C';
      case 'UNPAID':
        return '#EF4444';
      case 'OVERDUE':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Purchase Orders
          </h1>
        </div>
        <p className="text-gray-600">
          Manage inventory purchases, suppliers, and procurement workflow.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.orderStatus || ''}
            onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Order Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RECEIVED">Received</option>
          </select>

          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Payment Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/purchase-orders/new')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>New Purchase Order</span>
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
            <p className="text-gray-600">Loading purchase orders...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Orders Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.orderStatus || filters.paymentStatus
              ? 'No orders match your search criteria.'
              : 'Start by creating your first purchase order.'}
          </p>
          <button
            onClick={() => router.push('/purchase-orders/new')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Create First Order</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                          {order.orderNumber}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getOrderStatusColor(order.orderStatus)}20`,
                          color: getOrderStatusColor(order.orderStatus),
                        }}
                      >
                        {formatStatus(order.orderStatus)}
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}20`,
                          color: getPaymentStatusColor(order.paymentStatus),
                        }}
                      >
                        {formatStatus(order.paymentStatus)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Supplier Info */}
                  <div className="mb-4 pb-4 border-b">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Supplier</div>
                    <div className="text-base font-bold" style={{ color: '#7B1E12' }}>
                      {order.supplierName}
                    </div>
                    {order.supplierPhone && (
                      <div className="text-xs text-gray-600">{order.supplierPhone}</div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Items</div>
                      <div className="text-sm font-semibold flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {order.items.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Quantity</div>
                      <div className="text-sm font-semibold">{order.totalItemsOrdered}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                      <div className="text-base font-bold" style={{ color: '#3DA35D' }}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Balance</div>
                      <div className="text-sm font-semibold" style={{ 
                        color: order.balanceAmount > 0 ? '#EF4444' : '#3DA35D' 
                      }}>
                        {formatCurrency(order.balanceAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Receiving Progress */}
                  {order.totalItemsOrdered > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Received Progress</span>
                        <span>{order.totalItemsReceived}/{order.totalItemsOrdered}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(order.totalItemsReceived / order.totalItemsOrdered) * 100}%`,
                            backgroundColor: '#6366F1',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {order.orderStatus === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => handleApprove(order.id, order.orderNumber)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#10B981', color: 'white' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(order.id, order.orderNumber)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          style={{ backgroundColor: '#EF4444', color: 'white' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {(order.orderStatus === 'APPROVED' || order.orderStatus === 'PARTIALLY_RECEIVED') && (
                      <button
                        onClick={() => handleReceive(order.id, order.orderNumber)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#6366F1', color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366F1'}
                      >
                        <Package className="h-4 w-4" />
                        <span>Receive Items</span>
                      </button>
                    )}

                    {order.orderStatus === 'RECEIVED' && (
                      <div className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    )}

                    <button
                      onClick={() => router.push(`/purchase-orders/${order.id}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3E2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      View
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
