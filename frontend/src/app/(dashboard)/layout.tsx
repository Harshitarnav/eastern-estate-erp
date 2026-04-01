'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loading } from '@/components/Loading';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { NotificationBell } from '@/components/layout/NotificationBell';
// import ChatButton from '@/components/layout/ChatButton'; // hidden until ready
import { Menu, LogOut, Building2 } from 'lucide-react';
import { Toaster } from 'sonner';
import apiService from '@/services/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState<{ id: string; name: string }[] | null>(null);
  const { user, logout, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  const userRoles: string[] = ((user as any)?.roles || []).map((r: any) =>
    typeof r === 'string' ? r : r.name,
  );
  // Only super_admin is always unrestricted — all other roles depend on project assignments
  const isSuperAdmin = userRoles.includes('super_admin');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch explicitly assigned projects to show in header (skip for super_admin)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || isSuperAdmin) return;
    apiService.get(`/users/${user.id}/property-access`)
      .then((res: any) => {
        const items: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const projects = items
          .filter((a: any) => a.property)
          .map((a: any) => ({ id: a.property.id, name: a.property.name }));
        setAssignedProjects(projects);
      })
      .catch(() => setAssignedProjects([]));
  }, [isAuthenticated, user?.id, isSuperAdmin]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="lg:pl-64">
        {/* Header */}
        <header className="h-14 md:h-16 bg-white border-b px-3 md:px-4 flex items-center justify-between sticky top-0 z-30" style={{ borderColor: '#F3E3C1' }}>
          {/* Left — hamburger (desktop: hidden since sidebar is always visible) */}
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden hover:bg-red-50 p-2 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" style={{ color: '#A8211B' }} />
          </button>

          {/* Center — brand name on mobile */}
          <span
            className="lg:hidden absolute left-1/2 -translate-x-1/2 font-bold text-base"
            style={{ color: '#7B1E12' }}
          >
            Eastern Estate
          </span>

          {/* Project scope badge — shows for any user with explicit project assignments */}
          {!isSuperAdmin && assignedProjects && assignedProjects.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: '#F3E3C1', backgroundColor: '#FEF9F0', color: '#7B1E12' }}>
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[200px] truncate">
                {assignedProjects.length === 1
                  ? assignedProjects[0].name
                  : `${assignedProjects.length} Projects`}
              </span>
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-1 ml-auto">
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

        {/* Page Content — add bottom padding on mobile so content isn't hidden by bottom nav */}
        <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuOpen={() => setSidebarOpen(true)} />
    </div>
  );
}
