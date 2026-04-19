'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Home, Users, TrendingUp, DollarSign, Package, 
  Sparkles, CheckCircle, ArrowUpRight, BarChart3,
  Calendar, Bell, Award, Shield, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: { total: 0, active: 0 },
    flats: { total: 0, available: 0, sold: 0, booked: 0 },
    leads: { total: 0, qualified: 0, won: 0, conversionRate: 0 },
    bookings: { total: 0, confirmed: 0, totalRevenue: 0, totalPaid: 0 },
    payments: { totalPayments: 0, completedAmount: 0, pendingAmount: 0 },
    employees: { total: 0 },
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      const [flatsRes, bookingsRes, paymentsRes, leadsRes, propertiesRes, employeesRes] = await Promise.allSettled([
        apiService.get('/flats/stats'),
        apiService.get('/bookings/statistics'),
        apiService.get('/payments/statistics'),
        apiService.get('/leads/statistics'),
        apiService.get('/properties'),
        apiService.get('/employees?limit=1'),
      ]);

      const flats      = flatsRes.status      === 'fulfilled' ? (flatsRes.value as any)      : null;
      const bookings   = bookingsRes.status   === 'fulfilled' ? (bookingsRes.value as any)   : null;
      const payments   = paymentsRes.status   === 'fulfilled' ? (paymentsRes.value as any)   : null;
      const leads      = leadsRes.status      === 'fulfilled' ? (leadsRes.value as any)      : null;
      const properties = propertiesRes.status === 'fulfilled' ? (propertiesRes.value as any) : null;
      const employees  = employeesRes.status  === 'fulfilled' ? (employeesRes.value as any)  : null;

      setStats({
        properties: {
          total:  Array.isArray(properties) ? properties.length : (properties?.total ?? properties?.data?.length ?? 0),
          active: Array.isArray(properties) ? properties.filter((p: any) => p.isActive !== false).length : 0,
        },
        flats: {
          total:     flats?.total     ?? 0,
          available: flats?.available ?? 0,
          sold:      flats?.sold      ?? 0,
          booked:    flats?.booked    ?? 0,
        },
        leads: {
          total:          leads?.total          ?? 0,
          qualified:      leads?.qualified       ?? 0,
          won:            leads?.won             ?? 0,
          conversionRate: leads?.conversionRate  ?? 0,
        },
        bookings: {
          total:        bookings?.total        ?? 0,
          confirmed:    bookings?.confirmed    ?? 0,
          totalRevenue: bookings?.totalRevenue ?? 0,
          totalPaid:    bookings?.totalPaid    ?? 0,
        },
        payments: {
          totalPayments:   payments?.totalPayments   ?? 0,
          completedAmount: payments?.completedAmount ?? 0,
          pendingAmount:   payments?.pendingAmount   ?? 0,
        },
        employees: {
          total: employees?.meta?.total ?? employees?.total ?? 0,
        },
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number | null | undefined) => {
    const safe = Number(n);
    const v = Number.isFinite(safe) ? safe : 0;
    return v >= 10_000_000 ? `₹${(v / 10_000_000).toFixed(1)}Cr`
      : v >= 100_000  ? `₹${(v / 100_000).toFixed(1)}L`
      : v >= 1_000    ? `₹${(v / 1_000).toFixed(0)}K`
      : `₹${v}`;
  };

  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div 
          className={`mb-8 transform transition-all duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-5 md:p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 md:p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg">
                    <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-red-700 via-red-600 to-orange-600 bg-clip-text text-transparent">
                      Eastern Estate
                    </h1>
                    <p className="text-gray-600 mt-0.5 flex items-center gap-2 text-sm md:text-base italic">
                      <Heart className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      Life Long Bonding...
                    </p>
                  </div>
                </div>
                
                {user?.firstName && (
                  <div className="mt-4">
                    <p className="text-lg text-gray-700">
                      Hello, <span className="font-bold text-red-700">{user.firstName} {user.lastName}</span> 👋
                    </p>
                    {user?.roles && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.roles.map((r: any, idx: number) => (
                          <span 
                            key={idx} 
                            className="px-4 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                          >
                            {typeof r === 'string' ? r : (r.displayName || r.name || 'Role')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Today</p>
                  <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                  <Bell className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Updates</p>
                  <p className="text-sm font-bold text-gray-900">All Clear</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div 
          className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 transform transition-all duration-1000 delay-150 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Inventory Card */}
          <Link href="/towers" className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Inventory</p>
              {loading ? <Skeleton className="h-9 w-16 mb-2" /> : <p className="text-3xl font-bold text-gray-900 mb-2">{stats.flats.total}</p>}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {loading ? '-' : stats.flats.available} Available
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{loading ? '-' : stats.flats.sold} Sold</span>
              </div>
            </div>
          </Link>

          {/* Bookings Card */}
          <Link href="/bookings" className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Bookings</p>
              {loading ? <Skeleton className="h-9 w-16 mb-2" /> : <p className="text-3xl font-bold text-gray-900 mb-2">{stats.bookings.total}</p>}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {loading ? '-' : stats.bookings.confirmed} Confirmed
                </span>
              </div>
            </div>
          </Link>

          {/* Employees Card */}
          <Link href="/employees" className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Team</p>
              {loading ? <Skeleton className="h-9 w-16 mb-2" /> : <p className="text-3xl font-bold text-gray-900 mb-2">{stats.employees.total}</p>}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-600 font-medium flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  Active employees
                </span>
              </div>
            </div>
          </Link>

          {/* Revenue Card */}
          <Link href="/payments" className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Revenue Collected</p>
              {loading ? <Skeleton className="h-9 w-24 mb-2" /> : <p className="text-3xl font-bold text-gray-900 mb-2">{fmt(stats.payments.completedAmount)}</p>}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-600 font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  {loading ? '-' : fmt(stats.payments.pendingAmount)} Pending
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transform transition-all duration-1000 delay-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Bookings Overview */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bookings Overview</h3>
                <p className="text-sm text-gray-600">Current status</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Bookings</p>
                  <p className="text-xs text-gray-600">All time</p>
                </div>
                {loading ? <Skeleton className="h-8 w-10" /> : <div className="text-2xl font-bold text-green-600">{stats.bookings.total}</div>}
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Confirmed</p>
                  <p className="text-xs text-gray-600">Active bookings</p>
                </div>
                {loading ? <Skeleton className="h-8 w-10" /> : <div className="text-2xl font-bold text-blue-600">{stats.bookings.confirmed}</div>}
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Revenue</p>
                  <p className="text-xs text-gray-600">{loading ? '-' : fmt(stats.bookings.totalPaid)} collected</p>
                </div>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-purple-600">{fmt(stats.bookings.totalRevenue)}</div>}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                <p className="text-sm text-gray-600">Real-time insights</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const soldPct = stats.flats.total > 0 ? Math.round(((stats.flats.total - stats.flats.available) / stats.flats.total) * 100) : 0;
                const collectionPct = stats.bookings.totalRevenue > 0 ? Math.round((stats.bookings.totalPaid / stats.bookings.totalRevenue) * 100) : 0;
                const bookingPct = stats.flats.total > 0 ? Math.round((stats.flats.booked / stats.flats.total) * 100) : 0;
                return (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-700 font-medium">Inventory Sold</span>
                        {loading ? <Skeleton className="h-4 w-8" /> : <span className="text-sm font-bold text-blue-600">{soldPct}%</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700" style={{ width: loading ? '0%' : `${soldPct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-700 font-medium">Collection Rate</span>
                        {loading ? <Skeleton className="h-4 w-8" /> : <span className="text-sm font-bold text-green-600">{collectionPct}%</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700" style={{ width: loading ? '0%' : `${collectionPct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-700 font-medium">Units Booked</span>
                        {loading ? <Skeleton className="h-4 w-8" /> : <span className="text-sm font-bold text-purple-600">{bookingPct}%</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700" style={{ width: loading ? '0%' : `${bookingPct}%` }} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Properties & Team */}
          <Link href="/properties" className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">At a Glance</h3>
                <p className="text-sm text-gray-600">Portfolio overview</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-gray-900">Projects</p>
                </div>
                {loading ? <Skeleton className="h-7 w-8" /> : <p className="text-xl font-bold text-purple-600">{stats.properties.total}</p>}
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-medium text-gray-900">Units Booked</p>
                </div>
                {loading ? <Skeleton className="h-7 w-8" /> : <p className="text-xl font-bold text-red-600">{stats.flats.booked}</p>}
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-gray-900">Team Members</p>
                </div>
                {loading ? <Skeleton className="h-7 w-8" /> : <p className="text-xl font-bold text-green-600">{stats.employees.total}</p>}
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div 
          className={`transform transition-all duration-1000 delay-450 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 md:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="p-2.5 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600 text-sm hidden md:block">Navigate to your frequently used modules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[
                { href: '/properties',              label: 'Properties', sub: 'Manage',   Icon: Building2,    from: 'from-red-50',    to: 'to-orange-50',   border: 'hover:border-red-200',    color: 'text-red-600' },
                { href: '/towers',                  label: 'Inventory',  sub: 'View',     Icon: Home,         from: 'from-blue-50',   to: 'to-indigo-50',   border: 'hover:border-blue-200',   color: 'text-blue-600' },
                { href: '/customers',               label: 'Customers',  sub: 'Manage',   Icon: Users,        from: 'from-green-50',  to: 'to-emerald-50',  border: 'hover:border-green-200',  color: 'text-green-600' },
                { href: '/bookings',                label: 'Bookings',   sub: 'Review',   Icon: CheckCircle,  from: 'from-purple-50', to: 'to-pink-50',     border: 'hover:border-purple-200', color: 'text-purple-600' },
                { href: '/construction/materials',  label: 'Materials',  sub: 'Stock',    Icon: Package,      from: 'from-orange-50', to: 'to-red-50',      border: 'hover:border-orange-200', color: 'text-orange-600' },
                { href: '/payments',                label: 'Payments',   sub: 'Track',    Icon: DollarSign,   from: 'from-yellow-50', to: 'to-amber-50',    border: 'hover:border-yellow-200', color: 'text-yellow-600' },
              ].map(({ href, label, sub, Icon, from, to, border, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group p-3 md:p-6 bg-gradient-to-br ${from} ${to} rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent ${border}`}
                >
                  <div className="p-2 md:p-4 bg-white rounded-xl mb-2 md:mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                    <Icon className={`h-5 w-5 md:h-8 md:w-8 ${color}`} />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 hidden sm:block">{sub}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div 
          className={`mt-8 text-center transform transition-all duration-1000 delay-600 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Heart className="h-3.5 w-3.5 text-red-400" />
            Eastern Estate - <span className="italic">Life Long Bonding...</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
