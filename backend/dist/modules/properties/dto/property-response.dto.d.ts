export declare class PropertyResponseDto {
    id: string;
    propertyCode: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    totalArea?: number;
    areaUnit: string;
    launchDate?: Date;
    expectedCompletionDate?: Date;
    actualCompletionDate?: Date;
    reraNumber?: string;
    projectType?: string;
    status: string;
    images?: any;
    documents?: any;
    amenities?: any;
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    towers?: number;
    totalFlats?: number;
    soldFlats?: number;
    availableFlats?: number;
}
export declare class PaginatedPropertyResponseDto {
    data: PropertyResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
