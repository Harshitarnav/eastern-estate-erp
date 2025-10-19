import type { Property } from '../../properties/entities/property.entity';
export declare class Project {
    id: string;
    projectCode: string;
    name: string;
    description: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    pincode: string | null;
    status: string | null;
    startDate: Date | null;
    endDate: Date | null;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    gstNumber: string | null;
    panNumber: string | null;
    financeEntityName: string | null;
    isActive: boolean;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    properties: Property[];
}
