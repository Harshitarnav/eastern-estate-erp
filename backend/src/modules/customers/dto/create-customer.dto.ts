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
  // helper to drop empty strings/nulls for optional fields
  private static toOptionalString = ({ value }: { value: any }) =>
    value === undefined || value === null || value === '' ? undefined : String(value);

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(CreateCustomerDto.toOptionalString)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(CreateCustomerDto.toOptionalString)
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  email?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  phone?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  alternatePhone?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  gender?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  address?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  city?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  state?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  pincode?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  occupation?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  annualIncome?: number;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  company?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  panNumber?: string;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
  aadharNumber?: string;

  @IsBoolean()
  @IsOptional()
  needsHomeLoan?: boolean;

  @IsString()
  @IsOptional()
  @Transform(CreateCustomerDto.toOptionalString)
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
  @Transform(CreateCustomerDto.toOptionalString)
  propertyId?: string;
}
