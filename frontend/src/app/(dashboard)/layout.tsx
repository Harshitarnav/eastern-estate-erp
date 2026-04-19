'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loading } from '@/components/Loading';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { HeaderProjectSelect } from '@/components/layout/HeaderProjectSelect';
// import ChatButton from '@/components/layout/ChatButton'; // hidden until ready
import { Menu, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { canAccessDashboardPath } from '@/lib/dashboardRouteAccess';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const userRoles = useMemo<string[]>(
    () =>
      ((user as any)?.roles || []).map((r: any) =>
        typeof r === 'string' ? r : r.name,
      ),
    [user],
  );
  const rolesKey = useMemo(() => userRoles.join('|'), [userRoles]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Block direct navigation to modules the user's roles do not include (UI-only; API also enforces).
  useEffect(() => {
    if (isLoading || !isAuthenticated || !pathname) return;
    if (!userRoles.length) return;
    if (!canAccessDashboardPath(pathname, userRoles)) {
      toast.error('You do not have access to this page.');
      router.replace('/');
    }
    // rolesKey is the stable signature of userRoles; depending on userRoles directly
    // would re-run on every render because the array identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, pathname, router, rolesKey]);

  const handleLogout = async () => {
    await logout();
    // Full navigation: avoids a blank frame (this layout returns null while !isAuthenticated)
    // and reliably lands on the sign-in page.
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64 min-w-0 w-full max-w-full">
        {/* Header */}
        <header
          className="h-14 md:h-16 bg-white border-b px-3 md:px-4 flex items-center gap-2 sticky top-0 z-30 min-w-0 max-w-full"
          style={{ borderColor: '#F3E3C1' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden hover:bg-red-50 p-2 rounded-lg shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" style={{ color: '#A8211B' }} />
          </button>

          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            {/* <span
              className="hidden lg:inline font-bold text-lg shrink-0"
              style={{ color: '#7B1E12' }}
            >
              Eastern Estate
            </span> */}
            <HeaderProjectSelect />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell />
            {/* <ChatButton /> */}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: '#A8211B' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3E2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content - add bottom padding on mobile so content isn't hidden by bottom nav */}
        <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0 min-w-0 w-full max-w-full">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuOpen={() => setSidebarOpen(true)} />
    </div>
  );
}
