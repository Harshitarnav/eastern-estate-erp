'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Home, Users, TrendingUp, DollarSign, ShoppingCart, Package, Briefcase, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { propertiesService } from '@/services/properties.service';
import { flatsService } from '@/services/flats.service';
import { leadsService } from '@/services/leads.service';
import { customersService } from '@/services/customers.service';
import { bookingsService } from '@/services/bookings.service';
import { paymentsService } from '@/services/payments.service';
import { materialsService } from '@/services/materials.service';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: { total: 0, active: 0 },
    flats: { total: 0, available: 0, sold: 0 },
    leads: { total: 0, hot: 0, qualified: 0, conversionRate: 0 },
    customers: { total: 0, active: 0 },
    bookings: { total: 0, confirmed: 0, totalValue: 0 },
    payments: { total: 0, totalReceived: 0, pending: 0 },
    inventory: { total: 0, lowStock: 0, totalValue: 0 },
    construction: { total: 0, inProgress: 0, avgProgress: 0 },
    purchaseOrders: { total: 0, pending: 0, totalAmount: 0 },
  });

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      
      const [
        propertiesStats,
        flatsStats,
        leadsStats,
        customersStats,
        bookingsStats,
        paymentsStats,
        inventoryStats,
        constructionStats,
        poStats,
      ] = await Promise.all([
        propertiesService.getStatistics().catch(() => ({ total: 0, active: 0 })),
        flatsService.getStatistics().catch(() => ({ total: 0, available: 0, sold: 0 })),
        leadsService.getStatistics().catch(() => ({ total: 0, hot: 0, qualified: 0, conversionRate: 0 })),
        customersService.getStatistics().catch(() => ({ total: 0, active: 0 })),
        bookingsService.getStatistics().catch(() => ({ total: 0, confirmed: 0, totalValue: 0 })),
        paymentsService.getStatistics().catch(() => ({ total: 0, totalReceived: 0, pending: 0 })),
        materialsService.getStatistics().catch(() => ({ total: 0, lowStock: 0, totalValue: 0 })),
        Promise.resolve({ total: 0, inProgress: 0, avgProgress: 0 }), // Construction stats
        Promise.resolve({ total: 0, pending: 0, totalAmount: 0 }), // PO stats
      ]);

      setStats({
        properties: propertiesStats,
        flats: flatsStats,
        leads: leadsStats,
        customers: customersStats,
        bookings: bookingsStats,
        payments: paymentsStats,
        inventory: inventoryStats,
        construction: constructionStats,
        purchaseOrders: poStats,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A8211B' }}></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#7B1E12' }}>
          Dashboard
        </h1>
        <p className="text-gray-600">Welcome to Eastern Estate ERP • Building Homes, Nurturing Bonds</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#A8211B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Properties</p>
              <p className="text-3xl font-bold" style={{ color: '#7B1E12' }}>{stats.properties.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.properties.active || 0} active</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3E2' }}>
              <Building2 className="h-8 w-8" style={{ color: '#A8211B' }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Flats</p>
              <p className="text-3xl font-bold text-blue-600">{stats.flats.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.flats.available || 0} available</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.payments.totalReceived || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">from {stats.payments.total || 0} payments</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-green-600">{stats.customers.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.customers.active || 0} active</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>Sales Pipeline</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">Leads</p>
                  <p className="text-sm text-yellow-700">{stats.leads.hot || 0} hot leads</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.leads.total || 0}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Customers</p>
                  <p className="text-sm text-green-700">{stats.customers.active || 0} active</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.customers.total || 0}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Bookings</p>
                  <p className="text-sm text-blue-700">{stats.bookings.confirmed || 0} confirmed</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.bookings.total || 0}</p>
            </div>

            {(stats.leads.total || 0) > 0 && (
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">{(stats.leads.conversionRate || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${stats.leads.conversionRate || 0}%`,
                      backgroundColor: '#3DA35D',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>Financial Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Booking Value</span>
                <span className="font-bold" style={{ color: '#3DA35D' }}>
                  {formatCurrency(stats.bookings.totalValue || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: '100%', backgroundColor: '#3DA35D' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payments Received</span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(stats.payments.totalReceived || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-purple-600" 
                  style={{ 
                    width: `${(stats.bookings.totalValue || 0) > 0 ? ((stats.payments.totalReceived || 0) / (stats.bookings.totalValue || 1)) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Pending Payments</span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(stats.payments.pending || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-orange-600" 
                  style={{ 
                    width: `${(stats.bookings.totalValue || 0) > 0 ? ((stats.payments.pending || 0) / (stats.bookings.totalValue || 1)) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>

            <div className="pt-3 border-t grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-xl font-bold">{stats.payments.total || 0}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg. Payment</p>
                <p className="text-xl font-bold">
                  {(stats.payments.total || 0) > 0 ? formatCurrency((stats.payments.totalReceived || 0) / (stats.payments.total || 1)) : '₹0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6" style={{ color: '#A8211B' }} />
            <h3 className="font-bold" style={{ color: '#7B1E12' }}>Inventory</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items</span>
              <span className="font-bold">{stats.inventory.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Value</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.inventory.totalValue || 0)}</span>
            </div>
            {(stats.inventory.lowStock || 0) > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{stats.inventory.lowStock || 0} low stock items</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-6 w-6" style={{ color: '#A8211B' }} />
            <h3 className="font-bold" style={{ color: '#7B1E12' }}>Purchase Orders</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-bold">{stats.purchaseOrders.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold text-blue-600">{formatCurrency(stats.purchaseOrders.totalAmount || 0)}</span>
            </div>
            {(stats.purchaseOrders.pending || 0) > 0 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-yellow-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{stats.purchaseOrders.pending || 0} pending approval</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6" style={{ color: '#A8211B' }} />
            <h3 className="font-bold" style={{ color: '#7B1E12' }}>Construction</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Projects</span>
              <span className="font-bold">{stats.construction.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-bold text-blue-600">{stats.construction.inProgress || 0}</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg. Progress</span>
                <span className="font-semibold">{(stats.construction.avgProgress || 0).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${stats.construction.avgProgress || 0}%`,
                    backgroundColor: '#6366F1',
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/properties"
            className="p-4 border-2 border-dashed rounded-lg text-center hover:border-solid hover:bg-red-50 transition-all cursor-pointer"
            style={{ borderColor: '#A8211B' }}
          >
            <Building2 className="h-8 w-8 mx-auto mb-2" style={{ color: '#A8211B' }} />
            <p className="text-sm font-medium" style={{ color: '#7B1E12' }}>Manage Properties</p>
          </Link>
          
          <Link
            href="/leads"
            className="p-4 border-2 border-dashed border-yellow-400 rounded-lg text-center hover:border-solid hover:bg-yellow-50 transition-all cursor-pointer"
          >
            <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-yellow-900">Manage Leads</p>
          </Link>
          
          <Link
            href="/customers"
            className="p-4 border-2 border-dashed border-green-400 rounded-lg text-center hover:border-solid hover:bg-green-50 transition-all cursor-pointer"
          >
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">Manage Customers</p>
          </Link>
          
          <Link
            href="/construction/inventory"
            className="p-4 border-2 border-dashed border-blue-400 rounded-lg text-center hover:border-solid hover:bg-blue-50 transition-all cursor-pointer"
          >
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Manage Inventory</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
