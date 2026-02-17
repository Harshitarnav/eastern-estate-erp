import { Property } from '../../properties/entities/property.entity';
import { PropertyRole } from './user-property-access.entity';
export declare class PropertyRoleTemplate {
    id: string;
    propertyId: string;
    property: Property;
    role: PropertyRole;
    emailPattern: string | null;
    autoAssign: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}
