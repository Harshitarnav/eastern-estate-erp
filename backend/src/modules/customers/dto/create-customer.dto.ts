import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CustomerType, KYCStatus } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  phone?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  alternatePhone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  address?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  city?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  state?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  pincode?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  occupation?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  annualIncome?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  company?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  panNumber?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  aadharNumber?: string;

  @IsBoolean()
  @IsOptional()
  needsHomeLoan?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVIP?: boolean;

  @IsEnum(KYCStatus)
  @IsOptional()
  kycStatus?: KYCStatus;

  @IsString()
  @IsOptional()
  propertyId?: string;
}
