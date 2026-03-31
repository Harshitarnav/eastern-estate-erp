import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, IsArray, Min, Max, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

// Converts null / empty string → undefined so @IsOptional() skips validation
const toUpperOrUndefined = ({ value }: { value: any }) =>
  value === null || value === undefined || value === '' ? undefined : String(value).trim().toUpperCase();

export class CreateVendorDto {
  @IsString()
  @Length(1, 50)
  vendorCode: string;

  @IsString()
  @Length(1, 255)
  vendorName: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Length(10, 20)
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @Length(10, 20)
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  state?: string;

  @IsString()
  @IsOptional()
  @Length(6, 10)
  pincode?: string;

  @IsString()
  @IsOptional()
  @Length(15, 15)
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST number format (expected: 22AAAAA0000A1Z5)',
  })
  @Transform(toUpperOrUndefined)
  gstNumber?: string;

  @IsString()
  @IsOptional()
  @Length(10, 10)
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN number format (expected: AAAAA0000A)',
  })
  @Transform(toUpperOrUndefined)
  panNumber?: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  bankName?: string;

  @IsString()
  @IsOptional()
  @Length(9, 18)
  bankAccountNumber?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11)
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'Invalid IFSC code format (expected: SBIN0001234)',
  })
  @Transform(toUpperOrUndefined)
  ifscCode?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  materialsSupplied?: string[];

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  outstandingAmount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
