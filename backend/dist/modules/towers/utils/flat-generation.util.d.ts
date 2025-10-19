import type { Flat } from '../../flats/entities/flat.entity';
export interface FlatGenerationInput {
    propertyId: string;
    towerId: string;
    towerNumber?: string | null;
    totalUnits: number;
    totalFloors: number;
    unitsPerFloorText?: string | null;
    expectedPossessionDate?: Date | null;
    startDisplayOrder?: number;
}
export declare function parseFloorsDescriptor(descriptor?: string | null, fallback?: number): number;
export declare function parseUnitsPerFloor(unitsDescriptor?: string | null, fallback?: number): number;
export declare function generateFlatNumber(towerNumber: string | null | undefined, floor: number, unitIndex: number): string;
export declare function buildDefaultFlatPayloads(input: FlatGenerationInput): Partial<Flat>[];
