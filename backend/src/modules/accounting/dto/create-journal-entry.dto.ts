import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JournalEntryStatus } from '../entities/journal-entry.entity';

export class JournalEntryLineDto {
  @IsString()
  accountId: string;

  @IsNumber()
  @Min(0)
  debitAmount: number;

  @IsNumber()
  @Min(0)
  creditAmount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsOptional()
  @IsString()
  entryNumber?: string; // Auto-generated if not provided

  @IsDateString()
  entryDate: string;

  @IsOptional()
  @IsString()
  referenceType?: string; // PAYMENT, BOOKING, SALARY, EXPENSE, etc.

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];

  @IsOptional()
  @IsEnum(JournalEntryStatus)
  status?: JournalEntryStatus;
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(JournalEntryStatus)
  status?: JournalEntryStatus;
}

export class VoidJournalEntryDto {
  @IsString()
  voidReason: string;
}
