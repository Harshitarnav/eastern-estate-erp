import { User } from './user.entity';
import { Property } from '../../properties/entities/property.entity';
export declare enum PropertyRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    PROPERTY_ADMIN = "PROPERTY_ADMIN",
    GM_SALES = "GM_SALES",
    GM_MARKETING = "GM_MARKETING",
    GM_CONSTRUCTION = "GM_CONSTRUCTION",
    PROPERTY_VIEWER = "PROPERTY_VIEWER"
}
export declare class UserPropertyAccess {
    id: string;
    userId: string;
    user: User;
    propertyId: string;
    property: Property;
    role: PropertyRole;
    isActive: boolean;
    assignedBy: string;
    assignedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
