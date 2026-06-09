import {
 Entity,
 PrimaryGeneratedColumn,
 Column,
 CreateDateColumn,
 UpdateDateColumn,
 ManyToOne,
 JoinColumn,
 OneToMany,
} from 'typeorm';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};

// For NOT NULL category columns: coerce nullish → 0 so an insert that omits
// the field never trips the not-null constraint.
const zeroDecimalTransformer = {
  to: (value?: number | null) => (value ?? 0),
  from: (value: string | null) =>
    value === null || value === undefined ? 0 : Number(value),
};
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentRefund } from './payment-refund.entity';

export enum PaymentType {
  BOOKING = 'BOOKING',
  SALARY = 'SALARY',
  VENDOR = 'VENDOR',
  EXPENSE = 'EXPENSE',
  REGISTRY = 'REGISTRY',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

/**
 * A single tagged line-item inside the Misc or Tax bucket, describing what
 * a portion of that category truly is (e.g. "Covered parking" / "GST on
 * construction"). The sum of a bucket's line-items equals its category total.
 */
export interface CategoryLineItem {
  label: string;
  amount: number;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_number', unique: true })
  paymentCode: string;

  // References
  @Column({ name: 'booking_id', nullable: true })
  bookingId: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  // Payment Details
  @Column({ name: 'payment_type' })
  paymentType: string;

  @Column({ name: 'payment_mode' })
  paymentMethod: string;


  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  amount: number;

  // ── Category split: primary + misc + tax must sum to amount ─────────────
  @Column({ name: 'primary_amount', type: 'decimal', precision: 15, scale: 2, default: 0, transformer: zeroDecimalTransformer })
  primaryAmount: number;

  @Column({ name: 'misc_amount', type: 'decimal', precision: 15, scale: 2, default: 0, transformer: zeroDecimalTransformer })
  miscAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0, transformer: zeroDecimalTransformer })
  taxAmount: number;

  // Tagged line-items that itemise the misc / tax buckets. Each sums to the
  // corresponding category total above.
  @Column({ name: 'misc_breakdown', type: 'jsonb', default: () => "'[]'" })
  miscBreakdown: CategoryLineItem[];

  @Column({ name: 'tax_breakdown', type: 'jsonb', default: () => "'[]'" })
  taxBreakdown: CategoryLineItem[];

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  // Bank Details
  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionReference: string;

  @Column({ name: 'cheque_number', nullable: true })
  chequeNumber: string;

  @Column({ name: 'cheque_date', type: 'date', nullable: true })
  chequeDate: Date;

  @Column({ name: 'utr_number', nullable: true })
  upiId: string;

  // Status
  @Column({ name: 'payment_status', default: 'PENDING' })
  status: string;

  // Receipt
  @Column({ name: 'receipt_number', nullable: true })
  receiptNumber: string;

  // Audit / Extra DB columns
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifier: User;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
