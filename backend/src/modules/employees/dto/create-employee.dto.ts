import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEmail,
  Min,
} from 'class-validator';
import { EmploymentType, EmploymentStatus, Department } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeCode: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsString()
  currentAddress: string;

  @IsNotEmpty()
  @IsEnum(Department)
  department: Department;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNotEmpty()
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsNotEmpty()
  @IsDateString()
  joiningDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  houseRentAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  medicalAllowance?: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
