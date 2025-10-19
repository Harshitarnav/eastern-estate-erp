export declare class ProjectResponseDto {
    id: string;
    projectCode: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    gstNumber?: string;
    panNumber?: string;
    financeEntityName?: string;
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    propertiesCount: number;
}
export declare class PaginatedProjectResponseDto {
    data: ProjectResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
