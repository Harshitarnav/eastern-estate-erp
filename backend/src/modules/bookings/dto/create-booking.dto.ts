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
} from 'class-validator';
import { BookingStatus, PaymentStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  bookingNumber: string;

  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @IsUUID()
  flatId: string;

  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsNotEmpty()
  @IsDateString()
  bookingDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tokenAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  agreementAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balanceAmount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  tokenPaidDate?: string;

  @IsOptional()
  @IsString()
  tokenReceiptNumber?: string;

  @IsOptional()
  @IsString()
  tokenPaymentMode?: string;

  @IsOptional()
  @IsString()
  agreementNumber?: string;

  @IsOptional()
  @IsDateString()
  agreementDate?: string;

  @IsOptional()
  @IsDateString()
  agreementSignedDate?: string;

  @IsOptional()
  @IsString()
  agreementDocumentUrl?: string;

  @IsOptional()
  @IsDateString()
  expectedPossessionDate?: string;

  @IsOptional()
  @IsDateString()
  actualPossessionDate?: string;

  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  discountReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stampDuty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationCharges?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gstAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenanceDeposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  parkingCharges?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCharges?: number;

  @IsOptional()
  @IsBoolean()
  isHomeLoan?: boolean;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loanAmount?: number;

  @IsOptional()
  @IsString()
  loanApplicationNumber?: string;

  @IsOptional()
  @IsDateString()
  loanApprovalDate?: string;

  @IsOptional()
  @IsDateString()
  loanDisbursementDate?: string;

  @IsOptional()
  @IsString()
  nominee1Name?: string;

  @IsOptional()
  @IsString()
  nominee1Relation?: string;

  @IsOptional()
  @IsString()
  nominee2Name?: string;

  @IsOptional()
  @IsString()
  nominee2Relation?: string;

  @IsOptional()
  @IsString()
  coApplicantName?: string;

  @IsOptional()
  @IsString()
  coApplicantEmail?: string;

  @IsOptional()
  @IsString()
  coApplicantPhone?: string;

  @IsOptional()
  @IsString()
  coApplicantRelation?: string;

  @IsOptional()
  @IsDateString()
  cancellationDate?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsDateString()
  refundDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialTerms?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
