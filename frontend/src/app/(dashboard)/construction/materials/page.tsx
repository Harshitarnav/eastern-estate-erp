'use client';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import MaterialEntryModal from '@/components/modals/MaterialEntryModal';
import MaterialExitModal from '@/components/modals/MaterialExitModal';
import { TableRowsSkeleton } from '@/components/Skeletons';
import { BrandHero, BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { BrandStatCard } from '@/components/layout/BrandStatCard';
import { brandPalette, formatIndianNumber } from '@/utils/brand';
import { Package, Plus, Search, ArrowDownCircle, ArrowUpCircle, ShoppingCart, AlertTriangle, X } from 'lucide-react';

const CATEGORIES = [
  'CEMENT', 'STEEL', 'SAND', 'AGGREGATE', 'BRICKS',
  'TILES', 'ELECTRICAL', 'PLUMBING', 'PAINT', 'HARDWARE', 'OTHER',
];

const UNITS = [
  { value: 'KG', label: 'KG' },
  { value: 'TONNE', label: 'Tonne' },
  { value: 'BAG', label: 'Bag' },
  { value: 'PIECE', label: 'Piece' },
  { value: 'LITRE', label: 'Litre' },
  { value: 'CUBIC_METER', label: 'Cubic Meter (m³)' },
  { value: 'SQUARE_METER', label: 'Square Meter (m²)' },
  { value: 'BOX', label: 'Box' },
  { value: 'SET', label: 'Set' },
];

const EMPTY_FORM = {
  materialCode: '',
  materialName: '',
  category: 'CEMENT',
  unitOfMeasurement: 'BAG',
  minimumStockLevel: '',
  maximumStockLevel: '',
  unitPrice: '',
  gstPercentage: '18',
  specifications: '',
};

function MaterialsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') ?? '';

  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [editMaterial, setEditMaterial] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/materials');
      const data = Array.isArray(response) ? response : (response?.data || []);
      setMaterials((data || []).filter((m: any) => m.isActive));
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditMaterial(null);
    setForm({ ...EMPTY_FORM });
    setShowCreatePanel(true);
  };

  const openEdit = (material: any) => {
    setEditMaterial(material);
    setForm({
      materialCode: material.materialCode || '',
      materialName: material.materialName || '',
      category: material.category || 'CEMENT',
      unitOfMeasurement: material.unitOfMeasurement || 'BAG',
      minimumStockLevel: material.minimumStockLevel?.toString() || '',
      maximumStockLevel: material.maximumStockLevel?.toString() || '',
      unitPrice: material.unitPrice?.toString() || '',
      gstPercentage: material.gstPercentage?.toString() || '18',
      specifications: material.specifications || '',
    });
    setShowCreatePanel(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materialCode || !form.materialName) {
      alert('Material Code and Name are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        minimumStockLevel: parseFloat(form.minimumStockLevel) || 0,
        maximumStockLevel: parseFloat(form.maximumStockLevel) || 0,
        unitPrice: parseFloat(form.unitPrice) || 0,
        gstPercentage: parseFloat(form.gstPercentage) || 0,
      };
      if (editMaterial) {
        await api.patch(`/materials/${editMaterial.id}`, payload);
        alert('Material updated successfully!');
      } else {
        await api.post('/materials', payload);
        alert('Material created successfully!');
      }
      setShowCreatePanel(false);
      setEditMaterial(null);
      setForm({ ...EMPTY_FORM });
      loadMaterials();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this material? It will be hidden from the list.')) return;
    try {
      await api.patch(`/materials/${id}`, { isActive: false });
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Failed to deactivate material');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CEMENT: 'bg-gray-100 text-gray-800', STEEL: 'bg-blue-100 text-blue-800',
      SAND: 'bg-yellow-100 text-yellow-800', AGGREGATE: 'bg-orange-100 text-orange-800',
      BRICKS: 'bg-red-100 text-red-800', TILES: 'bg-purple-100 text-purple-800',
      ELECTRICAL: 'bg-green-100 text-green-800', PLUMBING: 'bg-cyan-100 text-cyan-800',
      PAINT: 'bg-pink-100 text-pink-800', HARDWARE: 'bg-indigo-100 text-indigo-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatus = (material: any) => {
    const stock = Number(material.currentStock);
    const min = Number(material.minimumStockLevel);
    const max = Number(material.maximumStockLevel);
    if (stock <= min) return { label: 'Low Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (max > 0 && stock >= max) return { label: 'Overstock', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const filtered = materials.filter(m => {
    const matchesSearch = !search ||
      m.materialName?.toLowerCase().includes(search.toLowerCase()) ||
      m.materialCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCategory || m.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const totalValue = materials.reduce((sum, m) => sum + (Number(m.currentStock) * Number(m.unitPrice)), 0);
  const lowStockCount = materials.filter(m => Number(m.currentStock) <= Number(m.minimumStockLevel)).length;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full" style={{ backgroundColor: brandPalette.background }}>

      {/* Hero */}
      <BrandHero
        eyebrow="Materials Management"
        title={<>Every material, <span style={{ color: brandPalette.accent }}>always accounted for</span></>}
        description="Track your full materials catalogue, monitor stock levels, record deliveries and site issues - prevent shortages before they delay your project."
        actions={
          <>
            <BrandPrimaryButton onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add Material
            </BrandPrimaryButton>
            <BrandSecondaryButton onClick={() => setShowEntryModal(true)}>
              <ArrowDownCircle className="w-4 h-4" /> Stock In
            </BrandSecondaryButton>
          </>
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <BrandStatCard
          title="Total Materials"
          primary={formatIndianNumber(materials.length)}
          subLabel={`${new Set(materials.map(m => m.category)).size} categories`}
          icon={<Package className="w-7 h-7" />}
          accentColor={brandPalette.primary}
        />
        <BrandStatCard
          title="Low Stock"
          primary={formatIndianNumber(lowStockCount)}
          subLabel="Items below minimum"
          icon={<AlertTriangle className="w-7 h-7" />}
          accentColor={lowStockCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(61,163,93,0.2)'}
        />
        <BrandStatCard
          title="Stock Value"
          primary={formatCurrency(totalValue)}
          subLabel="Total inventory value"
          icon={<ShoppingCart className="w-7 h-7" />}
          accentColor="rgba(37,99,235,0.2)"
        />
        <BrandStatCard
          title="Quick Actions"
          primary="Issue / Receive"
          subLabel="Record stock movements"
          icon={<ArrowUpCircle className="w-7 h-7" />}
          accentColor="rgba(22,163,74,0.2)"
        />
      </section>

      {/* Low-stock alert */}
      {lowStockCount > 0 && (
        <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 px-6 py-4 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">{lowStockCount} material{lowStockCount > 1 ? 's' : ''} running low</p>
            <p className="text-sm text-red-700 mt-0.5">
              These items are at or below minimum stock levels. Raise purchase orders to avoid delays.
            </p>
          </div>
          <button
            onClick={() => router.push('/construction/purchase-orders')}
            className="shrink-0 text-xs px-3 py-1.5 bg-red-200 hover:bg-red-300 text-red-900 rounded-full font-medium transition"
          >
            Create PO
          </button>
        </div>
      )}

      {/* Quick action buttons row */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowEntryModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: brandPalette.success, color: brandPalette.success }}
        >
          <ArrowDownCircle className="w-4 h-4" /> Record Stock In
        </button>
        <button
          onClick={() => setShowExitModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: '#EA580C', color: '#EA580C' }}
        >
          <ArrowUpCircle className="w-4 h-4" /> Issue to Site
        </button>
        <button
          onClick={() => router.push(`/construction/purchase-orders${propertyId ? `?propertyId=${propertyId}` : ''}`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
          style={{ borderColor: '#7C3AED', color: '#7C3AED' }}
        >
          <ShoppingCart className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-sm p-5 space-y-4"
        style={{ borderColor: `${brandPalette.neutral}80` }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Name or code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A8211B] bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || filterCategory) && (
            <button
              onClick={() => { setSearch(''); setFilterCategory(''); }}
              className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50"
              style={{ borderColor: brandPalette.neutral, color: brandPalette.secondary }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${brandPalette.neutral}60` }}>
        {loading ? (
          <div className="p-4"><TableRowsSkeleton rows={5} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: brandPalette.primary, opacity: 0.45 }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: brandPalette.secondary }}>
              {materials.length === 0 ? 'No Materials Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {materials.length === 0
                ? 'Add your first material to start tracking inventory.'
                : 'Try a different search or clear the filters.'}
            </p>
            {materials.length === 0 && (
              <BrandPrimaryButton onClick={openCreate}>
                <Plus className="w-4 h-4" /> Add First Material
              </BrandPrimaryButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Material</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Value</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/construction/materials/${material.id}`)}
                          className="text-left group"
                        >
                          <div className="font-medium text-gray-900 group-hover:underline group-hover:text-[#A8211B] transition-colors">{material.materialName}</div>
                          <div className="text-xs text-gray-400 font-mono">{material.materialCode}</div>
                          {material.specifications && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{material.specifications}</div>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(material.category)}`}>
                          {material.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold">{Number(material.currentStock).toLocaleString('en-IN')} {material.unitOfMeasurement}</div>
                        <div className="text-xs text-gray-400">
                          Min: {Number(material.minimumStockLevel).toLocaleString('en-IN')} · Max: {Number(material.maximumStockLevel).toLocaleString('en-IN')}
                          </div>
                        {/* Mini stock bar */}
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${Number(material.currentStock) <= Number(material.minimumStockLevel) ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, Number(material.maximumStockLevel) > 0 ? (Number(material.currentStock) / Number(material.maximumStockLevel)) * 100 : 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium">{formatCurrency(Number(material.unitPrice))}</div>
                        {Number(material.gstPercentage) > 0 && (
                          <div className="text-xs text-gray-400">GST: {Number(material.gstPercentage)}%</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">
                        {formatCurrency(Number(material.currentStock) * Number(material.unitPrice))}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(material)}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivate(material.id)}
                            className="text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Slide-in Panel ── */}
      {showCreatePanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCreatePanel(false)} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ backgroundColor: '#A8211B' }}>
          <div>
                <h2 className="text-xl font-bold text-white">
                  {editMaterial ? 'Edit Material' : 'Add New Material'}
                </h2>
                <p className="text-red-200 text-sm mt-0.5">
                  {editMaterial ? 'Update material details' : 'Register a new material in the catalogue'}
            </p>
          </div>
              <button onClick={() => setShowCreatePanel(false)} className="text-red-200 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 p-6 space-y-5">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Code <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.materialCode}
                      onChange={e => setForm({ ...form, materialCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                      placeholder="e.g. CEM-001"
                      required
                      disabled={!!editMaterial}
                    />
                    {editMaterial && <p className="text-xs text-gray-400 mt-1">Code cannot be changed</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.materialName}
                    onChange={e => setForm({ ...form, materialName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g. OPC 53 Grade Cement"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement</label>
                  <select
                    value={form.unitOfMeasurement}
                    onChange={e => setForm({ ...form, unitOfMeasurement: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Stock Levels */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Stock Levels</h3>
                <div className="grid grid-cols-2 gap-4">
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.minimumStockLevel}
                      onChange={e => setForm({ ...form, minimumStockLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">Alert threshold</p>
          </div>
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock Level</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.maximumStockLevel}
                      onChange={e => setForm({ ...form, maximumStockLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">Overstock threshold</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.unitPrice}
                      onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                    />
          </div>
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
                    <select
                      value={form.gstPercentage}
                      onChange={e => setForm({ ...form, gstPercentage: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {['0', '5', '12', '18', '28'].map(g => (
                        <option key={g} value={g}>{g}%</option>
                      ))}
                    </select>
          </div>
        </div>
      </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications / Notes</label>
                <textarea
                  value={form.specifications}
                  onChange={e => setForm({ ...form, specifications: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Grade, brand, technical specifications…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 text-white rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#A8211B' }}
                >
                  {saving ? 'Saving…' : editMaterial ? 'Update Material' : 'Add Material'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePanel(false)}
                  className="px-5 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 text-center text-sm text-gray-400">
        Eastern Estate ERP • Life Long Bonding...
      </div>

      {/* Modals */}
      <MaterialEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSuccess={() => { setShowEntryModal(false); loadMaterials(); }}
      />
      <MaterialExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onSuccess={() => { setShowExitModal(false); loadMaterials(); }}
        propertyId={propertyId}
      />
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="p-6"><TableRowsSkeleton rows={5} cols={6} /></div>}>
      <MaterialsPageContent />
    </Suspense>
  );
}
