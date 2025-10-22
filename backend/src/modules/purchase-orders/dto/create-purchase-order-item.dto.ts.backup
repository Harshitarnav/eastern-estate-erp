import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  purchaseOrderId: string;

  @IsUUID()
  materialId: string;

  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
