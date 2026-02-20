import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(/@eecd\.in$/, { 
    message: 'Email must end with @eecd.in domain' 
  })
  email: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  alternatePhone?: string;

  @IsString()
  profilePicture?: string;

  dateOfBirth?: string | Date;

  @IsString()
  gender?: string;

  @IsString()
  currentAddress?: string;

  @IsString()
  department?: string;

  @IsString()
  designation?: string;

  @IsString()
  employmentType?: string;

  joiningDate?: string | Date;

  basicSalary?: number;

  houseRentAllowance?: number;

  transportAllowance?: number;

  medicalAllowance?: number;

  @IsString()
  bankName?: string;

  @IsString()
  bankAccountNumber?: string;

  @IsString()
  ifscCode?: string;

  @IsString()
  aadharNumber?: string;

  @IsString()
  panNumber?: string;

  @IsString()
  notes?: string;
}
