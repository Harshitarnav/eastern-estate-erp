'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loading } from '@/components/Loading';
import { 
  Building2, Home, Users, TrendingUp, Package, Hammer, 
  Calendar, Menu, X, LogOut, Settings, LayoutDashboard,
  DollarSign, BarChart3, MessageSquare, ChevronDown, Bell,
  ShoppingCart, Briefcase, Calculator
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['property-inventory']);
  const { user, logout, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { 
      id: 'property-inventory', 
      label: 'Property Inventory', 
      icon: Building2,
      children: [
        { id: 'properties', label: 'Properties', href: '/properties' },
        { id: 'towers', label: 'Towers', href: '/towers' },
        { id: 'flats', label: 'Flats', href: '/flats' },
      ]
    },
    { 
      id: 'sales', 
      label: 'Sales & CRM', 
      icon: TrendingUp,
      children: [
        { id: 'leads', label: 'Leads', href: '/leads' },
        { id: 'customers', label: 'Customers', href: '/customers' },
        { id: 'bookings', label: 'Bookings', href: '/bookings' },
      ]
    },
    { id: 'payments', label: 'Payments', icon: DollarSign, href: '/payments' },
    { id: 'accounting', label: 'Accounting', icon: Calculator, href: '/accounting' },
    { id: 'construction', label: 'Construction', icon: Hammer, href: '/construction' },
    { id: 'inventory', label: 'Materials Inventory', icon: Package, href: '/inventory' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, href: '/purchase-orders' },
    { id: 'employees', label: 'Employees', icon: Briefcase, href: '/employees' },
    { id: 'marketing', label: 'Marketing', icon: MessageSquare, href: '/marketing' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getActiveItem = () => {
    for (const item of menuItems) {
      if (item.href === pathname) return item.id;
      if (item.children) {
        const child = item.children.find(c => c.href === pathname);
        if (child) return child.id;
      }
    }
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  if (isLoading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo - Eastern Estate Brand Colors */}
          <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: '#F3E3C1' }}>
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8" style={{ color: '#A8211B' }} />
              <span className="font-bold text-lg" style={{ color: '#7B1E12' }}>Eastern Estate</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden hover:bg-gray-100 p-1 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        toggleMenu(item.id);
                      } else {
                        router.push(item.href || '/');
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeItem === item.id ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={activeItem === item.id ? { backgroundColor: '#FEF3E2', color: '#A8211B' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.children && (
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {item.children && expandedMenus.includes(item.id) && (
                    <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            router.push(child.href);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeItem === child.id ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                          style={activeItem === child.id ? { backgroundColor: '#FEF3E2', color: '#A8211B' } : {}}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#A8211B' }}>
                <span className="text-white font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="h-16 bg-white border-b px-4 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden hover:bg-gray-100 p-2 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: '#A8211B' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
