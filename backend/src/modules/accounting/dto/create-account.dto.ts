import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  accountCode: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  accountName: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  accountCategory: string;

  @IsOptional()
  @IsString()
  parentAccountId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  accountName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountCategory?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
