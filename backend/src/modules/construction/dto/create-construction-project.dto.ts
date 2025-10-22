import { IsString, IsUUID, IsOptional, IsNumber, IsISO8601, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConstructionProjectDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  projectName: string;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  expectedCompletionDate: string;

  @IsOptional()
  @IsISO8601()
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
}
