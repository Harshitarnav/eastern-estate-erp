import { IsUUID, IsOptional, IsNumber, IsString, IsEnum, IsObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { DemandDraftStatus } from '../entities/demand-draft.entity';

export class CreateDemandDraftDto {
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

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsEnum(DemandDraftStatus)
  status?: DemandDraftStatus;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
