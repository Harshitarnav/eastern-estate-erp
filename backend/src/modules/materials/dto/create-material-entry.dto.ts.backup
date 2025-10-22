import { IsUUID, IsEnum, IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { EntryType } from '../entities/material-entry.entity';

export class CreateMaterialEntryDto {
  @IsUUID()
  materialId: string;

  @IsEnum(EntryType)
  entryType: EntryType;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalValue: number;

  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string;

  @IsDateString()
  @IsOptional()
  entryDate?: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
