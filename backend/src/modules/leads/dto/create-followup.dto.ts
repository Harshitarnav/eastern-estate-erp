/**
 * @file create-followup.dto.ts
 * @description DTO for creating a followup record
 * @module LeadsModule
 */

import { IsUUID, IsDate, IsEnum, IsInt, IsString, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { FollowUpType, FollowUpOutcome } from '../entities/followup.entity';

export class CreateFollowUpDto {
  @IsUUID()
  leadId: string;

  @Type(() => Date)
  @IsDate()
  followUpDate: Date;

  @IsEnum(FollowUpType)
  followUpType: FollowUpType;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsUUID()
  performedBy: string;

  @IsEnum(FollowUpOutcome)
  outcome: FollowUpOutcome;

  @IsString()
  feedback: string;

  @IsOptional()
  @IsString()
  customerResponse?: string;

  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @IsOptional()
  @IsString()
  leadStatusBefore?: string;

  @IsOptional()
  @IsString()
  leadStatusAfter?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextFollowUpDate?: Date;

  @IsOptional()
  @IsString()
  nextFollowUpPlan?: string;

  @IsOptional()
  @IsBoolean()
  isSiteVisit?: boolean;

  @IsOptional()
  @IsString()
  siteVisitProperty?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  siteVisitRating?: number;

  @IsOptional()
  @IsString()
  siteVisitFeedback?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  interestLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  budgetFit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  timelineFit?: number;
}



