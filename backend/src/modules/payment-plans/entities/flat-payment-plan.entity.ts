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
import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { PaymentPlanTemplate } from './payment-plan-template.entity';
import { User } from '../../users/entities/user.entity';

export enum FlatPaymentPlanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface FlatPaymentMilestone {
  sequence: number;
  name: string;
  constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
  phasePercentage: number | null;
  amount: number;
  dueDate: string | null;
  status: 'PENDING' | 'TRIGGERED' | 'PAID' | 'OVERDUE';
  paymentScheduleId: string | null;
  constructionCheckpointId: string | null;
  demandDraftId: string | null;
  paymentId: string | null;
  completedAt: string | null;
  description: string;
}

/**
 * Flat Payment Plan Entity
 * 
 * Actual payment plan instance for a specific flat.
 * Created from a template and tracks milestone completion.
 */
@Entity('flat_payment_plans')
@Index(['flatId'])
@Index(['bookingId'])
@Index(['customerId'])
@Index(['status'])
export class FlatPaymentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'flat_id', type: 'uuid' })
  flatId: string;

  @ManyToOne(() => Flat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'payment_plan_template_id', type: 'uuid', nullable: true })
  paymentPlanTemplateId: string;

  @ManyToOne(() => PaymentPlanTemplate, { nullable: true })
  @JoinColumn({ name: 'payment_plan_template_id' })
  paymentPlanTemplate: PaymentPlanTemplate;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'balance_amount', type: 'decimal', precision: 15, scale: 2 })
  balanceAmount: number;

  @Column({ type: 'jsonb' })
  milestones: FlatPaymentMilestone[];

  @Column({
    type: 'enum',
    enum: FlatPaymentPlanStatus,
    default: FlatPaymentPlanStatus.ACTIVE,
  })
  status: FlatPaymentPlanStatus;

  // ── Legacy / collections controls ───────────────────────────────────────
  // True when this plan represents a pre-ERP booking being back-filled.
  // The overdue scanner uses `imported_at` as the reminder-cadence baseline
  // instead of the raw milestone due_date when this flag is set.
  @Column({ name: 'is_legacy_import', type: 'boolean', default: false })
  @Index()
  isLegacyImport: boolean;

  // Timestamp of import (baseline for reminder cadence on legacy plans).
  @Column({ name: 'imported_at', type: 'timestamp', nullable: true })
  importedAt: Date | null;

  // Optional starting tier for overdue milestones on legacy imports.
  // 0 = gentle/on-time, 1..4 map to REMINDER_1..REMINDER_4. Admin picks
  // this on the Legacy Import form so very-old overdues can start firm.
  @Column({ name: 'initial_escalation_level', type: 'int', default: 0 })
  initialEscalationLevel: number;

  // Master switch for automated reminders on this plan. Defaults to true
  // for new plans; legacy plans older than
  // company_settings.legacy_auto_remind_max_age_days default to false and
  // require a human to flip this on.
  @Column({ name: 'reminders_enabled', type: 'boolean', default: true })
  remindersEnabled: boolean;

  // Pause automated reminders on this plan until the given timestamp
  // (customer in settlement talks, hospital, Diwali holiday, etc.).
  @Column({ name: 'pause_reminders_until', type: 'timestamp', nullable: true })
  pauseRemindersUntil: Date | null;

  // Idempotency token for bulk legacy imports.
  @Column({ name: 'import_batch_id', type: 'varchar', length: 64, nullable: true })
  @Index()
  importBatchId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
