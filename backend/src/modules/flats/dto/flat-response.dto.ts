import { Flat } from '../entities/flat.entity';

export class FlatResponseDto {
  id: string;
  propertyId: string;
  towerId: string;
  flatNumber: string;
  name: string;
  description: string;
  type: string;
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
  status: string;
  isAvailable: boolean;
  availableFrom: string | Date;
  expectedPossession: string | Date;
  facing: string;
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
  bookingDate: string | Date;
  soldDate: string | Date;
  tokenAmount: number;
  paymentPlan: string;
  remarks: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  property?: any;
  tower?: any;
  flatChecklist?: Record<string, boolean> | null;
  dataCompletionPct?: number;
  completenessStatus?: string;
  issues?: string[];
  issuesCount?: number;
  fundsTarget?: number;
  fundsRealized?: number;
  fundsOutstanding?: number;

  static fromEntity(flat: Flat, extras?: Partial<FlatResponseDto>): FlatResponseDto {
    const dto = new FlatResponseDto();
    Object.assign(dto, flat);
    if (extras) {
      Object.assign(dto, extras);
    }
    return dto;
  }

  static fromEntities(flats: Flat[], extras?: Record<string, Partial<FlatResponseDto>>): FlatResponseDto[] {
    return flats.map((flat) => this.fromEntity(flat, extras?.[flat.id]));
  }
}

export interface PaginatedFlatsResponse {
  data: FlatResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
