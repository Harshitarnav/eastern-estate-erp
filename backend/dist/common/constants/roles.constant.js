"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_MODULE_ACCESS = exports.ROLE_DISPLAY_NAMES = exports.ROLE_HIERARCHY = exports.UserRole = void 0;
exports.hasModuleAccess = hasModuleAccess;
exports.isAdminRole = isAdminRole;
exports.seesAllAccountingProjects = seesAllAccountingProjects;
exports.getUserModules = getUserModules;
exports.requiresPropertyFiltering = requiresPropertyFiltering;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["ACCOUNTANT"] = "accountant";
    UserRole["HEAD_ACCOUNTANT"] = "head_accountant";
    UserRole["HR"] = "hr";
    UserRole["CONSTRUCTION_TEAM"] = "construction_team";
    UserRole["MARKETING_TEAM"] = "marketing_team";
    UserRole["SALES_TEAM"] = "sales_team";
    UserRole["STAFF"] = "staff";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLE_HIERARCHY = {
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
exports.ROLE_DISPLAY_NAMES = {
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
exports.ROLE_MODULE_ACCESS = {
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
        'properties',
        'towers',
        'flats',
        'hr',
        'employees',
        'settings',
    ],
    [UserRole.CONSTRUCTION_TEAM]: [
        'dashboard',
        'properties',
        'towers',
        'flats',
        'construction',
        'construction-milestones',
    ],
    [UserRole.MARKETING_TEAM]: [
        'dashboard',
        'properties',
        'towers',
        'flats',
        'marketing',
        'leads',
    ],
    [UserRole.SALES_TEAM]: [
        'dashboard',
        'properties',
        'towers',
        'flats',
        'customers',
        'bookings',
        'payments',
        'payment-plans',
        'construction-milestones',
    ],
    [UserRole.STAFF]: [
        'dashboard',
        'properties',
        'towers',
        'flats',
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
function hasModuleAccess(roles, module) {
    if (roles.includes(UserRole.SUPER_ADMIN) || roles.includes(UserRole.ADMIN)) {
        return true;
    }
    for (const role of roles) {
        const moduleAccess = exports.ROLE_MODULE_ACCESS[role];
        if (moduleAccess && moduleAccess.includes(module)) {
            return true;
        }
    }
    return false;
}
function isAdminRole(roles) {
    return roles.includes(UserRole.SUPER_ADMIN) || roles.includes(UserRole.ADMIN);
}
function seesAllAccountingProjects(roles) {
    return (roles.includes(UserRole.SUPER_ADMIN) ||
        roles.includes(UserRole.ADMIN) ||
        roles.includes(UserRole.HEAD_ACCOUNTANT));
}
function getUserModules(roles) {
    const modules = new Set();
    for (const role of roles) {
        const roleModules = exports.ROLE_MODULE_ACCESS[role] || [];
        roleModules.forEach(module => modules.add(module));
    }
    return Array.from(modules);
}
function requiresPropertyFiltering(roles) {
    return !isAdminRole(roles);
}
//# sourceMappingURL=roles.constant.js.map