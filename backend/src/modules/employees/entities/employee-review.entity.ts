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

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};


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
  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
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
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  technicalSkillsRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  communicationRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  teamworkRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  leadershipRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  problemSolvingRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  initiativeRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  punctualityRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  qualityOfWorkRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  productivityRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, transformer: decimalTransformer })
  attendanceRating: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, transformer: decimalTransformer })
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
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, transformer: decimalTransformer })
  targetAchievement: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, transformer: decimalTransformer })
  actualAchievement: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: decimalTransformer })
  kpiAchievementPercentage: number;

  // Recommendations
  @Column({ type: 'boolean', default: false })
  recommendedForPromotion: boolean;

  @Column({ type: 'boolean', default: false })
  recommendedForIncrement: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: decimalTransformer })
  recommendedIncrementPercentage: number;

  @Column({ type: 'boolean', default: false })
  recommendedForBonus: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, transformer: decimalTransformer })
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
