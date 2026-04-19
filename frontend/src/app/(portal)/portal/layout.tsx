'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  Building2, Home, Calendar, CreditCard, HardHat, LogOut, ShieldAlert,
} from 'lucide-react';
import PortalNotificationBell from '@/components/portal/PortalNotificationBell';

const NAV = [
  { href: '/portal',              label: 'Overview',     icon: Home,     exact: true },
  { href: '/portal/bookings',     label: 'My Units',     icon: Calendar              },
  { href: '/portal/payments',     label: 'Payments',     icon: CreditCard            },
  { href: '/portal/construction', label: 'Construction', icon: HardHat               },
];

// Pages that don't get the authenticated shell
const PUBLIC_PATHS = ['/portal/login'];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/portal/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      window.location.assign('/portal/login');
    }
  };

  // Login page (and any other public portal pages) - render bare, no shell
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  // Still loading auth - show spinner, never flash the shell
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-[#A8211B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ERP staff who navigate to /portal - show a clear "wrong account" screen
  const roles: string[] = ((user as any)?.roles || []).map((r: any) =>
    typeof r === 'string' ? r : r.name,
  );
  const isCustomer = roles.includes('customer');
  const isErpUser = !isCustomer && roles.length > 0;

  if (isErpUser) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-1">Wrong Account</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            You&apos;re signed in as an ERP user (<span className="font-semibold">{user?.email}</span>).
            The customer portal is for customers only.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/"
              className="w-full py-3 rounded-xl bg-[#A8211B] text-white text-sm font-bold hover:bg-[#7B1E12] transition text-center">
              Go to ERP Dashboard
            </Link>
            <button onClick={handleLogout}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Sign out &amp; use a different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">

      {/* ── Top header (desktop + mobile) ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shrink-0">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-[#A8211B] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-gray-900 text-sm leading-none block">Eastern Estate</span>
              <span className="text-[10px] text-gray-400 leading-none">My Portal</span>
            </div>
          </div>

          {/* Desktop nav - hidden on mobile (uses bottom tabs) */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(href, exact)
                    ? 'bg-[#A8211B]/10 text-[#A8211B]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* User + sign out */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Notification bell - only shown when authenticated */}
            <PortalNotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#A8211B] flex items-center justify-center text-white text-xs font-black">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 pb-24 md:pb-6">
        {children}
      </main>

      {/* ── Mobile bottom tab bar (PWA-friendly) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4 h-16">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center justify-center gap-0.5 transition-colors">
                <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all ${
                  active ? 'bg-[#A8211B]/10' : ''
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-[#A8211B]' : 'text-gray-400'}`} />
                </div>
                <span className={`text-[10px] font-semibold leading-none ${active ? 'text-[#A8211B]' : 'text-gray-400'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
