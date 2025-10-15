import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsIn,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  propertyCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  totalArea?: number;

  @IsString()
  @IsOptional()
  areaUnit?: string;

  @IsDateString()
  @IsOptional()
  launchDate?: string;

  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @IsString()
  @IsOptional()
  reraNumber?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Residential', 'Commercial', 'Mixed'])
  projectType?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Active', 'Upcoming', 'Completed', 'On Hold'])
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
}