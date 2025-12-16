/**
 * @file sales-target.entity.ts
 * @description Sales target entity for tracking sales person targets
 * @module EmployeesModule
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
import { User } from '../../users/entities/user.entity';

export enum TargetPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
}

export enum TargetStatus {
  ACTIVE = 'ACTIVE',
  ACHIEVED = 'ACHIEVED',
  MISSED = 'MISSED',
  IN_PROGRESS = 'IN_PROGRESS',
}

/**
 * SalesTarget Entity
 * 
 * Tracks sales targets for individual sales representatives.
 * Used for performance measurement and incentive calculations.
 */
@Entity('sales_targets')
@Index(['salesPersonId', 'targetPeriod', 'startDate'])
@Index(['targetPeriod', 'status'])
export class SalesTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Sales Person Reference
  @Column({ type: 'uuid' })
  @Index()
  salesPersonId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sales_person_id' })
  salesPerson: User;

  // Target Period
  @Column({
    type: 'enum',
    enum: TargetPeriod,
  })
  @Index()
  targetPeriod: TargetPeriod;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  // Target Metrics
  @Column('int', { default: 0 })
  targetLeads: number; // Number of leads to generate

  @Column('int', { default: 0 })
  targetSiteVisits: number; // Number of site visits to conduct

  @Column('int', { default: 0 })
  targetConversions: number; // Number of conversions

  @Column('int', { default: 0 })
  targetBookings: number; // Number of bookings

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  targetRevenue: number; // Revenue target in INR

  // Self Target (Set by sales person themselves)
  @Column('int', { default: 0 })
  selfTargetBookings: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  selfTargetRevenue: number;

  @Column({ type: 'text', nullable: true })
  selfTargetNotes: string;

  // Achievement
  @Column('int', { default: 0 })
  achievedLeads: number;

  @Column('int', { default: 0 })
  achievedSiteVisits: number;

  @Column('int', { default: 0 })
  achievedConversions: number;

  @Column('int', { default: 0 })
  achievedBookings: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  achievedRevenue: number;

  // Achievement Percentages (Calculated)
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  leadsAchievementPct: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  siteVisitsAchievementPct: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  conversionsAchievementPct: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  bookingsAchievementPct: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  revenueAchievementPct: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  overallAchievementPct: number;

  // Incentive Calculation
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  baseIncentive: number; // Base incentive amount

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  earnedIncentive: number; // Calculated based on achievement

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  bonusIncentive: number; // Bonus for exceeding target

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalIncentive: number; // Total incentive earned

  @Column({ type: 'boolean', default: false })
  incentivePaid: boolean;

  @Column({ type: 'date', nullable: true })
  incentivePaidDate: Date;

  // Motivational Messages
  @Column({ type: 'text', nullable: true })
  motivationalMessage: string; // "You missed your incentive by 2 sales, try harder!"

  @Column('int', { default: 0 })
  missedBy: number; // Number of sales/bookings missed

  // Status
  @Column({
    type: 'enum',
    enum: TargetStatus,
    default: TargetStatus.IN_PROGRESS,
  })
  @Index()
  status: TargetStatus;

  // Set By
  @Column({ type: 'uuid', nullable: true })
  setBy: string; // Sales Manager/GM who set the target

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
  updatedBy: string;
}





