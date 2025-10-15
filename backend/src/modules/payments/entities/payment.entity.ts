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
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum PaymentType {
  TOKEN = 'TOKEN',
  AGREEMENT = 'AGREEMENT',
  INSTALLMENT = 'INSTALLMENT',
  FINAL = 'FINAL',
  ADVANCE = 'ADVANCE',
  REFUND = 'REFUND',
  OTHER = 'OTHER',
}

export enum PaymentMode {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CARD = 'CARD',
  RTGS = 'RTGS',
  NEFT = 'NEFT',
  IMPS = 'IMPS',
  DD = 'DD',
  ONLINE = 'ONLINE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

/**
 * Payment Entity
 * 
 * Tracks all payments received for bookings.
 * Supports multiple payment types and modes.
 */
@Entity('payments')
@Index(['bookingId'])
@Index(['customerId'])
@Index(['paymentDate'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Payment Reference
  @Column({ length: 50, unique: true })
  @Index()
  paymentNumber: string;

  @Column({ length: 100, nullable: true })
  @Index()
  receiptNumber: string;

  // Relationships
  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Payment Details
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.INSTALLMENT,
  })
  @Index()
  paymentType: PaymentType;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentMode,
  })
  paymentMode: PaymentMode;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // Bank/Cheque Details
  @Column({ length: 100, nullable: true })
  bankName: string;

  @Column({ length: 100, nullable: true })
  branchName: string;

  @Column({ length: 100, nullable: true })
  chequeNumber: string;

  @Column({ type: 'date', nullable: true })
  chequeDate: Date;

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'date', nullable: true })
  clearanceDate: Date;

  // UPI/Online Details
  @Column({ length: 200, nullable: true })
  upiId: string;

  @Column({ length: 200, nullable: true })
  onlinePaymentId: string;

  // Installment Details
  @Column({ type: 'int', nullable: true })
  installmentNumber: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  lateFee: number;

  // TDS/GST
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  tdsAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  tdsPercentage: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  gstAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  gstPercentage: number;

  @Column('decimal', { precision: 15, scale: 2 })
  netAmount: number;

  // Receipt Details
  @Column({ type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ type: 'boolean', default: false })
  receiptGenerated: boolean;

  @Column({ type: 'date', nullable: true })
  receiptDate: Date;

  // Verification
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  // Bounced/Cancellation Details
  @Column({ type: 'date', nullable: true })
  bouncedDate: Date;

  @Column({ type: 'text', nullable: true })
  bounceReason: string;

  @Column({ type: 'date', nullable: true })
  cancellationDate: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  // Refund Details
  @Column({ type: 'boolean', default: false })
  isRefund: boolean;

  @Column({ type: 'uuid', nullable: true })
  refundForPaymentId: string;

  @Column({ type: 'date', nullable: true })
  refundDate: Date;

  // Documents
  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  // Notes & Remarks
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

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

  @Column({ type: 'uuid', nullable: true })
  receivedBy: string;
}
