import { IsString, IsUUID, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConstructionProjectDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  projectName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  expectedCompletionDate: string;

  @IsOptional()
  @IsDateString()
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
