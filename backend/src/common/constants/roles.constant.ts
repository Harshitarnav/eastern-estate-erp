/**
 * Simplified Role System for Eastern Estate ERP
 * 
 * Core roles include accountants (project-scoped vs company-wide head accountant).
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  HEAD_ACCOUNTANT = 'head_accountant',
  HR = 'hr',
  CONSTRUCTION_TEAM = 'construction_team',
  MARKETING_TEAM = 'marketing_team',
  SALES_TEAM = 'sales_team',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.HEAD_ACCOUNTANT]: 85,
  [UserRole.HR]: 80,
  [UserRole.ACCOUNTANT]: 55,
  [UserRole.CONSTRUCTION_TEAM]: 50,
  [UserRole.MARKETING_TEAM]: 50,
  [UserRole.SALES_TEAM]: 50,
  [UserRole.STAFF]: 30,
  [UserRole.CUSTOMER]: 10,
};

export const ROLE_DISPLAY_NAMES = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.ACCOUNTANT]: 'Accountant',
  [UserRole.HEAD_ACCOUNTANT]: 'Head Accountant',
  [UserRole.HR]: 'HR',
  [UserRole.CONSTRUCTION_TEAM]: 'Construction Team',
  [UserRole.MARKETING_TEAM]: 'Marketing Team',
  [UserRole.SALES_TEAM]: 'Sales Team',
  [UserRole.STAFF]: 'Staff',
  [UserRole.CUSTOMER]: 'Customer',
};

/**
 * Module access by role
 * Each role can access specific modules
 */
export const ROLE_MODULE_ACCESS = {
  [UserRole.SUPER_ADMIN]: [
    'dashboard',
    'properties',
    'towers',
    'flats',
    'customers',
    'bookings',
    'payments',
    'payment-plans',
    'construction-milestones',
    'construction',
    'hr',
    'employees',
    'marketing',
    'database',
    'settings',
  ],
  [UserRole.ADMIN]: [
    'dashboard',
    'properties',
    'towers',
    'flats',
    'customers',
    'bookings',
    'payments',
    'payment-plans',
    'construction-milestones',
    'construction',
    'hr',
    'employees',
    'marketing',
    'database',
    'settings',
  ],
  [UserRole.HR]: [
    'dashboard',
    'properties', // view only
    'towers', // view only
    'flats', // view only
    'hr',
    'employees',
    'settings',
  ],
  [UserRole.CONSTRUCTION_TEAM]: [
    'dashboard',
    'properties', // view only
    'towers', // view only
    'flats', // view only
    'construction',
    'construction-milestones',
  ],
  [UserRole.MARKETING_TEAM]: [
    'dashboard',
    'properties', // view only
    'towers', // view only
    'flats', // view only
    'marketing',
    'leads',
  ],
  [UserRole.SALES_TEAM]: [
    'dashboard',
    'properties', // view only
    'towers', // view only
    'flats', // view only
    'customers',
    'bookings',
    'payments',
    'payment-plans',
    'construction-milestones',
  ],
  [UserRole.STAFF]: [
    'dashboard',
    'properties', // view only
    'towers', // view only
    'flats', // view only
  ],
  [UserRole.ACCOUNTANT]: [
    'dashboard',
    'properties',
    'accounting',
    'reports',
  ],
  [UserRole.HEAD_ACCOUNTANT]: [
    'dashboard',
    'properties',
    'accounting',
    'reports',
    'hr',
    'employees',
  ],
  [UserRole.CUSTOMER]: [
    'customer-portal',
    'my-bookings',
    'my-payments',
  ],
};

/**
 * Check if a role has access to a module
 */
export function hasModuleAccess(roles: string[], module: string): boolean {
  // Super admin and admin have access to everything
  if (roles.includes(UserRole.SUPER_ADMIN) || roles.includes(UserRole.ADMIN)) {
    return true;
  }

  // Check if any of the user's roles has access to the module
  for (const role of roles) {
    const moduleAccess = ROLE_MODULE_ACCESS[role as UserRole];
    if (moduleAccess && moduleAccess.includes(module)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user is admin or super admin
 */
export function isAdminRole(roles: string[]): boolean {
  return roles.includes(UserRole.SUPER_ADMIN) || roles.includes(UserRole.ADMIN);
}

/** Sees all projects in accounting dropdowns / fund-flow (not limited to property access list) */
export function seesAllAccountingProjects(roles: string[]): boolean {
  return (
    roles.includes(UserRole.SUPER_ADMIN) ||
    roles.includes(UserRole.ADMIN) ||
    roles.includes(UserRole.HEAD_ACCOUNTANT)
  );
}

/**
 * Get all modules accessible to a user based on their roles
 */
export function getUserModules(roles: string[]): string[] {
  const modules = new Set<string>();

  for (const role of roles) {
    const roleModules = ROLE_MODULE_ACCESS[role as UserRole] || [];
    roleModules.forEach(module => modules.add(module));
  }

  return Array.from(modules);
}

/**
 * Check if role requires property-level filtering
 * Admin and Super Admin see all properties
 * Other roles see only assigned properties
 */
export function requiresPropertyFiltering(roles: string[]): boolean {
  return !isAdminRole(roles);
}
