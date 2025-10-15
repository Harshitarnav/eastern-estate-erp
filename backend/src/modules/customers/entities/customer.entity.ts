import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  NRI = 'NRI',
}

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/**
 * Customer Entity
 * 
 * Represents verified customers who have been converted from leads
 * or directly registered. Contains KYC information and documentation.
 */
@Entity('customers')
@Index(['email'])
@Index(['phone'])
@Index(['isActive'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  alternatePhone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  pincode: string;

  @Column({ length: 100, default: 'India' })
  country: string;

  // Customer Classification
  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  type: CustomerType;

  @Column({ length: 100, nullable: true })
  occupation: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  annualIncome: number;

  @Column({ length: 100, nullable: true })
  company: string;

  @Column({ length: 100, nullable: true })
  designation: string;

  // KYC Information
  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  @Index()
  kycStatus: KYCStatus;

  @Column({ length: 20, nullable: true })
  panNumber: string;

  @Column({ length: 20, nullable: true })
  aadharNumber: string;

  @Column({ length: 30, nullable: true })
  passportNumber: string;

  @Column({ length: 30, nullable: true })
  voterIdNumber: string;

  @Column({ length: 30, nullable: true })
  drivingLicenseNumber: string;

  @Column({ type: 'text', nullable: true })
  panCardUrl: string;

  @Column({ type: 'text', nullable: true })
  aadharCardUrl: string;

  @Column({ type: 'text', nullable: true })
  photoUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  otherDocuments: string[];

  // Lead Source
  @Column({ type: 'uuid', nullable: true })
  convertedFromLeadId: string;

  @Column({ type: 'date', nullable: true })
  convertedAt: Date;

  @Column({ length: 100, nullable: true })
  referredBy: string;

  // Preferences
  @Column({ type: 'simple-array', nullable: true })
  interestedPropertyTypes: string[];

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMin: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ type: 'simple-array', nullable: true })
  preferredLocations: string[];

  // Financial
  @Column({ type: 'boolean', default: false })
  needsHomeLoan: boolean;

  @Column({ type: 'boolean', default: false })
  hasApprovedLoan: boolean;

  @Column({ length: 100, nullable: true })
  bankName: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  approvedLoanAmount: number;

  // Emergency Contact
  @Column({ length: 200, nullable: true })
  emergencyContactName: string;

  @Column({ length: 20, nullable: true })
  emergencyContactPhone: string;

  @Column({ length: 100, nullable: true })
  emergencyContactRelation: string;

  // Communication Preferences
  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  smsNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  whatsappNotifications: boolean;

  // Statistics
  @Column({ type: 'int', default: 0 })
  totalBookings: number;

  @Column({ type: 'int', default: 0 })
  totalPurchases: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'date', nullable: true })
  lastPurchaseDate: Date;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // System Fields
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVIP: boolean;

  @Column({ type: 'boolean', default: false })
  isBlacklisted: boolean;

  @Column({ type: 'text', nullable: true })
  blacklistReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
