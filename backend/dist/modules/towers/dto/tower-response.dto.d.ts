import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';
export declare class TowerResponseDto {
    id: string;
    name: string;
    towerNumber: string;
    towerCode: string;
    description?: string;
    totalFloors: number;
    totalUnits: number;
    basementLevels: number;
    unitsPerFloor?: string;
    amenities?: string[];
    constructionStatus: string;
    constructionStartDate?: Date;
    completionDate?: Date;
    reraNumber?: string;
    builtUpArea?: number;
    carpetArea?: number;
    ceilingHeight?: number;
    numberOfLifts: number;
    vastuCompliant: boolean;
    facing?: string;
    specialFeatures?: string;
    isActive: boolean;
    displayOrder: number;
    images?: string[];
    floorPlans?: Record<string, string>;
    propertyId: string;
    property?: {
        id: string;
        name: string;
        propertyCode: string;
        city: string;
        state: string;
    };
    createdAt: Date;
    updatedAt: Date;
    flatsCount?: number;
    availableUnits?: number;
    soldUnits?: number;
    occupancyRate?: number;
    unitsPlanned?: number;
    unitsDefined?: number;
    dataCompletionPct?: number;
    dataCompletenessStatus?: DataCompletenessStatus;
    issuesCount?: number;
}
export declare class PaginatedTowerResponseDto {
    data: TowerResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
