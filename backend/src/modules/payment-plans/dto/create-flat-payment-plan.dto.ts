import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateFlatPaymentPlanDto {
  @IsUUID()
  @IsNotEmpty()
  flatId: string;

  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsNotEmpty()
  paymentPlanTemplateId: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
