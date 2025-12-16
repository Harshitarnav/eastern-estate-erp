/**
 * @file followup.entity.ts
 * @description FollowUp entity for tracking all followup interactions with leads
 * @module LeadsModule
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
import { Lead } from './lead.entity';
import { User } from '../../users/entities/user.entity';

export enum FollowUpType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  SITE_VISIT = 'SITE_VISIT',
  VIDEO_CALL = 'VIDEO_CALL',
}

export enum FollowUpOutcome {
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  CALLBACK_REQUESTED = 'CALLBACK_REQUESTED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  DOCUMENTATION_REQUESTED = 'DOCUMENTATION_REQUESTED',
  PRICE_NEGOTIATION = 'PRICE_NEGOTIATION',
  NEEDS_TIME = 'NEEDS_TIME',
  NOT_REACHABLE = 'NOT_REACHABLE',
  WRONG_NUMBER = 'WRONG_NUMBER',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

/**
 * FollowUp Entity
 * 
 * Tracks detailed history of all followup interactions with leads.
 * Essential for sales performance tracking and customer relationship management.
 */
@Entity('followups')
@Index(['leadId', 'followUpDate'])
@Index(['performedBy', 'followUpDate'])
@Index(['nextFollowUpDate'])
export class FollowUp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Lead Reference
  @Column({ type: 'uuid' })
  @Index()
  leadId: string;

  @ManyToOne(() => Lead)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  // FollowUp Details
  @Column({ type: 'date' })
  followUpDate: Date;

  @Column({
    type: 'enum',
    enum: FollowUpType,
  })
  followUpType: FollowUpType;

  @Column('int', { default: 0 })
  durationMinutes: number;

  // Performed By
  @Column({ type: 'uuid' })
  @Index()
  performedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performedByUser: User;

  // Outcome & Feedback
  @Column({
    type: 'enum',
    enum: FollowUpOutcome,
  })
  outcome: FollowUpOutcome;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'text', nullable: true })
  customerResponse: string;

  @Column({ type: 'text', nullable: true })
  actionsTaken: string;

  // Lead Status After FollowUp
  @Column({ length: 50, nullable: true })
  leadStatusBefore: string;

  @Column({ length: 50, nullable: true })
  leadStatusAfter: string;

  // Next FollowUp
  @Column({ type: 'date', nullable: true })
  @Index()
  nextFollowUpDate: Date;

  @Column({ type: 'text', nullable: true })
  nextFollowUpPlan: string;

  // Site Visit Specific
  @Column({ type: 'boolean', default: false })
  isSiteVisit: boolean;

  @Column({ length: 200, nullable: true })
  siteVisitProperty: string;

  @Column('int', { nullable: true, default: 0 })
  siteVisitRating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  siteVisitFeedback: string;

  // Interest Level
  @Column('int', { default: 5 })
  interestLevel: number; // 1-10 scale

  @Column('int', { default: 5 })
  budgetFit: number; // 1-10 how well budget matches

  @Column('int', { default: 5 })
  timelineFit: number; // 1-10 how soon they want to buy

  // Reminder Sent
  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  // System Fields
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}





