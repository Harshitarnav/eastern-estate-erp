import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ length: 50, unique: true })
  @Index()
  employeeCode: string;

  @Column({ length: 200 })
  fullName: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @Column({ length: 50 })
  phoneNumber: string;

  @Column({ length: 50, nullable: true })
  alternatePhone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 20 })
  gender: string;

  @Column({ length: 50, nullable: true })
  bloodGroup: string;

  @Column({ length: 50, nullable: true })
  maritalStatus: string;

  // Address
  @Column({ type: 'text' })
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
  })
  @Index()
  department: Department;

  @Column({ length: 200 })
  designation: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
  })
  employmentType: EmploymentType;

  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  @Index()
  employmentStatus: EmploymentStatus;

  @Column({ type: 'date' })
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
  @Column('decimal', { precision: 15, scale: 2 })
  basicSalary: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  houseRentAllowance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  transportAllowance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  medicalAllowance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  otherAllowances: number;

  @Column('decimal', { precision: 15, scale: 2 })
  grossSalary: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  pfDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  esiDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  taxDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column('decimal', { precision: 15, scale: 2 })
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
  @Column({ type: 'int', default: 0 })
  casualLeaveBalance: number;

  @Column({ type: 'int', default: 0 })
  sickLeaveBalance: number;

  @Column({ type: 'int', default: 0 })
  earnedLeaveBalance: number;

  @Column({ type: 'int', default: 0 })
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

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  performanceRating: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewDate: Date;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

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
