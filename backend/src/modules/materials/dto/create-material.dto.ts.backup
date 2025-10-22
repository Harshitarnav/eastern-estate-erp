import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, Max, Length } from 'class-validator';
import { MaterialCategory, UnitOfMeasurement } from '../entities/material.entity';

export class CreateMaterialDto {
  @IsString()
  @Length(1, 50)
  materialCode: string;

  @IsString()
  @Length(1, 255)
  materialName: string;

  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @IsEnum(UnitOfMeasurement)
  unitOfMeasurement: UnitOfMeasurement;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumStockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumStockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  gstPercentage?: number;

  @IsString()
  @IsOptional()
  specifications?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
