import { IsUUID, IsEnum, IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';
import { PaymentMode } from '../entities/vendor-payment.entity';

export class CreateVendorPaymentDto {
  @IsUUID()
  vendorId: string;

  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string;

  @IsDateString()
  paymentDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  /** Project this payment is charged to (RERA / project-level accounting) */
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
