'use client';

import { Building2, Home, Users, DollarSign, TrendingUp, Package } from 'lucide-react';

/**
 * Eastern Estate ERP - Main Dashboard
 * 
 * Displays key metrics and overview of the real estate business.
 * Designed with Eastern Estate brand philosophy: 
 * "Life Long Bonding" - Creating lasting relationships through premium living spaces.
 * 
 * Brand Colors:
 * - Eastern Red (#A8211B): Primary brand color
 * - Maroon Luxe (#7B1E12): Secondary, depth
 * - Gold Accent (#F2C94C): Prestige highlights
 * - Beige Cream (#F3E3C1): Comfort base
 */
export default function DashboardPage() {
  const stats = [
    { 
      title: 'Total Properties', 
      value: '12', 
      icon: Building2, 
      bgColor: '#A8211B',
      description: 'Across multiple cities'
    },
    { 
      title: 'Total Towers', 
      value: '48', 
      icon: Home, 
      bgColor: '#7B1E12',
      description: 'Premium residential towers'
    },
    { 
      title: 'Total Flats', 
      value: '1,450', 
      icon: Package, 
      bgColor: '#3DA35D',
      description: 'Across all properties'
    },
    { 
      title: 'Total Customers', 
      value: '892', 
      icon: Users, 
      bgColor: '#F2C94C',
      description: 'Happy families'
    },
    { 
      title: 'Total Revenue', 
      value: '₹245.2Cr', 
      icon: DollarSign, 
      bgColor: '#A8211B',
      description: 'This fiscal year'
    },
    { 
      title: 'Active Leads', 
      value: '156', 
      icon: TrendingUp, 
      bgColor: '#7B1E12',
      description: 'Potential customers'
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#7B1E12' }}>
          Welcome to Eastern Estate ERP
        </h1>
        <p className="text-gray-600">
          Building Homes. Nurturing Bonds. Creating a Lifestyle That Lasts a Lifetime.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            style={{ borderTop: `4px solid ${stat.bgColor}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#7B1E12' }}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${stat.bgColor}20` }}
              >
                <stat.icon className="h-8 w-8" style={{ color: stat.bgColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button 
              className="w-full text-left px-4 py-3 rounded-lg transition-colors hover:shadow-md"
              style={{ backgroundColor: '#FEF3E2' }}
            >
              <div className="flex items-center gap-3">
                <Building2 style={{ color: '#A8211B' }} className="h-5 w-5" />
                <span style={{ color: '#7B1E12' }} className="font-medium">Add New Property</span>
              </div>
            </button>
            <button 
              className="w-full text-left px-4 py-3 rounded-lg transition-colors hover:shadow-md"
              style={{ backgroundColor: '#FEF3E2' }}
            >
              <div className="flex items-center gap-3">
                <Users style={{ color: '#A8211B' }} className="h-5 w-5" />
                <span style={{ color: '#7B1E12' }} className="font-medium">Add New Customer</span>
              </div>
            </button>
            <button 
              className="w-full text-left px-4 py-3 rounded-lg transition-colors hover:shadow-md"
              style={{ backgroundColor: '#FEF3E2' }}
            >
              <div className="flex items-center gap-3">
                <TrendingUp style={{ color: '#A8211B' }} className="h-5 w-5" />
                <span style={{ color: '#7B1E12' }} className="font-medium">Create New Lead</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: '#3DA35D' }}></div>
              <div>
                <p className="text-sm font-medium">New booking confirmed</p>
                <p className="text-xs text-gray-500">Diamond City, Tower A - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: '#F2C94C' }}></div>
              <div>
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-gray-500">₹50,000 - 15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: '#A8211B' }}></div>
              <div>
                <p className="text-sm font-medium">New lead added</p>
                <p className="text-xs text-gray-500">From website inquiry - 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Philosophy */}
      <div 
        className="rounded-lg p-8 text-center"
        style={{ 
          background: 'linear-gradient(135deg, #A8211B 0%, #7B1E12 100%)',
          color: 'white'
        }}
      >
        <h2 className="text-2xl font-bold mb-3">Life Long Bonding</h2>
        <p className="text-lg opacity-90">
          Luxury at Affordable Prices • Building Homes, Nurturing Bonds • Creating a Lifestyle That Lasts a Lifetime
        </p>
      </div>
    </div>
  );
}
