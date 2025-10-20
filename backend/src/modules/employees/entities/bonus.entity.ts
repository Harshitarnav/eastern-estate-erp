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
import { Employee } from './employee.entity';

export enum BonusType {
  PERFORMANCE = 'PERFORMANCE',
  FESTIVAL = 'FESTIVAL',
  ANNUAL = 'ANNUAL',
  PROJECT_COMPLETION = 'PROJECT_COMPLETION',
  RETENTION = 'RETENTION',
  REFERRAL = 'REFERRAL',
  SPOT_AWARD = 'SPOT_AWARD',
  SALES_INCENTIVE = 'SALES_INCENTIVE',
  OTHER = 'OTHER',
}

export enum BonusStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

/**
 * Bonus Entity
 * 
 * Tracks employee bonuses and incentives
 */
@Entity('bonuses')
@Index(['employeeId'])
@Index(['bonusType'])
@Index(['bonusStatus'])
@Index(['bonusDate'])
export class Bonus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Employee Reference
  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Bonus Details
  @Column({
    type: 'enum',
    enum: BonusType,
  })
  bonusType: BonusType;

  @Column({ length: 200 })
  bonusTitle: string;

  @Column({ type: 'text', nullable: true })
  bonusDescription: string;

  @Column('decimal', { precision: 15, scale: 2 })
  bonusAmount: number;

  @Column({ type: 'date' })
  bonusDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  // Performance Metrics (for performance bonuses)
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  performanceRating: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  targetAmount: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  achievedAmount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  achievementPercentage: number;

  // Status & Approval
  @Column({
    type: 'enum',
    enum: BonusStatus,
    default: BonusStatus.PENDING,
  })
  bonusStatus: BonusStatus;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ length: 200, nullable: true })
  approvedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalRemarks: string;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Payment Details
  @Column({ length: 100, nullable: true })
  transactionReference: string;

  @Column({ length: 200, nullable: true })
  paymentMode: string;

  @Column({ type: 'text', nullable: true })
  paymentRemarks: string;

  // Tax Handling
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  taxDeduction: number;

  @Column('decimal', { precision: 15, scale: 2 })
  netBonusAmount: number;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // System Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
