import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator';
import {
  UpdateVisibility,
  DevelopmentUpdateScope,
  DevelopmentUpdateCategory,
} from '../entities/construction-development-update.entity';

export class CreateDevelopmentUpdateDto {
  // All anchor fields are optional individually - the service validates that at
  // least one of (constructionProjectId, propertyId) is provided.
  @IsUUID()
  @IsOptional()
  constructionProjectId?: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  towerId?: string;

  @IsEnum(DevelopmentUpdateScope)
  @IsOptional()
  scopeType?: DevelopmentUpdateScope;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  commonAreaLabel?: string;

  @IsEnum(DevelopmentUpdateCategory)
  @IsOptional()
  category?: DevelopmentUpdateCategory;

  @IsDateString()
  @IsOptional()
  updateDate?: string;

  @IsString()
  @MaxLength(255)
  updateTitle: string;

  @IsString()
  updateDescription: string;

  @IsString()
  @IsOptional()
  feedbackNotes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsEnum(UpdateVisibility)
  @IsOptional()
  visibility?: UpdateVisibility;
}
