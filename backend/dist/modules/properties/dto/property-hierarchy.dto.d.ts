export declare class CustomerSummaryDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    kycStatus: string;
}
export declare class FlatHierarchyDto {
    id: string;
    flatNumber: string;
    name: string;
    type: string;
    floor: number;
    status: string;
    isActive: boolean;
    isAvailable: boolean;
    bedrooms: number;
    bathrooms: number;
    superBuiltUpArea: number | null;
    builtUpArea: number | null;
    carpetArea: number | null;
    facing?: string | null;
    basePrice: number | null;
    totalPrice: number | null;
    finalPrice: number | null;
    bookingDate?: Date | null;
    soldDate?: Date | null;
    tokenAmount: number | null;
    remarks?: string | null;
    customer?: CustomerSummaryDto | null;
}
export declare class TowerHierarchyStatsDto {
    totalFlats: number;
    availableFlats: number;
    bookedFlats: number;
    blockedFlats: number;
    soldFlats: number;
    underConstructionFlats: number;
}
export declare class TowerHierarchyDto {
    id: string;
    name: string;
    towerNumber: string;
    description?: string | null;
    totalFloors: number;
    totalUnits: number;
    constructionStatus: string;
    vastuCompliant: boolean;
    facing?: string | null;
    specialFeatures?: string | null;
    stats: TowerHierarchyStatsDto;
    flats: FlatHierarchyDto[];
}
export declare class PropertyHierarchyStatsDto {
    totalTowers: number;
    totalFlats: number;
    availableFlats: number;
    bookedFlats: number;
    blockedFlats: number;
    soldFlats: number;
    underConstructionFlats: number;
}
export declare class PropertyHierarchyDto {
    id: string;
    propertyCode: string;
    name: string;
    description?: string;
    status: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    projectId?: string;
    projectCode?: string;
    projectName?: string;
    totalArea?: number;
    builtUpArea?: number;
    expectedRevenue?: number;
    bhkTypes?: string[] | null;
    amenities?: any;
    createdAt: string | Date;
    updatedAt: string | Date;
    towers: TowerHierarchyDto[];
    stats: PropertyHierarchyStatsDto;
}
