import { IsUUID, IsDateString, IsString, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';
import { UpdateVisibility } from '../entities/construction-development-update.entity';

export class CreateDevelopmentUpdateDto {
  @IsUUID()
  constructionProjectId: string;

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
