import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsArray,
  IsBoolean,
  MaxLength,
  Min
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
  @IsNotEmpty()
  address: string;

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

  @IsString()
  @IsOptional()
  @MaxLength(20)
  areaUnit?: string;

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
  projectType?: string;

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
