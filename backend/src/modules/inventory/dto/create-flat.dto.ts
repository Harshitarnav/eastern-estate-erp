import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsObject,
  Min,
} from 'class-validator';

export class CreateFlatDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsUUID()
  @IsNotEmpty()
  towerId: string;

  @IsUUID()
  @IsNotEmpty()
  floorId: string;

  @IsString()
  @IsNotEmpty()
  flatCode: string;

  @IsString()
  @IsNotEmpty()
  flatNumber: string;

  @IsString()
  @IsOptional()
  flatName?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse', 'Studio'])
  flatType: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Area
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  carpetArea: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  builtUpArea?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  superBuiltUpArea?: number;

  @IsString()
  @IsOptional()
  areaUnit?: string;

  // Pricing
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  baseRatePerSqft: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gstAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  registrationCharges?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  otherCharges?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalPrice: number;

  // Configuration
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
  hasStudyRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  hasServantRoom?: boolean;

  @IsBoolean()
  @IsOptional()
  hasPoojaRoom?: boolean;

  @IsObject()
  @IsOptional()
  roomDetails?: any;

  // Features
  @IsString()
  @IsOptional()
  @IsIn(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'])
  facing?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Furnished', 'Semi-Furnished', 'Unfurnished'])
  furnishingStatus?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Tiles', 'Marble', 'Wooden', 'Vitrified'])
  flooringType?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Modular', 'Non-Modular'])
  kitchenType?: string;

  @IsString()
  @IsOptional()
  floorPlanImage?: string;

  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  paymentPlanDocument?: string;

  @IsString()
  @IsOptional()
  surroundingDescription?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Available', 'Blocked', 'Booked', 'Sold', 'Released'])
  status?: string;
}