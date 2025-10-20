/**
 * @file sales-task.entity.ts
 * @description Personal task and scheduler for sales team
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
import { User } from '../../users/entities/user.entity';
import { Lead } from './lead.entity';

export enum TaskType {
  FOLLOWUP_CALL = 'FOLLOWUP_CALL',
  SITE_VISIT = 'SITE_VISIT',
  MEETING = 'MEETING',
  DOCUMENTATION = 'DOCUMENTATION',
  PROPERTY_TOUR = 'PROPERTY_TOUR',
  CLIENT_MEETING = 'CLIENT_MEETING',
  INTERNAL_MEETING = 'INTERNAL_MEETING',
  EMAIL_FOLLOWUP = 'EMAIL_FOLLOWUP',
  NEGOTIATION = 'NEGOTIATION',
  OTHER = 'OTHER',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

/**
 * SalesTask Entity
 * 
 * Personal scheduler for sales team members to manage their tasks,
 * meetings, and followups.
 */
@Entity('sales_tasks')
@Index(['assignedTo', 'dueDate'])
@Index(['assignedTo', 'status'])
@Index(['dueDate', 'status'])
@Index(['taskType', 'status'])
export class SalesTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Task Details
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskType,
  })
  @Index()
  taskType: TaskType;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @Index()
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @Index()
  status: TaskStatus;

  // Assignment
  @Column({ type: 'uuid' })
  @Index()
  assignedTo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignedToUser: User;

  @Column({ type: 'uuid', nullable: true })
  assignedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser: User;

  // Timeline
  @Column({ type: 'date' })
  @Index()
  dueDate: Date;

  @Column({ type: 'time', nullable: true })
  dueTime: string;

  @Column({ type: 'int', default: 60 })
  estimatedDurationMinutes: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Related Entities
  @Column({ type: 'uuid', nullable: true })
  @Index()
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ type: 'uuid', nullable: true })
  customerId: string; // Reference to customer if converted

  @Column({ type: 'uuid', nullable: true })
  propertyId: string; // Reference to property if applicable

  // Location
  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  locationDetails: string;

  // Meeting Details (if applicable)
  @Column({ type: 'simple-array', nullable: true })
  attendees: string[]; // Email or names of attendees

  @Column({ length: 500, nullable: true })
  meetingLink: string; // Zoom/Teams link

  // Reminder
  @Column({ type: 'boolean', default: true })
  sendReminder: boolean;

  @Column({ type: 'int', default: 1440 })
  reminderBeforeMinutes: number; // Default: 24 hours (1440 min)

  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  // Outcome
  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[]; // File paths or URLs

  // Recurrence
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ length: 50, nullable: true })
  recurrencePattern: string; // 'DAILY', 'WEEKLY', 'MONTHLY', etc.

  @Column({ type: 'uuid', nullable: true })
  parentTaskId: string; // If this is part of recurring task

  // System Fields
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;
}



