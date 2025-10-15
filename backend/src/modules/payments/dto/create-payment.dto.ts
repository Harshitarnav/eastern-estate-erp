import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  Min,
  IsInt,
} from 'class-validator';
import { PaymentType, PaymentMode, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentNumber: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;

  @IsNotEmpty()
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @IsDateString()
  chequeDate?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsDateString()
  clearanceDate?: string;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsString()
  onlinePaymentId?: string;

  @IsOptional()
  @IsInt()
  installmentNumber?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tdsAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tdsPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gstPercentage?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  netAmount: number;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsBoolean()
  receiptGenerated?: boolean;

  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
