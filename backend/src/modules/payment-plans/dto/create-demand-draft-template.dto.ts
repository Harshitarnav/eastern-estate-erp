import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDemandDraftTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  htmlContent: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
