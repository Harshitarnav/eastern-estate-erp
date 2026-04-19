import { hasModuleAccess, isAdminRole, UserRole } from '@/lib/roles';

/**
 * Longest-prefix wins. Each route maps to sidebar module ids; user needs at least one.
 */
const ROUTE_RULES: { prefix: string; modules: string[] }[] = [
  { prefix: '/settings/users', modules: ['settings'] },
  { prefix: '/settings/company', modules: ['settings'] },
  { prefix: '/settings/help', modules: ['settings'] },
  { prefix: '/settings', modules: ['settings'] },
  { prefix: '/database', modules: ['database'] },
  { prefix: '/roles', modules: ['settings'] },
  { prefix: '/property-access', modules: ['settings'] },
  { prefix: '/users', modules: ['settings'] },
  { prefix: '/accounting/budgets', modules: ['budgets'] },
  { prefix: '/accounting/reports', modules: ['accounting-reports'] },
  {
    prefix: '/accounting',
    modules: [
      'accounting',
      'accounting-dashboard',
      'accounts',
      'journal-entries',
      'expenses',
      'bank-accounts',
      'cash-bank-book',
    ],
  },
  { prefix: '/construction-milestones', modules: ['construction-milestones'] },
  { prefix: '/construction/log', modules: ['construction-log', 'construction-progress'] },
  { prefix: '/construction/flats', modules: ['construction-log', 'construction-progress'] },
  { prefix: '/construction/development-updates', modules: ['development-updates', 'construction-progress'] },
  { prefix: '/construction/inventory', modules: ['materials', 'reports-inventory'] },
  {
    prefix: '/construction',
    modules: [
      'construction',
      'construction-overview',
      'projects',
      'teams',
      'construction-progress',
      'materials',
      'vendors',
      'purchase-orders',
      'ra-bills',
      'quality-control',
      'construction-reports',
    ],
  },
  { prefix: '/customers/portal-accounts', modules: ['portal-accounts'] },
  { prefix: '/customers', modules: ['customers'] },
  { prefix: '/bookings', modules: ['bookings'] },
  { prefix: '/payments', modules: ['payments', 'payments-list'] },
  { prefix: '/payment-plans', modules: ['payment-plans'] },
  { prefix: '/demand-drafts', modules: ['demand-drafts'] },
  {
    prefix: '/collections',
    modules: [
      'collections',
      'collections-workstation',
      'collections-legacy-import',
      'demand-drafts',
    ],
  },
  { prefix: '/marketing', modules: ['marketing'] },
  { prefix: '/hr/payroll', modules: ['payroll'] },
  { prefix: '/hr', modules: ['hr', 'employees', 'payroll'] },
  { prefix: '/employees', modules: ['employees'] },
  { prefix: '/reports/outstanding', modules: ['reports-outstanding'] },
  { prefix: '/reports/collection', modules: ['reports-collection'] },
  { prefix: '/reports/inventory', modules: ['reports-inventory'] },
  { prefix: '/reports', modules: ['reports'] },
  { prefix: '/properties', modules: ['properties'] },
  { prefix: '/towers', modules: ['towers'] },
  { prefix: '/flats', modules: ['flats'] },
  { prefix: '/sales', modules: ['sales'] },
  { prefix: '/leads', modules: ['leads'] },
  { prefix: '/ledger', modules: ['bookings', 'payments', 'payments-list'] },
  { prefix: '/notifications', modules: ['dashboard'] },
  { prefix: '/no-access', modules: ['dashboard'] },
  { prefix: '/dashboard', modules: ['dashboard'] },
];

const SORTED_RULES = [...ROUTE_RULES].sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Returns false if the user must not open this path (direct URL / bookmark).
 */
export function canAccessDashboardPath(pathname: string, userRoles: string[]): boolean {
  if (!userRoles?.length) return false;
  if (isAdminRole(userRoles) || userRoles.includes(UserRole.SUPER_ADMIN)) {
    return true;
  }

  const path = pathname.split('?')[0] || '/';

  if (path === '/' || path === '') {
    return hasModuleAccess(userRoles, 'dashboard');
  }

  for (const rule of SORTED_RULES) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      return rule.modules.some((m) => hasModuleAccess(userRoles, m));
    }
  }

  return false;
}
