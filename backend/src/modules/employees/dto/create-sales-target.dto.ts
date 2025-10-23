/**
 * @file create-sales-target.dto.ts
 * @description DTO for creating sales targets
 * @module EmployeesModule
 */

import { IsUUID, IsDate, IsEnum, IsInt, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TargetPeriod } from '../entities/sales-target.entity';

export class CreateSalesTargetDto {
  @IsUUID()
  salesPersonId: string;

  @IsEnum(TargetPeriod)
  targetPeriod: TargetPeriod;

  startDate: string | Date;

  endDate: string | Date;

  // Target Metrics
  @IsOptional()
  @IsInt()
  @Min(0)
  targetLeads?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetSiteVisits?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetConversions?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetBookings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetRevenue?: number;

  // Self Targets
  @IsOptional()
  @IsInt()
  @Min(0)
  selfTargetBookings?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  selfTargetRevenue?: number;

  @IsOptional()
  @IsString()
  selfTargetNotes?: string;

  // Incentive
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseIncentive?: number;

  @IsOptional()
  @IsUUID()
  setBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}




