export declare class QueryTowerDto {
    page?: number;
    limit?: number;
    search?: string;
    propertyId?: string;
    constructionStatus?: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';
    vastuCompliant?: boolean;
    facing?: string;
    minFloors?: number;
    maxFloors?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
