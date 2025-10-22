import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { BudgetStatus } from '../entities/budget.entity';

export class CreateBudgetDto {
  @IsOptional()
  @IsString()
  budgetCode?: string; // Auto-generated if not provided

  @IsString()
  @MaxLength(200)
  budgetName: string;

  @IsNumber()
  fiscalYear: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsNumber()
  @Min(0)
  budgetedAmount: number;

  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  budgetName?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetedAmount?: number;

  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
