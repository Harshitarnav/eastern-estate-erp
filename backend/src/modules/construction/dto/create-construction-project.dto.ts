import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsDateString, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ConstructionProjectPhase, ConstructionProjectStatus } from '../entities/construction-project.entity';

export class CreateConstructionProjectDto {
  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  towerId?: string;

  @IsOptional()
  @IsString()
  projectCode?: string;

  @IsString()
  projectName: string;

  @IsOptional()
  @IsEnum(ConstructionProjectPhase)
  projectPhase?: ConstructionProjectPhase;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expectedCompletionDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  overallProgress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  structureProgress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interiorProgress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  finishingProgress?: number;

  @IsOptional()
  @IsUUID()
  siteEngineerId?: string;

  @IsOptional()
  @IsString()
  contractorName?: string;

  @IsOptional()
  @IsString()
  contractorContact?: string;

  @IsOptional()
  @IsEnum(ConstructionProjectStatus)
  status?: ConstructionProjectStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetAllocated?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
