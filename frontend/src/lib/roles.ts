/**
 * Simplified Role System for Eastern Estate ERP (Frontend)
 * 
 * 8 Core Roles with clear responsibilities
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR = 'hr',
  CONSTRUCTION_TEAM = 'construction_team',
  MARKETING_TEAM = 'marketing_team',
  SALES_TEAM = 'sales_team',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.HR]: 'HR',
  [UserRole.CONSTRUCTION_TEAM]: 'Construction Team',
  [UserRole.MARKETING_TEAM]: 'Marketing Team',
  [UserRole.SALES_TEAM]: 'Sales Team',
  [UserRole.STAFF]: 'Staff',
  [UserRole.CUSTOMER]: 'Customer',
};

/**
 * Module access configuration by role
 * Defines which sidebar items each role can see
 */
export const ROLE_MODULE_ACCESS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'dashboard',
    'property-inventory',
    'properties',
    'towers',
    'flats',
    'sales',
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
    'property-inventory',
    'properties',
    'towers',
    'flats',
    'sales',
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
    'property-inventory',
    'properties',
    'towers',
    'flats',
    'hr',
    'employees',
    'settings',
  ],
  [UserRole.CONSTRUCTION_TEAM]: [
    'dashboard',
    'property-inventory',
    'properties',
    'towers',
    'flats',
    'construction',
    'construction-progress-simple',
    'construction-milestones',
  ],
  [UserRole.MARKETING_TEAM]: [
    'dashboard',
    'property-inventory',
    'properties',
    'towers',
    'flats',
    'marketing',
    'leads',
  ],
  [UserRole.SALES_TEAM]: [
    'dashboard',
    'property-inventory',
    'properties',
    'towers',
    'flats',
    'sales',
    'customers',
    'bookings',
    'payments',
    'payment-plans',
    'construction-milestones',
  ],
  [UserRole.STAFF]: [
    'dashboard',
    'property-inventory',
    'properties',
    'towers',
    'flats',
  ],
  [UserRole.CUSTOMER]: [
    'dashboard',
    'my-bookings',
    'my-payments',
  ],
};

/**
 * Check if user has access to a specific module
 * User needs at least ONE role that grants access to the module
 */
export function hasModuleAccess(userRoles: string[], moduleId: string): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // Super admin and admin have access to everything
  if (userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.ADMIN)) {
    return true;
  }

  // Check if any of the user's roles grants access to this module
  for (const role of userRoles) {
    const moduleAccess = ROLE_MODULE_ACCESS[role as UserRole];
    if (moduleAccess && moduleAccess.includes(moduleId)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has admin privileges
 */
export function isAdminRole(userRoles: string[]): boolean {
  return userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.ADMIN);
}

/**
 * Check if user requires property-level filtering
 * Admins see all properties, other roles see only assigned properties
 */
export function requiresPropertyFiltering(userRoles: string[]): boolean {
  return !isAdminRole(userRoles);
}

/**
 * Get all accessible modules for a user
 */
export function getUserModules(userRoles: string[]): string[] {
  const modules = new Set<string>();

  for (const role of userRoles) {
    const roleModules = ROLE_MODULE_ACCESS[role as UserRole] || [];
    roleModules.forEach(module => modules.add(module));
  }

  return Array.from(modules);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: string[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(userRoles: string[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}
