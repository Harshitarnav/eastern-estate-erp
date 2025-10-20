import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsArray,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { LeadStatus, LeadSource, LeadPriority } from '../entities/lead.entity';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsEnum(LeadSource)
  @IsNotEmpty()
  source: LeadSource;

  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  leadScore?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsString()
  @IsOptional()
  interestedPropertyTypes?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budgetMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budgetMax?: number;

  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];

  @IsDateString()
  @IsOptional()
  expectedPurchaseDate?: string;

  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: string;

  @IsString()
  @IsOptional()
  followUpNotes?: string;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsBoolean()
  @IsOptional()
  isQualified?: boolean;

  @IsBoolean()
  @IsOptional()
  isFirstTimeBuyer?: boolean;

  @IsBoolean()
  @IsOptional()
  hasExistingProperty?: boolean;

  @IsBoolean()
  @IsOptional()
  needsHomeLoan?: boolean;

  @IsBoolean()
  @IsOptional()
  hasApprovedLoan?: boolean;

  @IsString()
  @IsOptional()
  currentOccupation?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  annualIncome?: number;

  @IsString()
  @IsOptional()
  campaignName?: string;

  @IsString()
  @IsOptional()
  utmSource?: string;

  @IsString()
  @IsOptional()
  utmMedium?: string;

  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  referredBy?: string;

  @IsString()
  @IsOptional()
  referralName?: string;

  @IsString()
  @IsOptional()
  referralPhone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
