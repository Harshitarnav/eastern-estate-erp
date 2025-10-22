import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { EmploymentType, EmploymentStatus, Department } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  employeeCode: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  dateOfBirth?: string | Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  joiningDate?: string | Date;

  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @IsOptional()
  @IsNumber()
  houseRentAllowance?: number;

  @IsOptional()
  @IsNumber()
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
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
