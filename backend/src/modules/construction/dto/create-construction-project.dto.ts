import { IsString, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConstructionProjectDto {
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  towerId?: string;

  @IsOptional()
  @IsUUID()
  flatId?: string;

  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  expectedCompletionDate?: string;

  @IsOptional()
  @IsString()
  actualCompletionDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  overallProgress?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetAllocated?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetSpent?: number;

  @IsOptional()
  @IsUUID()
  projectManagerId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
