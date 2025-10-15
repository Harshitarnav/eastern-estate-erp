import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlatStatus, FlatType } from '../entities/flat.entity';

export class QueryFlatDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  towerId?: string;

  @IsOptional()
  @IsEnum(FlatType)
  type?: FlatType;

  @IsOptional()
  @IsEnum(FlatStatus)
  status?: FlatStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  floor?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  vastuCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  cornerUnit?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
