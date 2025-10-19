import type { Flat } from '../../flats/entities/flat.entity';
import { FlatStatus, FlatType } from '../../flats/entities/flat.entity';

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

const DEFAULT_BEDROOMS = 2;
const DEFAULT_BATHROOMS = 2;

export function parseFloorsDescriptor(descriptor?: string | null, fallback = 1): number {
  if (!descriptor) {
    return fallback;
  }

  const numericParts = descriptor.match(/\d+/g);
  if (!numericParts || numericParts.length === 0) {
    return fallback;
  }

  const lastValue = Number(numericParts[numericParts.length - 1]);
  return Number.isFinite(lastValue) && lastValue > 0 ? lastValue : fallback;
}

export function parseUnitsPerFloor(unitsDescriptor?: string | null, fallback = 1): number {
  if (!unitsDescriptor) {
    return fallback;
  }

  const numericParts = unitsDescriptor.match(/\d+/g);
  if (!numericParts || numericParts.length === 0) {
    return fallback;
  }

  const firstValue = Number(numericParts[0]);
  return Number.isFinite(firstValue) && firstValue > 0 ? firstValue : fallback;
}

export function generateFlatNumber(
  towerNumber: string | null | undefined,
  floor: number,
  unitIndex: number,
): string {
  const towerPrefix = (towerNumber ?? 'T').replace(/\s+/g, '').toUpperCase();
  const floorPart = floor.toString().padStart(2, '0');
  const unitPart = unitIndex.toString().padStart(2, '0');
  return `${towerPrefix}-${floorPart}${unitPart}`;
}

export function buildDefaultFlatPayloads(input: FlatGenerationInput): Partial<Flat>[] {
  const {
    propertyId,
    towerId,
    towerNumber,
    totalUnits,
    totalFloors,
    unitsPerFloorText,
    expectedPossessionDate,
    startDisplayOrder = 1,
  } = input;

  const normalizedTotalUnits = Math.max(totalUnits, 1);
  const normalizedFloors = Math.max(totalFloors, 1);
  const inferredUnitsPerFloor = Math.max(
    parseUnitsPerFloor(unitsPerFloorText, Math.ceil(normalizedTotalUnits / normalizedFloors)),
    1,
  );

  const flats: Partial<Flat>[] = [];
  let createdUnits = 0;
  let displayOrder = startDisplayOrder;

  for (let floor = 1; floor <= normalizedFloors && createdUnits < normalizedTotalUnits; floor++) {
    for (let unitIndex = 1; unitIndex <= inferredUnitsPerFloor && createdUnits < normalizedTotalUnits; unitIndex++) {
      createdUnits += 1;

      const flatNumber = generateFlatNumber(towerNumber, floor, unitIndex);

      flats.push({
        propertyId,
        towerId,
        flatNumber,
        name: `Unit ${flatNumber}`,
        description: null,
        type: FlatType.TWO_BHK,
        floor,
        bedrooms: DEFAULT_BEDROOMS,
        bathrooms: DEFAULT_BATHROOMS,
        balconies: 1,
        servantRoom: false,
        studyRoom: false,
        poojaRoom: false,
        superBuiltUpArea: 0,
        builtUpArea: 0,
        carpetArea: 0,
        balconyArea: null,
        basePrice: 0,
        pricePerSqft: null,
        registrationCharges: null,
        maintenanceCharges: null,
        parkingCharges: null,
        totalPrice: 0,
        discountAmount: null,
        finalPrice: 0,
        status: FlatStatus.UNDER_CONSTRUCTION,
        isAvailable: true,
        availableFrom: expectedPossessionDate ?? null,
        expectedPossession: expectedPossessionDate ?? null,
        facing: null,
        vastuCompliant: true,
        cornerUnit: false,
        roadFacing: false,
        parkFacing: false,
        parkingSlots: 0,
        coveredParking: false,
        furnishingStatus: 'Unfurnished',
        amenities: null,
        specialFeatures: null,
        floorPlanUrl: null,
        images: null,
        virtualTourUrl: null,
        customerId: null,
        bookingDate: null,
        soldDate: null,
        tokenAmount: null,
        paymentPlan: null,
        remarks: null,
        isActive: true,
        displayOrder,
        createdBy: null,
        updatedBy: null,
      });

      displayOrder += 1;
    }
  }

  return flats;
}
