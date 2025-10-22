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
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentRefund } from './payment-refund.entity';

export enum PaymentType {
  BOOKING = 'BOOKING',
  SALARY = 'SALARY',
  VENDOR = 'VENDOR',
  EXPENSE = 'EXPENSE',
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


  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 2 })
  amount: number;

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
}
