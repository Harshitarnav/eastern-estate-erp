'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import MaterialEntryModal from '@/components/modals/MaterialEntryModal';
import MaterialExitModal from '@/components/modals/MaterialExitModal';

export default function MaterialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/materials');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setMaterials((data || []).filter((m: any) => m.isActive));
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      'CEMENT': 'bg-gray-100 text-gray-800',
      'STEEL': 'bg-blue-100 text-blue-800',
      'SAND': 'bg-yellow-100 text-yellow-800',
      'AGGREGATE': 'bg-orange-100 text-orange-800',
      'BRICKS': 'bg-red-100 text-red-800',
      'TILES': 'bg-purple-100 text-purple-800',
      'ELECTRICAL': 'bg-green-100 text-green-800',
      'PLUMBING': 'bg-cyan-100 text-cyan-800',
      'PAINT': 'bg-pink-100 text-pink-800',
      'HARDWARE': 'bg-indigo-100 text-indigo-800',
      'OTHER': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatus = (material: any) => {
    if (material.currentStock <= material.minimumStockLevel) {
      return { label: 'Low Stock', color: 'text-red-600' };
    }
    if (material.currentStock >= material.maximumStockLevel) {
      return { label: 'Overstock', color: 'text-orange-600' };
    }
    return { label: 'Normal', color: 'text-green-600' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
            🧱
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              Materials Management
            </h1>
            <p className="text-sm text-gray-500">Eastern Estate ERP System</p>
          </div>
        </div>
        <p className="text-gray-600">Manage inventory, stock levels, and material tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900">{(materials || []).length}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-600 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-700">
            {((materials || [])).filter(m => m.currentStock <= m.minimumStockLevel).length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600 mb-1">Active Materials</p>
          <p className="text-2xl font-bold text-green-700">{(materials || []).length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency((materials || []).reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0))}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setShowEntryModal(true)}
          className="bg-green-500 text-white rounded-lg shadow-lg p-4 hover:bg-green-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📥</div>
            <div>
              <h3 className="font-bold">Material Entry</h3>
              <p className="text-sm text-green-100">Add stock to inventory</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowExitModal(true)}
          className="bg-orange-500 text-white rounded-lg shadow-lg p-4 hover:bg-orange-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📤</div>
            <div>
              <h3 className="font-bold">Material Exit</h3>
              <p className="text-sm text-orange-100">Issue materials to site</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/construction/purchase-orders?propertyId=${propertyId}`)}
          className="bg-purple-500 text-white rounded-lg shadow-lg p-4 hover:bg-purple-600 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🛒</div>
            <div>
              <h3 className="font-bold">Create PO</h3>
              <p className="text-sm text-purple-100">Order new materials</p>
            </div>
          </div>
        </button>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow mb-6">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading materials...</p>
          </div>
        ) : (materials || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">🧱</p>
            <p className="text-gray-600 mb-4">No materials found. Contact admin to add materials.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {((materials || [])).map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{material.materialName}</div>
                          <div className="text-sm text-gray-500">{material.materialCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(material.category)}`}>
                          {material.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{material.currentStock} {material.unitOfMeasurement}</div>
                          <div className="text-gray-500">
                            Min: {material.minimumStockLevel} | Max: {material.maximumStockLevel}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{formatCurrency(material.unitPrice)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">
                          {formatCurrency(material.currentStock * material.unitPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            How to Use Materials Management
          </h3>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">What is this page for?</h4>
            <p className="text-sm">
              The Materials Management page helps you track all construction materials, monitor stock levels, and manage inventory for your property. 
              Keep track of what you have, what you need, and prevent material shortages that could delay construction.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li><strong>Inventory Tracking:</strong> View current stock levels for all materials</li>
              <li><strong>Stock Alerts:</strong> Automatic alerts for low stock and overstock situations</li>
              <li><strong>Value Calculation:</strong> Real-time calculation of total inventory value</li>
              <li><strong>Category Management:</strong> Materials organized by type (Cement, Steel, Sand, etc.)</li>
              <li><strong>Material Entry:</strong> Record new materials received (store inward)</li>
              <li><strong>Material Exit:</strong> Track materials issued to construction site (store outward)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
              <li>Review the stats cards to get overview of your inventory status</li>
              <li>Check the materials table for detailed stock information</li>
              <li>Watch for "Low Stock" alerts in red to prevent shortages</li>
              <li>Use "Material Entry" to record received materials from vendors</li>
              <li>Use "Material Exit" to issue materials to construction teams</li>
              <li>Click "Create PO" to order more materials when stock is low</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Monitor low stock items daily to prevent construction delays</li>
              <li>Maintain stock levels between minimum and maximum thresholds</li>
              <li>Record entries and exits promptly for accurate inventory</li>
              <li>Review total inventory value regularly for budget planning</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MaterialEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSuccess={() => {
          setShowEntryModal(false);
          loadMaterials();
        }}
      />

      <MaterialExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onSuccess={() => {
          setShowExitModal(false);
          loadMaterials();
        }}
        propertyId={propertyId}
      />
    </div>
  );
}
