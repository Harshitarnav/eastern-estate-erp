'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isConstructionOpen, setIsConstructionOpen] = useState(pathname?.startsWith('/construction'));

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">Eastern Estate ERP</h1>
      </div>
      
      <nav className="mt-4">
        {/* Dashboard */}
        <Link href="/dashboard" className={`flex items-center px-4 py-3 ${isActive('/dashboard')}`}>
          <span className="ml-3">📊 Dashboard</span>
        </Link>

        {/* Construction Dropdown */}
        <div>
          <button
            onClick={() => setIsConstructionOpen(!isConstructionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span className="flex items-center">
              <span className="ml-3">🏗️ Construction</span>
            </span>
            <span>{isConstructionOpen ? '▼' : '▶'}</span>
          </button>
          
          {isConstructionOpen && (
            <div className="ml-4 border-l-2 border-gray-200">
              <Link 
                href="/construction" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction')}`}
              >
                <span className="ml-3">📍 Overview</span>
              </Link>
              <Link 
                href="/construction/projects" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction/projects')}`}
              >
                <span className="ml-3">📊 Projects</span>
              </Link>
              <Link 
                href="/construction/teams" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction/teams')}`}
              >
                <span className="ml-3">👥 Teams</span>
              </Link>
              <Link 
                href="/construction/progress" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction/progress')}`}
              >
                <span className="ml-3">📝 Progress Tracking</span>
              </Link>
              <Link 
                href="/construction/materials" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction/materials')}`}
              >
                <span className="ml-3">📦 Materials</span>
              </Link>
              <Link 
                href="/construction/vendors" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction/vendors')}`}
              >
                <span className="ml-3">🏪 Vendors</span>
              </Link>
              <Link 
                href="/construction/purchase-orders" 
                className={`flex items-center px-4 py-2 text-sm ${isActive('/construction/purchase-orders')}`}
              >
                <span className="ml-3">📋 Purchase Orders</span>
              </Link>
            </div>
          )}
        </div>

        {/* Properties */}
        <Link href="/properties" className={`flex items-center px-4 py-3 ${isActive('/properties')}`}>
          <span className="ml-3">🏢 Properties</span>
        </Link>

        {/* Leads */}
        <Link href="/leads" className={`flex items-center px-4 py-3 ${isActive('/leads')}`}>
          <span className="ml-3">👤 Leads</span>
        </Link>

        {/* Customers */}
        <Link href="/customers" className={`flex items-center px-4 py-3 ${isActive('/customers')}`}>
          <span className="ml-3">👥 Customers</span>
        </Link>

        {/* Bookings */}
        <Link href="/bookings" className={`flex items-center px-4 py-3 ${isActive('/bookings')}`}>
          <span className="ml-3">📅 Bookings</span>
        </Link>

        {/* Employees */}
        <Link href="/employees" className={`flex items-center px-4 py-3 ${isActive('/employees')}`}>
          <span className="ml-3">💼 Employees</span>
        </Link>
      </nav>
    </aside>
  );
}
