import { PartialType } from '@nestjs/mapped-types';
import { CreateDemandDraftDto } from './create-demand-draft.dto';
import { IsEnum, IsOptional, IsString, IsNumber, IsUUID, IsObject } from 'class-validator';
import { DemandDraftStatus } from '../entities/demand-draft.entity';
import { Type } from 'class-transformer';

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
