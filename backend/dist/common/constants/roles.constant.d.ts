export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    HR = "hr",
    CONSTRUCTION_TEAM = "construction_team",
    MARKETING_TEAM = "marketing_team",
    SALES_TEAM = "sales_team",
    STAFF = "staff",
    CUSTOMER = "customer"
}
export declare const ROLE_HIERARCHY: {
    super_admin: number;
    admin: number;
    hr: number;
    construction_team: number;
    marketing_team: number;
    sales_team: number;
    staff: number;
    customer: number;
};
export declare const ROLE_DISPLAY_NAMES: {
    super_admin: string;
    admin: string;
    hr: string;
    construction_team: string;
    marketing_team: string;
    sales_team: string;
    staff: string;
    customer: string;
};
export declare const ROLE_MODULE_ACCESS: {
    super_admin: string[];
    admin: string[];
    hr: string[];
    construction_team: string[];
    marketing_team: string[];
    sales_team: string[];
    staff: string[];
    customer: string[];
};
export declare function hasModuleAccess(roles: string[], module: string): boolean;
export declare function isAdminRole(roles: string[]): boolean;
export declare function getUserModules(roles: string[]): string[];
export declare function requiresPropertyFiltering(roles: string[]): boolean;
