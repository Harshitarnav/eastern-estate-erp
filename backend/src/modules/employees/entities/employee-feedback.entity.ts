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

export enum FeedbackType {
  PEER_TO_PEER = 'PEER_TO_PEER',
  MANAGER_TO_EMPLOYEE = 'MANAGER_TO_EMPLOYEE',
  EMPLOYEE_TO_MANAGER = 'EMPLOYEE_TO_MANAGER',
  SUBORDINATE_TO_MANAGER = 'SUBORDINATE_TO_MANAGER',
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  CLIENT_FEEDBACK = 'CLIENT_FEEDBACK',
  EXIT_FEEDBACK = 'EXIT_FEEDBACK',
}

export enum FeedbackStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

/**
 * Employee Feedback Entity
 * 
 * Tracks 360-degree feedback and comments
 */
@Entity('employee_feedback')
@Index(['employeeId'])
@Index(['feedbackType'])
@Index(['feedbackStatus'])
@Index(['feedbackDate'])
export class EmployeeFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Employee Reference (Recipient)
  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Feedback Provider
  @Column({ type: 'uuid', nullable: true })
  providerId: string;

  @Column({ length: 200, nullable: true })
  providerName: string;

  @Column({ length: 200, nullable: true })
  providerDesignation: string;

  @Column({ length: 200, nullable: true })
  providerRelationship: string;

  // Feedback Details
  @Column({
    type: 'enum',
    enum: FeedbackType,
  })
  feedbackType: FeedbackType;

  @Column({ length: 200 })
  feedbackTitle: string;

  @Column({ type: 'date' })
  feedbackDate: Date;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.DRAFT,
  })
  feedbackStatus: FeedbackStatus;

  // Feedback Content
  @Column({ type: 'text', nullable: true })
  positiveAspects: string;

  @Column({ type: 'text', nullable: true })
  areasForImprovement: string;

  @Column({ type: 'text', nullable: true })
  specificExamples: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  generalComments: string;

  // Ratings (1-5 scale) - Optional
  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  technicalSkillsRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  communicationRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  teamworkRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  leadershipRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  problemSolvingRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  reliabilityRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  professionalismRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  overallRating: number;

  // Acknowledgment
  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'boolean', default: false })
  employeeAcknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  employeeAcknowledgedAt: Date;

  @Column({ type: 'text', nullable: true })
  employeeResponse: string;

  @Column({ type: 'boolean', default: false })
  managerReviewed: boolean;

  @Column({ type: 'uuid', nullable: true })
  managerReviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  managerReviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  managerComments: string;

  // Additional Information
  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

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
