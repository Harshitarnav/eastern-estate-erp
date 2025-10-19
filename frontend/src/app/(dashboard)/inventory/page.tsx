'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  Wrench,
  Eye,
  Trash2,
  Edit,
} from 'lucide-react';
import { inventoryService, InventoryItem, InventoryFilters } from '@/services/inventory.service';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber, formatToCrore } from '@/utils/brand';

export default function InventoryPage() {
  const router = useRouter();
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

  const stats = useMemo(() => {
    const totalItems = meta.total || items.length;
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const lowStock = items.filter((item) => item.stockStatus === 'LOW_STOCK').length;
    const outOfStock = items.filter((item) => item.stockStatus === 'OUT_OF_STOCK').length;
    const totalValue = items.reduce((sum, item) => sum + Number(item.totalValue || 0), 0);
    const issuedValue = items.reduce((sum, item) => sum + Number(item.totalIssued || 0), 0);
    return {
      totalItems,
      totalQuantity,
      lowStock,
      outOfStock,
      totalValue,
      issuedValue,
    };
  }, [items, meta.total]);

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
    const quantityStr = prompt(
      `Issue quantity for "${itemName}" (Available: ${available.toLocaleString('en-IN')}):`,
    );
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
        return brandPalette.success;
      case 'LOW_STOCK':
        return brandPalette.accent;
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

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  return (
    <div
      className="p-6 md:p-8 space-y-8 min-h-full"
      style={{ backgroundColor: brandPalette.background, borderRadius: '24px' }}
    >
      <BrandHero
        eyebrow="Material Control"
        title={
          <>
            Inventory built for{' '}
            <span style={{ color: brandPalette.accent }}>projects on schedule</span>
          </>
        }
        description="Monitor stock levels, fulfil issue requests, and prevent shortages with real-time inventory visibility."
        actions={
          <>
            <BrandPrimaryButton onClick={() => router.push('/inventory/new')}>
              <Plus className="w-4 h-4" />
              Add Item
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => router.push('/purchase-orders')}>
              Purchase Orders
            </BrandSecondaryButton>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total SKUs"
          primary={formatIndianNumber(stats.totalItems)}
          subLabel={`${formatIndianNumber(stats.totalQuantity)} units on hand`}
          icon={<Package className="w-8 h-8" />}
          accentColor={brandPalette.accent}
        />
        <BrandStatCard
          title="Low Stock"
          primary={formatIndianNumber(stats.lowStock)}
          subLabel={`${formatIndianNumber(stats.outOfStock)} out of stock`}
          icon={<TrendingDown className="w-8 h-8" />}
          accentColor="rgba(168, 33, 27, 0.18)"
        />
        <BrandStatCard
          title="Issued"
          primary={formatIndianNumber(stats.issuedValue)}
          subLabel="Units dispatched"
          icon={<Wrench className="w-8 h-8" />}
          accentColor="rgba(61, 163, 93, 0.25)"
        />
        <BrandStatCard
          title="Inventory Value"
          primary={formatToCrore(stats.totalValue)}
          subLabel="Current stock valuation"
          icon={<TrendingUp className="w-8 h-8" />}
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
              placeholder="Search inventory..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <BrandPrimaryButton onClick={() => router.push('/inventory/new')}>
            <Plus className="w-4 h-4" />
            New Item
          </BrandPrimaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
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
            onChange={(e) =>
              setFilters({ ...filters, stockStatus: e.target.value || undefined, page: 1 })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
          >
            <option value="">All Stock Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ORDERED">Ordered</option>
          </select>

          <select
            value={filters.isActive === true ? 'true' : filters.isActive === false ? 'false' : ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
          >
            <option value="">All Items</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
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
            <p className="text-gray-600 text-sm">Loading inventory...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white/90 rounded-3xl border p-12 text-center shadow-sm">
          <Package className="h-16 w-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.55 }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
            No Inventory Items Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.category || filters.stockStatus || filters.isActive !== undefined
              ? 'No items match your search criteria. Try adjusting your filters.'
              : 'Add your first inventory item to start tracking project materials.'}
          </p>
          <BrandPrimaryButton onClick={() => router.push('/inventory/new')}>
            <Plus className="w-4 h-4" />
            Add Inventory Item
          </BrandPrimaryButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ borderColor: `${brandPalette.neutral}60` }}
              >
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: `${brandPalette.neutral}80` }}
                >
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: brandPalette.secondary }}>
                      {getCategoryEmoji(item.category)} {item.itemName}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      {item.itemCode}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: `${getStockStatusColor(item.stockStatus)}15`,
                      color: getStockStatusColor(item.stockStatus),
                    }}
                  >
                    {getStockStatusIcon(item.stockStatus)}
                    {formatStatus(item.stockStatus)}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  <div className="border rounded-xl p-3 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Available Units</p>
                      <p className="text-lg font-semibold" style={{ color: brandPalette.secondary }}>
                        {formatIndianNumber(item.quantity)} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Value</p>
                      <p className="text-sm font-semibold" style={{ color: brandPalette.success }}>
                        {formatToCrore(item.totalValue)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Min</p>
                      <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                        {item.minimumStock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reorder</p>
                      <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                        {item.reorderPoint}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Issued</p>
                      <p className="font-semibold" style={{ color: brandPalette.secondary }}>
                        {item.totalIssued}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/inventory/${item.id}`)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:bg-[#F9F7F3]"
                      style={{ borderColor: brandPalette.primary, color: brandPalette.primary }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/inventory/${item.id}/edit`)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#FEF3E2]"
                      style={{ borderColor: brandPalette.accent, color: brandPalette.secondary }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.itemName)}
                      className="px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleIssue(item.id, item.itemName, item.quantity)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#FEF3E2]"
                      style={{ borderColor: '#F97316', color: '#C2410C' }}
                    >
                      Issue
                    </button>
                    <button
                      onClick={() => handleReceive(item.id, item.itemName)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#E0F2FE]"
                      style={{ borderColor: '#3B82F6', color: '#1D4ED8' }}
                    >
                      Receive
                    </button>
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
