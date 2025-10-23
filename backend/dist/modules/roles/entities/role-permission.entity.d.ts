import { Role } from './role.entity';
import { Permission } from './permission.entity';
export declare class RolePermission {
    id: string;
    roleId: string;
    permissionId: string;
    role: Role;
    permission: Permission;
    constraints: Record<string, any>;
    createdAt: Date;
}
