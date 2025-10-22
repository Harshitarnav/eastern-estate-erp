import { IsNumber, IsDate, IsUUID, IsEnum, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InstallmentStatus } from '../entities/payment-installment.entity';

export class CreateInstallmentDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  @Min(1)
  installmentNumber: number;

  dueDate: string | Date;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;

  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @IsOptional()
  paidDate?: string | Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFee?: number;

  @IsOptional()
  @IsBoolean()
  lateFeeWaived?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInstallmentScheduleDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  @Min(1)
  numberOfInstallments: number;

  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  startDate: string | Date;

  @IsNumber()
  @Min(1)
  intervalDays: number; // Days between installments (e.g., 30 for monthly)
}
