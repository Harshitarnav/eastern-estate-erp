'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function ConstructionDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [projectsRes, materialsRes, vendorsRes, posRes, propsRes] = await Promise.all([
        api.get('/construction-projects').catch(() => ({ data: [] })),
        api.get('/materials').catch(() => ({ data: [] })),
        api.get('/vendors').catch(() => ({ data: [] })),
        api.get('/purchase-orders').catch(() => ({ data: [] })),
        api.get('/properties').catch(() => ({ data: [] }))
      ]);

      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []);
      const materialsData = Array.isArray(materialsRes.data) ? materialsRes.data : (materialsRes.data?.data || []);
      const vendorsData = Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data?.data || []);
      const posData = Array.isArray(posRes.data) ? posRes.data : (posRes.data?.data || []);
      const propsData = Array.isArray(propsRes.data) ? propsRes.data : (propsRes.data?.data || []);

      setProjects(projectsData);
      setMaterials(materialsData);
      setVendors(vendorsData);
      setPurchaseOrders(posData);
      setProperties(propsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / projects.length)
    : 0;
  const lowStockMaterials = materials.filter(m => (m.currentStock || 0) <= (m.minimumStock || 0));
  const pendingPOs = purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'PENDING_APPROVAL');
  const activeVendors = vendors.filter(v => v.isActive);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading Construction Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Eastern Estate Branded Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl" style={{ backgroundColor: '#A8211B' }}>
            🏗️
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#A8211B' }}>
              Construction & Purchases
            </h1>
            <p className="text-sm text-gray-500">Eastern Estate ERP System - Site Management Dashboard</p>
          </div>
        </div>
        <p className="text-gray-600 text-lg">
          Comprehensive overview of all construction projects, materials, vendors, and purchases
        </p>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-5 border-l-4" style={{ borderColor: '#A8211B' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Projects</p>
            <div className="text-2xl">🏗️</div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
          <p className="text-xs text-gray-500 mt-1">{activeProjects.length} active</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Active Projects</p>
            <div className="text-2xl">✅</div>
          </div>
          <p className="text-3xl font-bold">{activeProjects.length}</p>
          <p className="text-xs text-green-100 mt-1">In Progress</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Avg Progress</p>
            <div className="text-2xl">📊</div>
          </div>
          <p className="text-3xl font-bold">{avgProgress}%</p>
          <p className="text-xs text-blue-100 mt-1">Completion rate</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Materials</p>
            <div className="text-2xl">🧱</div>
          </div>
          <p className="text-3xl font-bold">{materials.length}</p>
          <p className="text-xs text-orange-100 mt-1">{lowStockMaterials.length} low stock</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Purchase Orders</p>
            <div className="text-2xl">🛒</div>
          </div>
          <p className="text-3xl font-bold">{purchaseOrders.length}</p>
          <p className="text-xs text-purple-100 mt-1">{pendingPOs.length} pending</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <button
          onClick={() => router.push('/construction/inventory')}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-500 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-all">
              🏗️
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Site Inventory</h3>
          <p className="text-gray-600 text-sm mb-3">View all properties, towers & flats</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-gray-500">Properties</p>
              <p className="font-bold text-gray-900">{properties.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Quick Access</p>
              <p className="font-bold text-blue-600">View Hierarchy</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/construction/materials')}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-orange-500 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-all">
              🧱
            </div>
            {lowStockMaterials.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {lowStockMaterials.length} Alert{lowStockMaterials.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Material Inventory</h3>
          <p className="text-gray-600 text-sm mb-3">Track stock levels, entries & exits</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Items</p>
              <p className="font-bold text-gray-900">{materials.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Low Stock</p>
              <p className="font-bold text-red-600">{lowStockMaterials.length}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/construction/purchase-orders')}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-purple-500 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-purple-100 group-hover:bg-purple-500 group-hover:text-white transition-all">
              🛒
            </div>
            {pendingPOs.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingPOs.length} Pending
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Purchase Orders</h3>
          <p className="text-gray-600 text-sm mb-3">Create & track material orders</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total POs</p>
              <p className="font-bold text-gray-900">{purchaseOrders.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="font-bold text-yellow-600">{pendingPOs.length}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/construction/vendors')}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-green-500 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-green-100 group-hover:bg-green-500 group-hover:text-white transition-all">
              🤝
            </div>
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {activeVendors.length} Active
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Vendors</h3>
          <p className="text-gray-600 text-sm mb-3">Manage suppliers & payments</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-bold text-gray-900">{vendors.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Outstanding</p>
              <p className="font-bold text-red-600">
                {formatCurrency(vendors.reduce((sum, v) => sum + (v.outstandingAmount || 0), 0))}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/construction/projects')}
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-500 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-all">
              📋
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">All Projects</h3>
          <p className="text-gray-600 text-sm mb-3">View detailed project list</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-bold text-gray-900">{projects.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Progress</p>
              <p className="font-bold text-blue-600">{avgProgress}%</p>
            </div>
          </div>
        </button>
      </div>

      {/* Active Projects Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: '#A8211B' }}>
            Active Construction Projects
          </h2>
          <button
            onClick={() => router.push('/construction/projects')}
            className="text-sm font-medium hover:underline"
            style={{ color: '#A8211B' }}
          >
            View All →
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="text-gray-600">No active construction projects</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/construction/projects/${project.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{project.projectName}</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-medium">{project.property?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span>{new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{formatCurrency(project.budgetAllocated || 0)}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold" style={{ color: '#A8211B' }}>
                      {project.overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${project.overallProgress}%`,
                        backgroundColor: '#A8211B'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts & Notifications */}
      {(lowStockMaterials.length > 0 || pendingPOs.length > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-2">Attention Required</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                {lowStockMaterials.length > 0 && (
                  <li>• {lowStockMaterials.length} material{lowStockMaterials.length > 1 ? 's' : ''} running low on stock</li>
                )}
                {pendingPOs.length > 0 && (
                  <li>• {pendingPOs.length} purchase order{pendingPOs.length > 1 ? 's' : ''} pending approval/action</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 border-2" style={{ borderColor: '#A8211B' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#A8211B' }}>
            📊
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#A8211B' }}>
            Dashboard Overview
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Construction Status</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>In Progress:</span>
                <span className="font-bold text-green-600">{activeProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Planning:</span>
                <span className="font-bold text-blue-600">
                  {projects.filter(p => p.status === 'PLANNING').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>On Hold:</span>
                <span className="font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'ON_HOLD').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-bold text-gray-600">
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Material Status</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-bold">{materials.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="font-bold text-green-600">
                  {materials.filter(m => m.isActive).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Low Stock:</span>
                <span className="font-bold text-red-600">{lowStockMaterials.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-bold">
                  {formatCurrency(materials.reduce((sum, m) => sum + ((m.currentStock || 0) * (m.unitPrice || 0)), 0))}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Vendor Status</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Vendors:</span>
                <span className="font-bold">{vendors.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="font-bold text-green-600">{activeVendors.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Outstanding:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(vendors.reduce((sum, v) => sum + (v.outstandingAmount || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Rating:</span>
                <span className="font-bold">
                  {vendors.length > 0 
                    ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1)
                    : '0.0'
                  }⭐
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Purchase Orders</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total POs:</span>
                <span className="font-bold">{purchaseOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-yellow-600">{pendingPOs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Approved:</span>
                <span className="font-bold text-blue-600">
                  {purchaseOrders.filter(po => po.status === 'APPROVED' || po.status === 'SENT').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-bold">
                  {formatCurrency(purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Help & Instructions Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 border-2 border-blue-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl" style={{ backgroundColor: '#A8211B' }}>
            📚
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: '#A8211B' }}>
              Construction & Purchases Dashboard Guide
            </h2>
            <p className="text-gray-600">Complete guide for site engineers, project managers, and procurement teams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* What is this page for? */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-blue-900">🎯 What is this Dashboard For?</h3>
            <p className="text-gray-700 mb-4">
              The Construction & Purchases Dashboard is the central hub for managing all construction-related activities 
              and material procurement for Eastern Estate projects. It provides real-time visibility into:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li><strong>Active Projects:</strong> Track progress, budget, and timelines across all construction sites</li>
              <li><strong>Material Inventory:</strong> Monitor stock levels, identify low inventory, prevent shortages</li>
              <li><strong>Purchase Orders:</strong> Create and track material orders, manage vendor relationships</li>
              <li><strong>Vendor Management:</strong> Track supplier performance, payments, and outstanding amounts</li>
              <li><strong>Budget Control:</strong> Monitor spending against allocated budgets for each project</li>
              <li><strong>Resource Planning:</strong> Ensure materials are available when needed for construction activities</li>
            </ul>
          </div>

          {/* Who should use this? */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-green-900">👥 Who Should Use This Dashboard?</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🏗️ Site Engineers & Project Managers</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Monitor project progress and timelines</li>
                  <li>• Request materials for ongoing work</li>
                  <li>• Log daily progress and issues</li>
                  <li>• Track team performance and schedules</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🛒 Procurement Team</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Create and approve purchase orders</li>
                  <li>• Manage vendor relationships</li>
                  <li>• Track material deliveries</li>
                  <li>• Monitor inventory levels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💼 Management & Executives</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Get high-level overview of all projects</li>
                  <li>• Monitor budget utilization</li>
                  <li>• Review vendor performance</li>
                  <li>• Identify potential bottlenecks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📊 Accounts & Finance</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Track vendor payments and outstanding amounts</li>
                  <li>• Review purchase order costs</li>
                  <li>• Monitor project budget vs actual spend</li>
                  <li>• Process vendor invoices</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to use each section */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-purple-900">📖 How to Use Each Section</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">🧱 Material Inventory</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> Track all construction materials, from cement to paint
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Quick Actions:</strong> Add materials → Record entries (when stock arrives) → 
                  Issue exits (when used on site) → Monitor low stock alerts
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">🛒 Purchase Orders</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> Formal orders to vendors for material procurement
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Quick Actions:</strong> Create PO → Add line items → Calculate totals → 
                  Send to vendor → Track delivery → Record payment
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">🤝 Vendors</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> Manage supplier relationships and track payments
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Quick Actions:</strong> Register vendor → Set credit limits → 
                  Record payments → Rate performance → Monitor outstanding amounts
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">📋 All Projects</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Purpose:</strong> Detailed view of construction projects
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Quick Actions:</strong> View project details → Update progress → 
                  Log daily work → Manage teams → Track milestones
                </p>
              </div>
            </div>
          </div>

          {/* Common workflows */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-red-900">🔄 Common Workflows</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📦 Ordering Materials</h4>
                <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                  <li>Check Material Inventory for low stock items</li>
                  <li>Click "Purchase Orders" → Create new PO</li>
                  <li>Select vendor and add required materials</li>
                  <li>Review totals and submit for approval</li>
                  <li>Once delivered, record material entry in Inventory</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🏗️ Using Materials on Site</h4>
                <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                  <li>Go to Material Inventory page</li>
                  <li>Find the material you need to issue</li>
                  <li>Click "Issue Material" button</li>
                  <li>Select project, enter quantity and purpose</li>
                  <li>System updates stock automatically</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💰 Paying Vendors</h4>
                <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                  <li>Go to Vendors page</li>
                  <li>Find vendor with outstanding amount</li>
                  <li>Click "Record Payment" button</li>
                  <li>Enter amount, payment method, and reference</li>
                  <li>System updates outstanding balance</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📊 Tracking Project Progress</h4>
                <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                  <li>View project card on main dashboard</li>
                  <li>Click project to see detailed view</li>
                  <li>Log daily progress with work completed</li>
                  <li>Upload photos showing construction status</li>
                  <li>Update completion percentage</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Key metrics explained */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-indigo-900">📊 Understanding Dashboard Metrics</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Total Projects</h4>
                <p className="text-sm text-gray-700">
                  Count of all construction projects (active, planning, on-hold, completed)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Active Projects</h4>
                <p className="text-sm text-gray-700">
                  Projects currently under construction (status: IN_PROGRESS)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Average Progress</h4>
                <p className="text-sm text-gray-700">
                  Average completion percentage across all projects
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Materials Count</h4>
                <p className="text-sm text-gray-700">
                  Total unique materials in inventory, with low stock alert count
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Purchase Orders</h4>
                <p className="text-sm text-gray-700">
                  Total POs created, with count of those pending approval
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-600">⚠️ Alert Badge</h4>
                <p className="text-sm text-gray-700">
                  Red/Yellow badges indicate items needing immediate attention
                </p>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-xl font-bold mb-4 text-orange-900">🔧 Troubleshooting & Tips</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">No Projects Showing?</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Ensure test data has been loaded (run construction-complete-test-data.sql)</li>
                  <li>• Check that backend API is running (port 3001)</li>
                  <li>• Verify database connection is active</li>
                  <li>• Try refreshing the page</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Low Stock Alerts Not Showing?</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Go to Material Inventory and check minimum stock levels</li>
                  <li>• Materials show as low stock when current ≤ minimum</li>
                  <li>• Update minimum stock thresholds if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Cannot Create Purchase Order?</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Ensure at least one vendor is registered</li>
                  <li>• Add materials to inventory first</li>
                  <li>• Check that all required fields are filled</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Pro Tips for Efficient Use:</h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Set minimum stock levels 20-30% above normal usage</li>
                  <li>• Review low stock alerts every morning</li>
                  <li>• Create POs in batches to negotiate better prices</li>
                  <li>• Update project progress daily for accurate tracking</li>
                  <li>• Use material exit feature to track which projects use what</li>
                  <li>• Pay vendors on time to maintain good relationships</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick reference card */}
        <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200">
          <h3 className="text-xl font-bold mb-4" style={{ color: '#A8211B' }}>
            ⚡ Quick Reference Card
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📦 Need Materials?</h4>
              <p className="text-gray-700">Materials → Check Stock → Create PO → Record Entry</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🏗️ Use Materials?</h4>
              <p className="text-gray-700">Materials → Find Item → Issue Exit → Select Project</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">💰 Pay Vendor?</h4>
              <p className="text-gray-700">Vendors → Find Vendor → Record Payment → Enter Details</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📊 Update Progress?</h4>
              <p className="text-gray-700">Projects → Select Project → Log Progress → Upload Photos</p>
            </div>
          </div>
        </div>

        {/* Data setup instructions */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">First Time Setup Required</h3>
              <p className="text-yellow-800 mb-3">
                If you're seeing empty data or no projects, you need to load the test data first:
              </p>
              <div className="bg-white rounded p-4 border border-yellow-300">
                <p className="font-mono text-sm text-gray-800 mb-2">
                  cd backend && psql -U your_username -d your_database -f construction-complete-test-data.sql
                </p>
                <p className="text-xs text-gray-600">
                  This will create: 5 projects, 26 materials, 7 vendors, 5 purchase orders, and sample transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
