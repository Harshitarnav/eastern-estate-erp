import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  MaxLength,
  Min,
  IsInt,
  IsUUID,
} from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  propertyCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  pincode: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalArea?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  builtUpArea?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  areaUnit?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  numberOfTowers?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  numberOfUnits?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  floorsPerTower?: string;

  @IsDateString()
  @IsOptional()
  launchDate?: string;

  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @IsDateString()
  @IsOptional()
  actualCompletionDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reraNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  reraStatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  projectType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  propertyType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  documents?: any[];

  @IsArray()
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  bhkTypes?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMax?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expectedRevenue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  // Tri-state per-project override for milestone-DD auto-send.
  //   null / undefined  → inherit from company_settings default
  //   true              → auto-send every DD for this project
  //   false             → force review for every DD on this project
  // @IsOptional() lets `null` through so the frontend can clear the
  // override without needing a separate endpoint.
  @IsOptional()
  @IsBoolean()
  autoSendMilestoneDemandDrafts?: boolean | null;

  @IsString()
  @IsOptional()
  nearbyLandmarks?: string;

  @IsUUID('4')
  @IsOptional()
  projectId?: string;

  // ── Project-level legal & bank details ───────────────────────────────────
  @IsString()
  @IsOptional()
  @MaxLength(50)
  gstin?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  ifscCode?: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsString()
  @IsOptional()
  upiId?: string;
}
