import { PartialType } from '@nestjs/mapped-types';
import { CreateDemandDraftDto } from './create-demand-draft.dto';
import { IsEnum, IsOptional, IsString, IsNumber, IsUUID, IsObject, IsArray, ValidateNested, Min } from 'class-validator';
import { DemandDraftStatus } from '../entities/demand-draft.entity';
import { Type } from 'class-transformer';

export class DemandDraftLineItemDto {
  @IsString()
  label: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;
}

export class UpdateDemandDraftDto extends PartialType(CreateDemandDraftDto) {
  @IsOptional()
  @IsEnum(DemandDraftStatus)
  status?: DemandDraftStatus;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  // ── Category split set on the DD review screen ──────────────────────────
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  primaryAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  miscAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DemandDraftLineItemDto)
  miscBreakdown?: DemandDraftLineItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DemandDraftLineItemDto)
  taxBreakdown?: DemandDraftLineItemDto[];

  @IsOptional()
  @IsUUID()
  flatId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsString()
  milestoneId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
