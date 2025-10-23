import { RolePermission } from './role-permission.entity';
export declare class Role {
    id: string;
    name: string;
    displayName: string;
    description: string;
    isSystemRole: boolean;
    isActive: boolean;
    rolePermissions: RolePermission[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    get permissions(): import("./permission.entity").Permission[];
}
