import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class Role {
    id: string;
    name: string;
    displayName: string;
    description: string;
    isSystem: boolean;
    isActive: boolean;
    permissions: Permission[];
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}
