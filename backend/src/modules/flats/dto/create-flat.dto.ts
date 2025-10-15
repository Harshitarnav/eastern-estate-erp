import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { FlatStatus, FlatType, FacingDirection } from '../entities/flat.entity';

export class CreateFlatDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsUUID()
  @IsNotEmpty()
  towerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  flatNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FlatType)
  @IsNotEmpty()
  type: FlatType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  floor: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  bedrooms: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  bathrooms: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  balconies?: number;

  @IsBoolean()
  @IsOptional()
  servantRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  studyRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  poojaRoom?: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  superBuiltUpArea: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  builtUpArea: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  carpetArea: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  balconyArea?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerSqft?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  registrationCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maintenanceCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  parkingCharges?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalPrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  finalPrice: number;

  @IsEnum(FlatStatus)
  @IsOptional()
  status?: FlatStatus;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @IsDateString()
  @IsOptional()
  expectedPossession?: string;

  @IsEnum(FacingDirection)
  @IsOptional()
  facing?: FacingDirection;

  @IsBoolean()
  @IsOptional()
  vastuCompliant?: boolean;

  @IsBoolean()
  @IsOptional()
  cornerUnit?: boolean;

  @IsBoolean()
  @IsOptional()
  roadFacing?: boolean;

  @IsBoolean()
  @IsOptional()
  parkFacing?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  parkingSlots?: number;

  @IsBoolean()
  @IsOptional()
  coveredParking?: boolean;

  @IsString()
  @IsOptional()
  furnishingStatus?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsString()
  @IsOptional()
  specialFeatures?: string;

  @IsString()
  @IsOptional()
  floorPlanUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  virtualTourUrl?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsDateString()
  @IsOptional()
  bookingDate?: string;

  @IsDateString()
  @IsOptional()
  soldDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tokenAmount?: number;

  @IsString()
  @IsOptional()
  paymentPlan?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  displayOrder?: number;
}
