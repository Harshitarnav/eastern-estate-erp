import { FlatStatus, FlatType } from '../entities/flat.entity';
export declare class QueryFlatDto {
    search?: string;
    propertyId?: string;
    towerId?: string;
    type?: FlatType;
    status?: FlatStatus;
    isAvailable?: boolean;
    minPrice?: number;
    maxPrice?: number;
    floor?: number;
    bedrooms?: number;
    vastuCompliant?: boolean;
    cornerUnit?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
