import { Repository } from 'typeorm';
import { UserPropertyAccess, PropertyRole } from '../entities/user-property-access.entity';
import { User } from '../entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
export interface GrantAccessDto {
    userId: string;
    propertyId: string;
    role: PropertyRole;
}
export interface BulkGrantAccessDto {
    userId: string;
    propertyIds: string[];
    role: PropertyRole;
}
export declare class PropertyAccessService {
    private propertyAccessRepo;
    private userRepo;
    private propertyRepo;
    private readonly logger;
    constructor(propertyAccessRepo: Repository<UserPropertyAccess>, userRepo: Repository<User>, propertyRepo: Repository<Property>);
    getUserProperties(userId: string): Promise<UserPropertyAccess[]>;
    getPropertyUsers(propertyId: string): Promise<UserPropertyAccess[]>;
    grantAccess(userId: string, propertyId: string, role: PropertyRole, assignedBy: string): Promise<UserPropertyAccess>;
    revokeAccess(userId: string, propertyId: string, role?: PropertyRole): Promise<void>;
    hasAccess(userId: string, propertyId: string, requiredRoles?: PropertyRole[]): Promise<boolean>;
    getUserPropertyIds(userId: string): Promise<string[]>;
    isGlobalAdmin(userId: string): Promise<boolean>;
    applyPropertyFilter(userId: string, queryBuilder: any, propertyColumn?: string): Promise<void>;
    bulkGrantAccess(userId: string, propertyIds: string[], role: PropertyRole, assignedBy: string): Promise<UserPropertyAccess[]>;
    bulkRevokeAccess(userId: string, propertyIds: string[], role?: PropertyRole): Promise<void>;
    getUserPropertiesByRole(userId: string, role: PropertyRole): Promise<UserPropertyAccess[]>;
    getAccessiblePropertyIds(userId: string): Promise<string[] | null>;
    updateRole(userId: string, propertyId: string, oldRole: PropertyRole, newRole: PropertyRole, updatedBy: string): Promise<UserPropertyAccess>;
    getUserAccessSummary(userId: string): Promise<{
        totalProperties: number;
        accessByRole: Record<string, number>;
        properties: UserPropertyAccess[];
    }>;
}
