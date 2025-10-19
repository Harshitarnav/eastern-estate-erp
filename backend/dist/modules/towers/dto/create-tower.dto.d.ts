export declare class CreateTowerDto {
    name: string;
    towerNumber: string;
    towerCode?: string;
    description?: string;
    totalFloors: number;
    totalUnits: number;
    unitsPlanned?: number;
    basementLevels?: number;
    unitsPerFloor?: string;
    amenities?: string[];
    constructionStatus?: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';
    constructionStartDate?: string;
    completionDate?: string;
    reraNumber?: string;
    builtUpArea?: number;
    carpetArea?: number;
    ceilingHeight?: number;
    numberOfLifts?: number;
    vastuCompliant?: boolean;
    facing?: string;
    specialFeatures?: string;
    displayOrder?: number;
    images?: string[];
    floorPlans?: Record<string, string>;
    propertyId: string;
}
