import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional, IsBoolean, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentPlanType, PaymentMilestone } from '../entities/payment-plan-template.entity';

export class PaymentMilestoneDto implements PaymentMilestone {
  @IsNumber()
  @Min(1)
  sequence: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  phasePercentage: number | null;

  @IsNumber()
  @Min(0)
  @Max(100)
  paymentPercentage: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreatePaymentPlanTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PaymentPlanType)
  type: PaymentPlanType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMilestoneDto)
  milestones: PaymentMilestoneDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
