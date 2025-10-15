'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { inventoryService, InventoryItem, InventoryFilters } from '@/services/inventory.service';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<InventoryFilters>({
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

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getItems(filters);
      setItems(response.data);
      setMeta(response.meta);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory items');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      await inventoryService.deleteItem(id);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleIssue = async (id: string, itemName: string, available: number) => {
    const quantityStr = prompt(`Issue quantity for "${itemName}" (Available: ${available}):`);
    if (!quantityStr) return;

    const quantity = parseFloat(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (quantity > available) {
      alert('Insufficient stock!');
      return;
    }

    try {
      await inventoryService.issueItem(id, quantity);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue item');
    }
  };

  const handleReceive = async (id: string, itemName: string) => {
    const quantityStr = prompt(`Receive quantity for "${itemName}":`);
    if (!quantityStr) return;

    const quantity = parseFloat(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await inventoryService.receiveItem(id, quantity);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to receive item');
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return '#10B981';
      case 'LOW_STOCK':
        return '#F2C94C';
      case 'OUT_OF_STOCK':
        return '#EF4444';
      case 'ORDERED':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <CheckCircle className="h-4 w-4" />;
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'CONSTRUCTION_MATERIAL':
        return '🏗️';
      case 'ELECTRICAL':
        return '⚡';
      case 'PLUMBING':
        return '🚰';
      case 'HARDWARE':
        return '🔧';
      case 'PAINT':
        return '🎨';
      case 'TILES':
        return '🔲';
      case 'FIXTURES':
        return '💡';
      case 'TOOLS':
        return '🛠️';
      case 'SAFETY_EQUIPMENT':
        return '🦺';
      default:
        return '📦';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Inventory
          </h1>
        </div>
        <p className="text-gray-600">
          Track stock levels, manage suppliers, and control inventory movement.
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
                placeholder="Search inventory..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Categories</option>
            <option value="CONSTRUCTION_MATERIAL">Construction Material</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="HARDWARE">Hardware</option>
            <option value="PAINT">Paint</option>
            <option value="TILES">Tiles</option>
            <option value="FIXTURES">Fixtures</option>
            <option value="TOOLS">Tools</option>
            <option value="SAFETY_EQUIPMENT">Safety Equipment</option>
          </select>

          <select
            value={filters.stockStatus || ''}
            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Stock Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ORDERED">Ordered</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1"></div>
          <button
            onClick={() => alert('Add Item form - Coming soon')}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1E12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
          >
            <Plus className="h-5 w-5" />
            <span>Add Item</span>
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
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4" style={{ color: '#A8211B', opacity: 0.5 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#7B1E12' }}>
            No Items Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.category || filters.stockStatus
              ? 'No items match your search criteria.'
              : 'Start by adding your first inventory item.'}
          </p>
          <button
            onClick={() => alert('Add Item form - Coming soon')}
            className="px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            <span>Add First Item</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4" style={{ backgroundColor: '#FEF3E2' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                        <h3 className="text-lg font-bold" style={{ color: '#7B1E12' }}>
                          {item.itemName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">{item.itemCode}</p>
                      {item.brand && (
                        <p className="text-xs text-gray-500">{item.brand}</p>
                      )}
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getStockStatusColor(item.stockStatus)}20`,
                      color: getStockStatusColor(item.stockStatus),
                    }}
                  >
                    {getStockStatusIcon(item.stockStatus)}
                    <span>{formatStatus(item.stockStatus)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3 pb-3 border-b">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Current Stock</span>
                      <span className="text-2xl font-bold" style={{ color: '#7B1E12' }}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Min: {item.minimumStock}</span>
                      <span>Reorder: {item.reorderPoint}</span>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (item.quantity / (item.reorderPoint * 2)) * 100)}%`,
                          backgroundColor: getStockStatusColor(item.stockStatus),
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Unit Price:</span>
                      <span className="font-semibold">₹{item.unitPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-semibold" style={{ color: '#3DA35D' }}>
                        ₹{item.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {item.supplierName && (
                    <div className="text-xs text-gray-600 mb-3">
                      <strong>Supplier:</strong> {item.supplierName}
                    </div>
                  )}

                  {item.warehouseLocation && (
                    <div className="text-xs text-gray-600 mb-3">
                      <strong>Location:</strong> {item.warehouseLocation}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleIssue(item.id, item.itemName, item.quantity)}
                      disabled={item.quantity <= 0}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#F2C94C', color: '#7B1E12' }}
                      onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#E6BD3D')}
                      onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#F2C94C')}
                    >
                      <TrendingDown className="h-4 w-4" />
                      <span>Issue</span>
                    </button>
                    <button
                      onClick={() => handleReceive(item.id, item.itemName)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      style={{ backgroundColor: '#3DA35D', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D8A4A'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3DA35D'}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Receive</span>
                    </button>
                    <button
                      onClick={() => alert(`View item: ${item.id}`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
                      style={{ borderColor: '#A8211B', color: '#A8211B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
