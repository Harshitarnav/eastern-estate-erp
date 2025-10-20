/**
 * @file payment-schedule.entity.ts
 * @description Payment schedule entity for installment tracking
 * @module PaymentsModule
 */

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

export enum ScheduleStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
  PARTIAL = 'PARTIAL',
}

/**
 * PaymentSchedule Entity
 * 
 * Tracks installment schedule for bookings.
 * Each booking can have multiple payment schedules based on the payment plan.
 */
@Entity('payment_schedules')
@Index(['bookingId'])
@Index(['dueDate'])
@Index(['status'])
export class PaymentSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationship to booking
  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  // Schedule Details
  @Column({ length: 50 })
  @Index()
  scheduleNumber: string; // e.g., "BK-2025-001-001"

  @Column('int')
  installmentNumber: number; // 1, 2, 3, etc.

  @Column('int')
  totalInstallments: number; // Total number of installments

  @Column({ type: 'date' })
  dueDate: Date;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string; // e.g., "Token Amount", "1st Installment", "On Possession"

  @Column({ length: 100, nullable: true })
  milestone: string; // For construction-linked plans: "Foundation Complete", "Structure Complete"

  // Payment Tracking
  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.PENDING,
  })
  @Index()
  status: ScheduleStatus;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'uuid', nullable: true })
  paymentId: string; // Reference to actual payment record

  // Late Payment
  @Column({ type: 'boolean', default: false })
  isOverdue: boolean;

  @Column('int', { default: 0 })
  overdueDays: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  // Waiver/Adjustment
  @Column({ type: 'boolean', default: false })
  isWaived: boolean;

  @Column({ type: 'text', nullable: true })
  waiverReason: string;

  @Column({ type: 'date', nullable: true })
  waivedDate: Date;

  @Column({ type: 'uuid', nullable: true })
  waivedBy: string;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  // System Fields
  @Column({ type: 'boolean', default: true })
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



