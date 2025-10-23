'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  X, Building2, LayoutDashboard, Home, TrendingUp, Users, 
  Calendar, DollarSign, Calculator, Hammer, Package, 
  ShoppingCart, Briefcase, MessageSquare, BarChart3, 
  Settings, ChevronDown, Target, Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['sales', 'property-inventory']);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path: string) => pathname === path;
  const isChildActive = (paths: string[]) => paths.some(path => pathname === path || pathname?.startsWith(path + '/'));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
    { 
      id: 'property-inventory', 
      label: 'Property Inventory', 
      icon: Building2,
      children: [
        { id: 'properties', label: 'Properties', icon: Building2, href: '/properties' },
        { id: 'towers', label: 'Towers', icon: Building2, href: '/towers' },
        { id: 'flats', label: 'Flats', icon: Home, href: '/flats' },
      ]
    },
    { 
      id: 'sales', 
      label: 'Sales & CRM', 
      icon: TrendingUp,
      children: [
        { id: 'sales-dashboard', label: 'Sales Dashboard', icon: BarChart3, href: '/sales' },
        { id: 'leads', label: 'Leads', icon: Target, href: '/leads' },
        { id: 'customers', label: 'Customers', icon: Users, href: '/customers' },
        { id: 'bookings', label: 'Bookings', icon: Calendar, href: '/bookings' },
      ]
    },
    { id: 'payments', label: 'Payments', icon: DollarSign, href: '/payments' },
    { 
      id: 'accounting', 
      label: 'Accounting', 
      icon: Calculator,
      children: [
        { id: 'accounting-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/accounting' },
        { id: 'accounts', label: 'Chart of Accounts', icon: BarChart3, href: '/accounting/accounts' },
        { id: 'expenses', label: 'Expenses', icon: DollarSign, href: '/accounting/expenses' },
        { id: 'budgets', label: 'Budgets', icon: TrendingUp, href: '/accounting/budgets' },
        { id: 'reports', label: 'Reports', icon: BarChart3, href: '/accounting/reports' },
      ]
    },
    { 
      id: 'construction', 
      label: 'Construction', 
      icon: Hammer,
      children: [
        { id: 'construction-overview', label: 'Overview', icon: LayoutDashboard, href: '/construction' },
        { id: 'projects', label: 'Projects', icon: Building2, href: '/construction/projects' },
        { id: 'teams', label: 'Teams', icon: Users, href: '/construction/teams' },
        { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, href: '/construction/progress' },
        { id: 'materials', label: 'Materials', icon: Package, href: '/construction/materials' },
        { id: 'vendors', label: 'Vendors', icon: Users, href: '/construction/vendors' },
        { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, href: '/construction/purchase-orders' },
      ]
    },
    // { id: 'inventory', label: 'Inventory', icon: Package, href: '/inventory' },
    { id: 'employees', label: 'Employees', icon: Briefcase, href: '/employees' },
    { id: 'marketing', label: 'Marketing', icon: MessageSquare, href: '/marketing' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className={`
      fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: '#F3E3C1' }}>
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8" style={{ color: '#A8211B' }} />
            <span className="font-bold text-lg" style={{ color: '#7B1E12' }}>Eastern Estate</span>
          </div>
          <button onClick={onClose} className="lg:hidden hover:bg-gray-100 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children;
              const isExpanded = expandedMenus.includes(item.id);
              const isItemActive = item.href ? isActive(item.href) : false;
              const hasActiveChild = hasChildren && isChildActive(item.children!.map(c => c.href));

              return (
                <div key={item.id}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasActiveChild 
                          ? 'text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={hasActiveChild ? { backgroundColor: '#A8211B' } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={handleLinkClick}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isItemActive 
                          ? 'text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={isItemActive ? { backgroundColor: '#A8211B' } : {}}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 pl-3" style={{ borderColor: '#F3E3C1' }}>
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildItemActive = isActive(child.href);
                        
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isChildItemActive 
                                ? 'text-white font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            style={isChildItemActive ? { backgroundColor: '#A8211B' } : {}}
                          >
                            <ChildIcon className="h-4 w-4" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="border-t p-4" style={{ borderColor: '#F3E3C1' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#A8211B' }}>
              <span className="text-white font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#7B1E12' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
