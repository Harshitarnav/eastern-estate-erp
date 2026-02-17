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
import { User } from '../../users/entities/user.entity';

export enum PaymentPlanType {
  CONSTRUCTION_LINKED = 'CONSTRUCTION_LINKED',
  TIME_LINKED = 'TIME_LINKED',
  DOWN_PAYMENT = 'DOWN_PAYMENT',
}

export interface PaymentMilestone {
  sequence: number;
  name: string;
  constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
  phasePercentage: number | null; // Percentage of phase completion (e.g., 50, 100)
  paymentPercentage: number; // Percentage of total amount
  description: string;
}

/**
 * Payment Plan Template Entity
 * 
 * Defines reusable payment plan templates with milestone definitions.
 * Used as blueprints for creating actual payment plans for flats.
 */
@Entity('payment_plan_templates')
@Index(['type'])
@Index(['isActive'])
export class PaymentPlanTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: PaymentPlanType,
  })
  type: PaymentPlanType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  milestones: PaymentMilestone[];

  @Column({ name: 'total_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 })
  totalPercentage: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

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
