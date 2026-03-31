'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Hammer,
  Calculator,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',       icon: LayoutDashboard, href: '/' },
  { id: 'customers', label: 'Customers',  icon: Users,            href: '/customers' },
  { id: 'bookings',  label: 'Bookings',   icon: Calendar,         href: '/bookings' },
  { id: 'construct', label: 'Build',      icon: Hammer,           href: '/construction' },
  { id: 'accounts',  label: 'Accounts',   icon: Calculator,       href: '/accounting' },
];

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex items-stretch"
      style={{ borderColor: '#F3E3C1', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
        const active = isActive(href);
        return (
          <Link
            key={id}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={{ color: active ? '#A8211B' : '#6B7280' }}
          >
            <div
              className="w-10 h-6 flex items-center justify-center rounded-full transition-all"
              style={{ backgroundColor: active ? '#FEE2E2' : 'transparent' }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className="text-[10px] font-medium leading-none"
              style={{ color: active ? '#A8211B' : '#6B7280' }}
            >
              {label}
            </span>
          </Link>
        );
      })}

      {/* More — opens the full sidebar */}
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
