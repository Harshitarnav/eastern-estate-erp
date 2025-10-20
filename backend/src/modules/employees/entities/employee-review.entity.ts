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

export enum ReviewType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  ANNUAL = 'ANNUAL',
  PROBATION = 'PROBATION',
  PROJECT_BASED = 'PROJECT_BASED',
}

export enum ReviewStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Employee Review Entity
 * 
 * Tracks performance reviews and evaluations
 */
@Entity('employee_reviews')
@Index(['employeeId'])
@Index(['reviewType'])
@Index(['reviewStatus'])
@Index(['reviewDate'])
export class EmployeeReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Employee Reference
  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Review Details
  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  reviewType: ReviewType;

  @Column({ length: 200 })
  reviewTitle: string;

  @Column({ type: 'date' })
  reviewDate: Date;

  @Column({ type: 'date' })
  reviewPeriodStart: Date;

  @Column({ type: 'date' })
  reviewPeriodEnd: Date;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.SCHEDULED,
  })
  reviewStatus: ReviewStatus;

  // Reviewer Information
  @Column({ type: 'uuid', nullable: true })
  reviewerId: string;

  @Column({ length: 200, nullable: true })
  reviewerName: string;

  @Column({ length: 200, nullable: true })
  reviewerDesignation: string;

  // Performance Ratings (1-5 scale)
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
  initiativeRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  punctualityRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  qualityOfWorkRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  productivityRating: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  attendanceRating: number;

  @Column('decimal', { precision: 3, scale: 2 })
  overallRating: number;

  // Review Content
  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  areasOfImprovement: string;

  @Column({ type: 'text', nullable: true })
  goals: string;

  @Column({ type: 'text', nullable: true })
  trainingNeeds: string;

  @Column({ type: 'text', nullable: true })
  developmentPlan: string;

  @Column({ type: 'text', nullable: true })
  reviewerComments: string;

  @Column({ type: 'text', nullable: true })
  employeeComments: string;

  // Goals & KPIs
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  targetAchievement: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  actualAchievement: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  kpiAchievementPercentage: number;

  // Recommendations
  @Column({ type: 'boolean', default: false })
  recommendedForPromotion: boolean;

  @Column({ type: 'boolean', default: false })
  recommendedForIncrement: boolean;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  recommendedIncrementPercentage: number;

  @Column({ type: 'boolean', default: false })
  recommendedForBonus: boolean;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  recommendedBonusAmount: number;

  @Column({ type: 'boolean', default: false })
  recommendedForTraining: boolean;

  @Column({ type: 'text', nullable: true })
  trainingRecommendations: string;

  // Action Items
  @Column({ type: 'text', nullable: true })
  actionItems: string;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Acknowledgment
  @Column({ type: 'boolean', default: false })
  employeeAcknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  employeeAcknowledgedAt: Date;

  @Column({ type: 'boolean', default: false })
  managerApproved: boolean;

  @Column({ type: 'uuid', nullable: true })
  managerApprovedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  managerApprovedAt: Date;

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
