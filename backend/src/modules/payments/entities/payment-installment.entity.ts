import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from './payment.entity';

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
  PARTIAL = 'PARTIAL',
}

@Entity('payment_installments')
export class PaymentInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  installmentNumber: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.PENDING,
  })
  status: InstallmentStatus;

  @Column({ nullable: true })
  paymentId: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  // Late fees
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  lateFee: number;

  @Column({ default: false })
  lateFeeWaived: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
