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

export enum CustomerRequirementType {
  END_USER = 'END_USER',
  INVESTOR = 'INVESTOR',
  BOTH = 'BOTH',
}

export enum PropertyPreference {
  FLAT = 'FLAT',
  DUPLEX = 'DUPLEX',
  PENTHOUSE = 'PENTHOUSE',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL',
  ANY = 'ANY',
}

/**
 * Customer Entity - Matches actual database schema
 */
@Entity('customers')
@Index(['email'])
@Index(['phoneNumber'])
@Index(['isActive'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_code', length: 50, unique: true })
  @Index()
  customerCode: string;

  // Not present in the schema we see; keep disabled to avoid select errors
  @Column({
    name: 'full_name',
    length: 255,
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  fullName: string;

  // Legacy columns still present in the DB (keep in sync to avoid NOT NULL errors)
  @Column({ name: 'first_name', length: 255, nullable: true })
  legacyFirstName: string;

  @Column({ name: 'last_name', length: 255, nullable: true })
  legacyLastName: string;

  // Getters for backward compatibility
  get firstName(): string {
    return this.fullName?.split(' ')[0] || this.legacyFirstName || '';
  }

  get lastName(): string {
    const parts = this.fullName?.split(' ') || [];
    return parts.slice(1).join(' ') || this.legacyLastName || '';
  }

  // Virtual computed full name from legacy fields
  get computedFullName(): string {
    return [this.legacyFirstName, this.legacyLastName].filter(Boolean).join(' ').trim();
  }

  @Column({ length: 255, nullable: true })
  email: string;

  // Map to the actual schema column "phone"
  @Column({ name: 'phone', length: 20 })
  @Index()
  phoneNumber: string;

  // Legacy phone column still present in DB
  @Column({ name: 'phone', length: 20, nullable: true, select: false, insert: false, update: false })
  legacyPhone: string;

  @Column({ name: 'alternate_phone', length: 20, nullable: true })
  alternatePhone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ length: 100, nullable: true })
  occupation: string;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName: string;

  get company(): string {
    return this.companyName;
  }

  @Column({ name: 'address_line1', type: 'text', nullable: true })
  addressLine1: string;

  get address(): string {
    return this.addressLine1;
  }

  @Column({ name: 'address_line2', type: 'text', nullable: true })
  addressLine2: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 10, nullable: true })
  pincode: string;

  @Column({ length: 100, default: 'India' })
  country: string;

  @Column({ name: 'pan_number', length: 20, nullable: true })
  panNumber: string;

  @Column({ name: 'aadhar_number', length: 20, nullable: true })
  aadharNumber: string;

  // Optional/absent columns guarded to avoid select errors on older schemas
  @Column({ name: 'customer_type', length: 50, nullable: true, select: false, insert: false, update: false })
  customerType: string;

  get type(): CustomerType {
    return (this.customerType as CustomerType) || CustomerType.INDIVIDUAL;
  }

  @Column({ name: 'lead_source', length: 100, nullable: true, select: false, insert: false, update: false })
  leadSource: string;

  @Column({
    name: 'assigned_sales_person',
    length: 255,
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  assignedSalesPerson: string;

  @Column({
    name: 'credit_limit',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  creditLimit: number;

  @Column({
    name: 'outstanding_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  outstandingBalance: number;

  @Column({ name: 'total_bookings', type: 'int', nullable: true, select: false, insert: false, update: false })
  totalBookings: number;

  @Column({
    name: 'total_purchases',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  totalPurchases: number;

  get totalSpent(): number {
    return this.totalPurchases || 0;
  }

  @Column({ name: 'kyc_status', length: 50, nullable: true, select: false, insert: false, update: false })
  @Index()
  kycStatus: string;

  @Column({ name: 'kyc_documents', type: 'jsonb', nullable: true, select: false, insert: false, update: false })
  kycDocuments: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true, select: false, insert: false, update: false })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'requirement_type', type: 'varchar', nullable: true, select: false, insert: false, update: false })
  @Index()
  requirementType: string;

  @Column({
    name: 'property_preference',
    type: 'varchar',
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  @Index()
  propertyPreference: string;

  @Column({
    name: 'tentative_purchase_timeframe',
    length: 100,
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  tentativePurchaseTimeframe: string;

  // Virtual properties for backward compatibility (not in DB)
  get lastBookingDate(): Date {
    return this.metadata?.lastBookingDate || null;
  }

  set lastBookingDate(value: Date) {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.lastBookingDate = value;
  }

  get isVIP(): boolean {
    return this.metadata?.isVIP || false;
  }

  get designation(): string {
    return this.metadata?.designation || null;
  }

  get annualIncome(): number {
    return this.metadata?.annualIncome || null;
  }
}
