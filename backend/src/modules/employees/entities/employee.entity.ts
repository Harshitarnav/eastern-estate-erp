import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => (value === null || value === undefined ? null : parseFloat(value)),
};

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  CONSULTANT = 'CONSULTANT',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
}

export enum Department {
  MANAGEMENT = 'MANAGEMENT',
  SALES = 'SALES',
  MARKETING = 'MARKETING',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  HR = 'HR',
  IT = 'IT',
  CONSTRUCTION = 'CONSTRUCTION',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  LEGAL = 'LEGAL',
}

/**
 * Employee Entity
 * 
 * Manages employee information, attendance, and payroll.
 */
@Entity('employees')
@Index(['employeeCode'])
@Index(['department'])
@Index(['employmentStatus'])
@Index(['isActive'])
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ length: 50, unique: true })
  employeeCode: string;

  @Column({ length: 200 })
  fullName: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 50, nullable: true })
  alternatePhone: string;

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ length: 50, nullable: true })
  bloodGroup: string;

  @Column({ length: 50, nullable: true })
  maritalStatus: string;

  // Address
  @Column({ type: 'text', nullable: true })
  currentAddress: string;

  @Column({ type: 'text', nullable: true })
  permanentAddress: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  pincode: string;

  // Employment Details
  @Column({
    type: 'enum',
    enum: Department,
    nullable: true,
  })
  department: Department;

  @Column({ length: 200, nullable: true })
  designation: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    nullable: true,
  })
  employmentType: EmploymentType;

  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  employmentStatus: EmploymentStatus;

  @Column({ type: 'date', nullable: true })
  joiningDate: Date;

  @Column({ type: 'date', nullable: true })
  confirmationDate: Date;

  @Column({ type: 'date', nullable: true })
  resignationDate: Date;

  @Column({ type: 'date', nullable: true })
  lastWorkingDate: Date;

  // Reporting
  @Column({ type: 'uuid', nullable: true })
  reportingManagerId: string;

  @Column({ length: 200, nullable: true })
  reportingManagerName: string;

  // Salary & Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  houseRentAllowance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  transportAllowance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  medicalAllowance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  otherAllowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  pfDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  esiDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  taxDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  netSalary: number;

  // Bank Details
  @Column({ length: 200, nullable: true })
  bankName: string;

  @Column({ length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ length: 50, nullable: true })
  ifscCode: string;

  @Column({ length: 200, nullable: true })
  branchName: string;

  // Documents
  @Column({ length: 50, nullable: true })
  aadharNumber: string;

  @Column({ length: 50, nullable: true })
  panNumber: string;

  @Column({ length: 50, nullable: true })
  pfNumber: string;

  @Column({ length: 50, nullable: true })
  esiNumber: string;

  @Column({ length: 50, nullable: true })
  uanNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  // Emergency Contact
  @Column({ length: 200, nullable: true })
  emergencyContactName: string;

  @Column({ length: 50, nullable: true })
  emergencyContactPhone: string;

  @Column({ length: 100, nullable: true })
  emergencyContactRelation: string;

  // Leave Management
  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0, transformer: decimalTransformer })
  casualLeaveBalance: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0, transformer: decimalTransformer })
  sickLeaveBalance: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0, transformer: decimalTransformer })
  earnedLeaveBalance: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0, transformer: decimalTransformer })
  leaveTaken: number;

  // Attendance
  @Column({ type: 'int', default: 0 })
  totalPresent: number;

  @Column({ type: 'int', default: 0 })
  totalAbsent: number;

  @Column({ type: 'int', default: 0 })
  totalLateArrival: number;

  // Performance
  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  performanceRating: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewDate: Date;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // User Account Link
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  // System Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
