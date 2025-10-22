import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType, PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  paymentCode?: string; // Auto-generated if not provided

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  paymentCategory: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  // Bank Details
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  chequeDate?: Date;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
