import { Role } from './role.entity';
export declare class Permission {
    id: string;
    name: string;
    displayName: string;
    module: string;
    description: string;
    roles: Role[];
    createdAt: Date;
}
