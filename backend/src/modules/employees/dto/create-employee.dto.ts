import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

// Helper: treat empty string the same as undefined so @IsOptional skips validators
const trimToUndefined = ({ value }: { value: any }) =>
  value === '' || value === null ? undefined : value;

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  // Email is optional (not all employees need a login account at creation time).
  // When provided it MUST be a valid @eecd.in address.
  @IsOptional()
  @Transform(trimToUndefined)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Matches(/@eecd\.in$/, {
    message: 'Email must end with @eecd.in domain',
  })
  email?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  dateOfBirth?: string | Date;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  gender?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  designation?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  employmentType?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  joiningDate?: string | Date;

  @IsOptional()
  basicSalary?: number;

  @IsOptional()
  houseRentAllowance?: number;

  @IsOptional()
  transportAllowance?: number;

  @IsOptional()
  medicalAllowance?: number;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  bankName?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  aadharNumber?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  panNumber?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  notes?: string;
}
