'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Hammer,
  Calculator,
  Menu,
  Home,
  CreditCard,
  Briefcase,
  Target,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hasModuleAccess } from '@/lib/roles';

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  moduleIds: string[]; // any-of match
};

// Superset — we pick the first 4 the user can actually access.
const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Home',      icon: LayoutDashboard, href: '/',                moduleIds: ['dashboard'] },
  { id: 'customers',  label: 'Customers', icon: Users,           href: '/customers',       moduleIds: ['customers'] },
  { id: 'bookings',   label: 'Bookings',  icon: Calendar,        href: '/bookings',        moduleIds: ['bookings'] },
  { id: 'payments',   label: 'Payments',  icon: CreditCard,      href: '/payments',        moduleIds: ['payments', 'payments-list'] },
  { id: 'construct',  label: 'Build',     icon: Hammer,          href: '/construction',    moduleIds: ['construction', 'construction-overview'] },
  { id: 'accounts',   label: 'Accounts',  icon: Calculator,      href: '/accounting',      moduleIds: ['accounting', 'accounting-dashboard'] },
  { id: 'hr',         label: 'HR',        icon: Briefcase,       href: '/hr',              moduleIds: ['hr', 'employees'] },
  { id: 'leads',      label: 'Leads',     icon: Target,          href: '/leads',           moduleIds: ['leads'] },
  { id: 'reports',    label: 'Reports',   icon: BarChart3,       href: '/reports',         moduleIds: ['reports'] },
  { id: 'my-home',    label: 'My Home',   icon: Home,            href: '/portal',          moduleIds: ['my-bookings'] },
];

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const userRoles = useMemo<string[]>(
    () => user?.roles?.map((r: any) => (typeof r === 'string' ? r : r.name)) || [],
    [user],
  );

  const visibleItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) =>
      item.moduleIds.some((m) => hasModuleAccess(userRoles, m)),
    ).slice(0, 4);
  }, [userRoles]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex items-stretch"
      style={{ borderColor: '#F3E3C1', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {visibleItems.map(({ id, label, icon: Icon, href }) => {
        const active = isActive(href);
        const pending = pendingHref === href && !active;
        return (
          <Link
            key={id}
            href={href}
            onClick={() => setPendingHref(href)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={{ color: active ? '#A8211B' : pending ? '#9CA3AF' : '#6B7280' }}
          >
            <div
              className="w-10 h-6 flex items-center justify-center rounded-full transition-all"
              style={{ backgroundColor: active ? '#FEE2E2' : pending ? '#F3F4F6' : 'transparent' }}
            >
              <Icon className={`h-5 w-5 ${pending ? 'animate-pulse' : ''}`} />
            </div>
            <span
              className="text-[10px] font-medium leading-none"
              style={{ color: active ? '#A8211B' : pending ? '#9CA3AF' : '#6B7280' }}
            >
              {label}
            </span>
          </Link>
        );
      })}

      <button
        onClick={onMenuOpen}
        className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
        style={{ color: '#6B7280' }}
      >
        <div className="w-10 h-6 flex items-center justify-center rounded-full">
          <Menu className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-medium leading-none">More</span>
      </button>
    </nav>
  );
}
