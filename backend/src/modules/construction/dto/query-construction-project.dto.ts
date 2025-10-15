import { IsOptional, IsString, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectPhase, ProjectStatus } from '../entities/construction-project.entity';

export class QueryConstructionProjectDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProjectPhase)
  projectPhase?: ProjectPhase;

  @IsOptional()
  @IsEnum(ProjectStatus)
  projectStatus?: ProjectStatus;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  towerId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
