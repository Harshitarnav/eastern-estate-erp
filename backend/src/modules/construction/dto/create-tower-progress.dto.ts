import { IsUUID, IsEnum, IsNumber, IsDateString, IsOptional, IsString, Min, Max } from 'class-validator';
import { ConstructionPhase, PhaseStatus } from '../entities/construction-tower-progress.entity';

export class CreateTowerProgressDto {
  @IsUUID()
  constructionProjectId: string;

  @IsUUID()
  towerId: string;

  @IsEnum(ConstructionPhase)
  phase: ConstructionPhase;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  phaseProgress?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  overallProgress?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  expectedEndDate?: string;

  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @IsEnum(PhaseStatus)
  @IsOptional()
  status?: PhaseStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
