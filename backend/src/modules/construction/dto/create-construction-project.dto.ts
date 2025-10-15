import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ProjectPhase, ProjectStatus } from '../entities/construction-project.entity';

export class CreateConstructionProjectDto {
  @IsNotEmpty()
  @IsString()
  projectCode: string;

  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  towerId?: string;

  @IsOptional()
  @IsEnum(ProjectPhase)
  projectPhase?: ProjectPhase;

  @IsOptional()
  @IsEnum(ProjectStatus)
  projectStatus?: ProjectStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallProgress?: number;

  @IsNotEmpty()
  @IsDateString()
  plannedStartDate: string;

  @IsNotEmpty()
  @IsDateString()
  plannedEndDate: string;

  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @IsOptional()
  @IsString()
  mainContractorName?: string;

  @IsOptional()
  @IsString()
  mainContractorEmail?: string;

  @IsOptional()
  @IsString()
  mainContractorPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @IsOptional()
  @IsString()
  projectManager?: string;

  @IsOptional()
  @IsString()
  siteEngineer?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workersCount?: number;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsArray()
  documents?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
