import { Tower } from '../../towers/entities/tower.entity';
import { Property } from '../../properties/entities/property.entity';
import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';
export declare enum FlatStatus {
    AVAILABLE = "AVAILABLE",
    ON_HOLD = "ON_HOLD",
    BLOCKED = "BLOCKED",
    BOOKED = "BOOKED",
    SOLD = "SOLD",
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION"
}
export declare enum FlatType {
    STUDIO = "STUDIO",
    ONE_BHK = "1BHK",
    TWO_BHK = "2BHK",
    THREE_BHK = "3BHK",
    FOUR_BHK = "4BHK",
    PENTHOUSE = "PENTHOUSE",
    DUPLEX = "DUPLEX",
    VILLA = "VILLA"
}
export declare enum FacingDirection {
    NORTH = "North",
    SOUTH = "South",
    EAST = "East",
    WEST = "West",
    NORTH_EAST = "North-East",
    NORTH_WEST = "North-West",
    SOUTH_EAST = "South-East",
    SOUTH_WEST = "South-West"
}
export declare class Flat {
    id: string;
    propertyId: string;
    property: Property;
    towerId: string;
    tower: Tower;
    flatCode: string;
    flatNumber: string;
    name: string;
    description: string;
    type: FlatType;
    floor: number;
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    servantRoom: boolean;
    studyRoom: boolean;
    poojaRoom: boolean;
    superBuiltUpArea: number;
    builtUpArea: number;
    carpetArea: number;
    balconyArea: number;
    basePrice: number;
    pricePerSqft: number;
    registrationCharges: number;
    maintenanceCharges: number;
    parkingCharges: number;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    status: FlatStatus;
    isAvailable: boolean;
    availableFrom: Date;
    expectedPossession: Date;
    flatChecklist: Record<string, boolean> | null;
    dataCompletionPct: number;
    completenessStatus: DataCompletenessStatus;
    issues: string[] | null;
    issuesCount: number;
    facing: FacingDirection;
    vastuCompliant: boolean;
    cornerUnit: boolean;
    roadFacing: boolean;
    parkFacing: boolean;
    parkingSlots: number;
    coveredParking: boolean;
    furnishingStatus: string;
    amenities: string[];
    specialFeatures: string;
    floorPlanUrl: string;
    images: string[];
    virtualTourUrl: string;
    customerId: string;
    bookingDate: Date;
    soldDate: Date;
    tokenAmount: number;
    paymentPlan: string;
    remarks: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
