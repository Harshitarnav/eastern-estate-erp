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
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  ON_HOLD = 'ON_HOLD',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  WALK_IN = 'WALK_IN',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  ADVERTISEMENT = 'ADVERTISEMENT',
  BROKER = 'BROKER',
  EXHIBITION = 'EXHIBITION',
  OTHER = 'OTHER',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Lead Entity
 * 
 * Represents potential customers in the sales pipeline.
 * Tracks leads from first contact to conversion.
 * 
 * Features:
 * - Lead qualification and scoring
 * - Source tracking
 * - Assignment to sales representatives
 * - Follow-up management
 * - Status tracking through sales stages
 * - Budget and timeline tracking
 * - Property interest tracking
 */
@Entity('leads')
@Index(['status', 'isActive'])
@Index(['assignedTo', 'status'])
@Index(['propertyId', 'status'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ length: 100 })
  @Index()
  firstName: string;

  @Column({ length: 100 })
  @Index()
  lastName: string;

  @Column({ length: 200 })
  @Index()
  email: string;

  @Column({ length: 20 })
  @Index()
  phone: string;

  @Column({ length: 20, nullable: true })
  alternatePhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  pincode: string;

  // Lead Details
  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  @Index()
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadSource,
  })
  @Index()
  source: LeadSource;

  @Column({
    type: 'enum',
    enum: LeadPriority,
    default: LeadPriority.MEDIUM,
  })
  @Index()
  priority: LeadPriority;

  @Column('int', { default: 0 })
  leadScore: number; // 0-100 based on various factors

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Property Interest
  @Column({ type: 'uuid', nullable: true })
  @Index()
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'simple-array', nullable: true })
  interestedPropertyTypes: string[]; // 2BHK, 3BHK, Villa, etc.

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMin: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ length: 100, nullable: true })
  preferredLocation: string;

  @Column({ type: 'simple-array', nullable: true })
  requirements: string[]; // Parking, Vastu, Corner Unit, etc.

  // Timeline
  @Column({ type: 'date', nullable: true })
  expectedPurchaseDate: Date;

  @Column({ type: 'date', nullable: true })
  lastContactedAt: Date;

  @Column({ type: 'date', nullable: true })
  nextFollowUpDate: Date;

  @Column({ type: 'text', nullable: true })
  followUpNotes: string;

  // Assignment
  @Column({ type: 'uuid', nullable: true })
  @Index()
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignedUser: User;

  @Column({ type: 'date', nullable: true })
  assignedAt: Date;

  // Qualification
  @Column({ type: 'boolean', default: false })
  isQualified: boolean;

  @Column({ type: 'boolean', default: false })
  isFirstTimeBuyer: boolean;

  @Column({ type: 'boolean', default: false })
  hasExistingProperty: boolean;

  @Column({ type: 'boolean', default: false })
  needsHomeLoan: boolean;

  @Column({ type: 'boolean', default: false })
  hasApprovedLoan: boolean;

  @Column({ length: 100, nullable: true })
  currentOccupation: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  annualIncome: number;

  // Campaign & Marketing
  @Column({ length: 100, nullable: true })
  campaignName: string;

  @Column({ length: 100, nullable: true })
  utmSource: string;

  @Column({ length: 100, nullable: true })
  utmMedium: string;

  @Column({ length: 100, nullable: true })
  utmCampaign: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Referral
  @Column({ type: 'uuid', nullable: true })
  referredBy: string; // Customer ID or Lead ID

  @Column({ length: 200, nullable: true })
  referralName: string;

  @Column({ length: 20, nullable: true })
  referralPhone: string;

  // Site Visit
  @Column({ type: 'boolean', default: false })
  hasSiteVisit: boolean;

  @Column({ type: 'date', nullable: true })
  siteVisitDate: Date;

  @Column({ type: 'text', nullable: true })
  siteVisitFeedback: string;

  @Column({ type: 'int', default: 0 })
  totalSiteVisits: number;

  // Communication
  @Column({ type: 'int', default: 0 })
  totalCalls: number;

  @Column({ type: 'int', default: 0 })
  totalEmails: number;

  @Column({ type: 'int', default: 0 })
  totalMeetings: number;

  @Column({ type: 'date', nullable: true })
  lastCallDate: Date;

  @Column({ type: 'date', nullable: true })
  lastEmailDate: Date;

  @Column({ type: 'date', nullable: true })
  lastMeetingDate: Date;

  // Conversion
  @Column({ type: 'uuid', nullable: true })
  convertedToCustomerId: string;

  @Column({ type: 'date', nullable: true })
  convertedAt: Date;

  @Column({ type: 'text', nullable: true })
  lostReason: string;

  @Column({ type: 'date', nullable: true })
  lostAt: Date;

  // System Fields
  @Column({ type: 'boolean', default: true })
  @Index()
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
