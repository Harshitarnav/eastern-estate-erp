'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Home, Users, TrendingUp, DollarSign, Package, 
  Sparkles, Target, CheckCircle, ArrowUpRight, BarChart3,
  Calendar, Bell, Award, Shield, Zap, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ===== DATA FETCHING - COMMENTED OUT FOR NOW =====
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: { total: 0, active: 0 },
    flats: { total: 0, available: 0, sold: 0 },
    leads: { total: 0, hot: 0, qualified: 0 },
    customers: { total: 0, active: 0 },
    bookings: { total: 0, confirmed: 0, totalValue: 0 },
    payments: { total: 0, totalReceived: 0, pending: 0 },
  });

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      // API calls here
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };
  ================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
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
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 via-red-600 to-orange-600 bg-clip-text text-transparent">
                      Welcome to Eastern Estate
                    </h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Building Homes, Nurturing Bonds
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
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transform transition-all duration-1000 delay-150 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Properties Card */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-6 w-6 text-red-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Properties</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Active
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Tracking</span>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Inventory</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">Ready</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Available
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Units</span>
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Customers</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">Growing</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  Engaged
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Active</span>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">Tracking</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-600 font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transform transition-all duration-1000 delay-300 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Sales Pipeline */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sales Pipeline</h3>
                <p className="text-sm text-gray-600">Track your leads</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Leads</p>
                  <p className="text-xs text-gray-600">Hot prospects</p>
                </div>
                <div className="text-2xl font-bold text-yellow-600">—</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Qualified</p>
                  <p className="text-xs text-gray-600">Ready to close</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">—</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Conversions</p>
                  <p className="text-xs text-gray-600">Success rate</p>
                </div>
                <div className="text-2xl font-bold text-green-600">—</div>
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
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">Property Occupancy</span>
                  <span className="text-sm font-bold text-blue-600">Ready</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" style={{ width: '0%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">Collection Rate</span>
                  <span className="text-sm font-bold text-green-600">Ready</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" style={{ width: '0%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">Project Progress</span>
                  <span className="text-sm font-bold text-purple-600">Ready</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
                <p className="text-sm text-gray-600">Your milestones</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">System Active</p>
                  <p className="text-xs text-gray-600">All systems operational</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fast Access</p>
                  <p className="text-xs text-gray-600">Quick navigation ready</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Data Secure</p>
                  <p className="text-xs text-gray-600">Protected & encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className={`transform transition-all duration-1000 delay-450 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                <Sparkles className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600">Navigate to your frequently used modules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link
                href="/properties"
                className="group p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-red-200"
              >
                <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Properties</p>
                <p className="text-xs text-gray-600 mt-1">Manage</p>
              </Link>
              
              <Link
                href="/towers"
                className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
              >
                <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Inventory</p>
                <p className="text-xs text-gray-600 mt-1">View</p>
              </Link>
              
              <Link
                href="/leads"
                className="group p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-yellow-200"
              >
                <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Leads</p>
                <p className="text-xs text-gray-600 mt-1">Track</p>
              </Link>
              
              <Link
                href="/customers"
                className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200"
              >
                <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Customers</p>
                <p className="text-xs text-gray-600 mt-1">Manage</p>
              </Link>
              
              <Link
                href="/bookings"
                className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200"
              >
                <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Bookings</p>
                <p className="text-xs text-gray-600 mt-1">Review</p>
              </Link>
              
              <Link
                href="/construction/inventory"
                className="group p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-orange-200"
              >
                <div className="p-4 bg-white rounded-xl mb-3 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Materials</p>
                <p className="text-xs text-gray-600 mt-1">Stock</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div 
          className={`mt-8 text-center transform transition-all duration-1000 delay-600 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="text-gray-600 text-sm">
            Powered by Eastern Estate ERP • Making property management seamless
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
