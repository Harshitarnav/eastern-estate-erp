import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { Property } from '../../properties/entities/property.entity';

export enum BookingStatus {
  TOKEN_PAID = 'TOKEN_PAID',
  AGREEMENT_PENDING = 'AGREEMENT_PENDING',
  AGREEMENT_SIGNED = 'AGREEMENT_SIGNED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  TRANSFERRED = 'TRANSFERRED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

/**
 * Booking Entity
 * 
 * Represents a property booking made by a customer.
 * Links Customer → Flat → Property
 */
@Entity('bookings')
@Index(['customerId'])
@Index(['flatId'])
@Index(['propertyId'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Booking Reference
  @Column({ length: 50, unique: true })
  @Index()
  bookingNumber: string;

  // Relationships
  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid' })
  flatId: string;

  @ManyToOne(() => Flat)
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @Column({ type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  // Booking Status
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.TOKEN_PAID,
  })
  @Index()
  status: BookingStatus;

  @Column({ type: 'date' })
  bookingDate: Date;

  // Financial Details
  @Column('decimal', { precision: 15, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  tokenAmount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  agreementAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  paymentStatus: PaymentStatus;

  // Token Details
  @Column({ type: 'date', nullable: true })
  tokenPaidDate: Date;

  @Column({ length: 100, nullable: true })
  tokenReceiptNumber: string;

  @Column({ length: 100, nullable: true })
  tokenPaymentMode: string;

  // Agreement Details
  @Column({ length: 100, nullable: true })
  agreementNumber: string;

  @Column({ type: 'date', nullable: true })
  agreementDate: Date;

  @Column({ type: 'date', nullable: true })
  agreementSignedDate: Date;

  @Column({ type: 'text', nullable: true })
  agreementDocumentUrl: string;

  // Important Dates
  @Column({ type: 'date', nullable: true })
  expectedPossessionDate: Date;

  @Column({ type: 'date', nullable: true })
  actualPossessionDate: Date;

  @Column({ type: 'date', nullable: true })
  registrationDate: Date;

  // Discounts & Charges
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ length: 200, nullable: true })
  discountReason: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  stampDuty: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  registrationCharges: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  gstAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  maintenanceDeposit: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  parkingCharges: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  otherCharges: number;

  // Loan Details
  @Column({ type: 'boolean', default: false })
  isHomeLoan: boolean;

  @Column({ length: 100, nullable: true })
  bankName: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  loanAmount: number;

  @Column({ length: 100, nullable: true })
  loanApplicationNumber: string;

  @Column({ type: 'date', nullable: true })
  loanApprovalDate: Date;

  @Column({ type: 'date', nullable: true })
  loanDisbursementDate: Date;

  // Nominees
  @Column({ length: 200, nullable: true })
  nominee1Name: string;

  @Column({ length: 100, nullable: true })
  nominee1Relation: string;

  @Column({ length: 200, nullable: true })
  nominee2Name: string;

  @Column({ length: 100, nullable: true })
  nominee2Relation: string;

  // Co-Applicants
  @Column({ length: 200, nullable: true })
  coApplicantName: string;

  @Column({ length: 200, nullable: true })
  coApplicantEmail: string;

  @Column({ length: 20, nullable: true })
  coApplicantPhone: string;

  @Column({ length: 100, nullable: true })
  coApplicantRelation: string;

  // Cancellation Details
  @Column({ type: 'date', nullable: true })
  cancellationDate: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ type: 'date', nullable: true })
  refundDate: Date;

  // Documents
  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  // Notes & Remarks
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  specialTerms: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // System Fields
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
