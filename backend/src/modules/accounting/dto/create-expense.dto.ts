import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  expenseCode?: string; // Auto-generated if not provided

  @IsString()
  @MaxLength(100)
  expenseCategory: string; // SALARY, RENT, UTILITIES, MARKETING, MATERIALS, MAINTENANCE, TRAVEL, OTHER

  @IsString()
  @MaxLength(100)
  expenseType: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  expenseSubCategory?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  constructionProjectId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string; // For auto journal entry creation

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  expenseType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: string;
}

export class ApproveExpenseDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectExpenseDto {
  @IsString()
  rejectionReason: string;
}
