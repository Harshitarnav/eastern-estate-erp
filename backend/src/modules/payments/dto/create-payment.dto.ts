import { IsString, IsNumber, IsOptional, IsDate, IsUUID, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryLineItemDto {
  @IsString()
  label: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  paymentCode?: string; // Auto-generated if not provided (maps to payment_number column)

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

  // Accept any string so the form can send TOKEN / INSTALLMENT / AGREEMENT / etc.
  // Previously used @IsEnum(PaymentType) which only accepted BOOKING/SALARY/VENDOR/EXPENSE/OTHER
  @IsString()
  paymentType: string;

  // The entity column is payment_mode, DTO property is paymentMethod.
  // The frontend form field is named paymentMode → mapped to paymentMethod in the page layer.
  // Accept any string so NEFT / RTGS / IMPS / DD / ONLINE are all valid.
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  // paymentCategory does not exist as a column in the entity.
  // Make optional so the DTO doesn't reject payloads that omit it.
  @IsOptional()
  @IsString()
  paymentCategory?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  // ── Category split ──────────────────────────────────────────────────────────
  // primary + misc + tax should sum to amount.
  // All optional for backwards-compat; 0 means "not categorised yet".
  @IsOptional()
  @IsNumber()
  @Min(0)
  primaryAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  miscAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  // How to handle tax shortfall when taxAmount < DD's taxAmount.
  // DEFER_TO_REGISTRY  → PRIMARY_PAID status on the DD
  // PARTIAL_PENDING    → PARTIALLY_PAID, escalation paused
  // ESCALATE           → normal overdue cadence continues
  @IsOptional()
  @IsString()
  taxDeferralDisposition?: string;

  // Tagged line-items inside the misc / tax buckets. When provided, the
  // service derives miscAmount / taxAmount from these sums.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryLineItemDto)
  miscBreakdown?: CategoryLineItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryLineItemDto)
  taxBreakdown?: CategoryLineItemDto[];

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

  // Entity property is transactionReference, column is transaction_id.
  // The frontend form field is named transactionId → mapped to transactionReference in the page layer.
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
  @IsString()
  status?: string;

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
