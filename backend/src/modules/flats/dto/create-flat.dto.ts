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
  @IsOptional()
  @MaxLength(50)
  flatCode?: string;

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

  @IsString()
  @IsOptional()
  saleAgreementUrl?: string;

  @IsString()
  @IsOptional()
  allotmentLetterUrl?: string;

  @IsString()
  @IsOptional()
  possessionLetterUrl?: string;

  @IsString()
  @IsOptional()
  paymentPlanUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  registrationReceiptUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paymentReceiptUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  demandLetterUrls?: string[];

  @IsString()
  @IsOptional()
  nocUrl?: string;

  @IsString()
  @IsOptional()
  reraCertificateUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  kycDocsUrls?: string[];

  @IsString()
  @IsOptional()
  snagListUrl?: string;

  @IsString()
  @IsOptional()
  handoverChecklistUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  otherDocuments?: string[];

  @IsDateString()
  @IsOptional()
  agreementDate?: string;

  @IsDateString()
  @IsOptional()
  registrationDate?: string;

  @IsDateString()
  @IsOptional()
  handoverDate?: string;

  @IsString()
  @IsOptional()
  loanStatus?: 'NONE' | 'APPLIED' | 'SANCTIONED' | 'DISBURSED';

  @IsString()
  @IsOptional()
  handoverStatus?: 'PENDING' | 'READY' | 'HANDED_OVER';

  @IsString()
  @IsOptional()
  verificationStatus?: 'PENDING' | 'VERIFIED';

  @IsDateString()
  @IsOptional()
  verifiedAt?: string;

  @IsUUID()
  @IsOptional()
  verifiedBy?: string;

  @IsUUID()
  @IsOptional()
  salespersonId?: string;

  @IsUUID()
  @IsOptional()
  serviceContactId?: string;

  @IsString()
  @IsOptional()
  coBuyerName?: string;

  @IsString()
  @IsOptional()
  coBuyerEmail?: string;

  @IsString()
  @IsOptional()
  coBuyerPhone?: string;

  @IsString()
  @IsOptional()
  parkingNumber?: string;

  @IsString()
  @IsOptional()
  parkingType?: string;

  @IsString()
  @IsOptional()
  storageId?: string;

  @IsString()
  @IsOptional()
  furnishingPack?: string;

  @IsBoolean()
  @IsOptional()
  appliancePack?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  displayOrder?: number;
}
