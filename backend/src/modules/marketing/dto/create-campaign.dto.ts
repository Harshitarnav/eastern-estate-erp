import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsObject,
  MaxLength,
} from 'class-validator';
import { CampaignType, CampaignStatus, CampaignChannel } from '../entities/campaign.entity';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  campaignCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CampaignType)
  @IsNotEmpty()
  type: CampaignType;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @IsEnum(CampaignChannel)
  @IsNotEmpty()
  channel: CampaignChannel;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  totalBudget: number;

  @IsString()
  @IsOptional()
  objectives?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  callToAction?: string;

  @IsString()
  @IsOptional()
  landingPageUrl?: string;

  @IsString()
  @IsOptional()
  utmSource?: string;

  @IsString()
  @IsOptional()
  utmMedium?: string;

  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @IsString()
  @IsOptional()
  vendorName?: string;

  @IsString()
  @IsOptional()
  agencyName?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsObject()
  @IsOptional()
  targetAudience?: any;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
