import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

// Helper: treat empty string the same as undefined so @IsOptional skips validators
const trimToUndefined = ({ value }: { value: any }) =>
  value === '' || value === null ? undefined : value;

export class CreateEmployeeDto {
  // ─── Required fields ────────────────────────────────────────────────────────

  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  // ─── Basic Information ───────────────────────────────────────────────────────

  // Email is optional (not all employees have a company account at creation time).
  // When provided it must be a valid email address (any domain).
  @IsOptional()
  @Transform(trimToUndefined)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  profilePicture?: string;

  @Transform(trimToUndefined)
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string | Date;

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  maritalStatus?: string;

  // ─── Address ─────────────────────────────────────────────────────────────────

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  currentAddress: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  state?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  pincode?: string;

  // ─── Employment Details ───────────────────────────────────────────────────────

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  department: string;

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  designation: string;

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  employmentType: string;

  @Transform(trimToUndefined)
  @IsString()
  @IsNotEmpty()
  employmentStatus: string;

  @Transform(trimToUndefined)
  @IsNotEmpty()
  @IsDateString()
  joiningDate: string | Date;

  @IsOptional()
  @Transform(trimToUndefined)
  confirmationDate?: string | Date;

  @IsOptional()
  @Transform(trimToUndefined)
  resignationDate?: string | Date;

  @IsOptional()
  @Transform(trimToUndefined)
  lastWorkingDate?: string | Date;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  reportingManagerName?: string;

  // ─── Salary & Compensation ────────────────────────────────────────────────────

  @IsOptional()
  basicSalary?: number;

  @IsOptional()
  houseRentAllowance?: number;

  @IsOptional()
  transportAllowance?: number;

  @IsOptional()
  medicalAllowance?: number;

  @IsOptional()
  otherAllowances?: number;

  /** Frontend may send a pre-computed gross; backend will recalculate when components change. */
  @IsOptional()
  grossSalary?: number;

  @IsOptional()
  pfDeduction?: number;

  @IsOptional()
  esiDeduction?: number;

  @IsOptional()
  taxDeduction?: number;

  @IsOptional()
  otherDeductions?: number;

  /** Frontend may send a pre-computed net; backend will use it unless components change. */
  @IsOptional()
  netSalary?: number;

  // ─── Bank Details ─────────────────────────────────────────────────────────────

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
  branchName?: string;

  // ─── Documents & IDs ─────────────────────────────────────────────────────────

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
  pfNumber?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  esiNumber?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  uanNumber?: string;

  // ─── Emergency Contact ────────────────────────────────────────────────────────

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  emergencyContactRelation?: string;

  // ─── Leave & Attendance ───────────────────────────────────────────────────────

  @IsOptional()
  casualLeaveBalance?: number;

  @IsOptional()
  sickLeaveBalance?: number;

  @IsOptional()
  earnedLeaveBalance?: number;

  @IsOptional()
  leaveTaken?: number;

  @IsOptional()
  totalPresent?: number;

  @IsOptional()
  totalAbsent?: number;

  @IsOptional()
  totalLateArrival?: number;

  // ─── Performance & Qualifications ────────────────────────────────────────────

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  skills?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  qualifications?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  experience?: string;

  @IsOptional()
  performanceRating?: number;

  // ─── Additional ───────────────────────────────────────────────────────────────

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  notes?: string;
}
