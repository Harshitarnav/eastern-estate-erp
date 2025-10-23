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
  NINETY_NINE_ACRES = '99ACRES',
  MAGICBRICKS = 'MAGICBRICKS',
  OTHER = 'OTHER',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SiteVisitStatus {
  NOT_SCHEDULED = 'NOT_SCHEDULED',
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum CustomerRequirementType {
  END_USER = 'END_USER',
  INVESTOR = 'INVESTOR',
  BOTH = 'BOTH',
}

export enum PropertyPreference {
  FLAT = 'FLAT',
  DUPLEX = 'DUPLEX',
  PENTHOUSE = 'PENTHOUSE',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL',
  ANY = 'ANY',
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
// @Index(['propertyId', 'status']) // Commented out since propertyId column doesn't exist
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique Lead Code
  @Column({ name: 'lead_code', length: 50, unique: true })
  @Index()
  leadCode: string;

  // Basic Information
  @Column({ name: 'full_name', length: 255 })
  @Index()
  fullName: string;

  // Getters for backward compatibility
  get firstName(): string {
    return this.fullName?.split(' ')[0] || '';
  }

  get lastName(): string {
    const parts = this.fullName?.split(' ') || [];
    return parts.slice(1).join(' ') || '';
  }

  @Column({ length: 200 })
  @Index()
  email: string;

  @Column({ name: 'phone_number', length: 20 })
  @Index()
  phoneNumber: string;

  get phone(): string {
    return this.phoneNumber;
  }

  @Column({ name: 'alternate_phone', length: 20, nullable: true })
  alternatePhone: string;

  @Column({ name: 'address_line1', type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  // Note: pincode column doesn't exist in DB
  // @Column({ length: 20, nullable: true })
  // pincode: string;

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

  // Note: lead_score column doesn't exist in DB, commenting out for now
  // @Column('int', { default: 0 })
  // leadScore: number; // 0-100 based on various factors

  // Property Interest
  // Note: property_id column doesn't exist in DB, commenting out for now
  // @Column({ type: 'uuid', nullable: true })
  // @Index()
  // propertyId: string;

  // @ManyToOne(() => Property, { nullable: true })
  // @JoinColumn({ name: 'propertyId' })
  // property: Property;

  @Column({ name: 'interested_in', type: 'varchar', length: 255, nullable: true })
  interestedPropertyTypes: string; // 2BHK, 3BHK, Villa, etc.

  // Customer Requirement Details
  @Column({
    type: 'enum',
    enum: CustomerRequirementType,
    default: CustomerRequirementType.END_USER,
  })
  @Index()
  requirementType: CustomerRequirementType;

  @Column({
    type: 'enum',
    enum: PropertyPreference,
    default: PropertyPreference.FLAT,
  })
  @Index()
  propertyPreference: PropertyPreference;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMin: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ name: 'preferred_location', length: 100, nullable: true })
  preferredLocation: string;

  @Column({ type: 'simple-array', nullable: true })
  requirements: string[]; // Parking, Vastu, Corner Unit, etc.

  @Column({ length: 100, nullable: true })
  tentativePurchaseTimeframe: string; // "1-3 months", "3-6 months", "6-12 months", "1+ year"

  // Timeline
  @Column({ name: 'timeline', type: 'date', nullable: true })
  expectedPurchaseDate: Date;

  @Column({ name: 'last_contact_date', type: 'date', nullable: true })
  lastContactedAt: Date;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  nextFollowUpDate: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  followUpNotes: string;

  // Getter for backward compatibility
  get notes(): string {
    return this.followUpNotes;
  }

  @Column({ name: 'last_follow_up_feedback', type: 'text', nullable: true })
  lastFollowUpFeedback: string;

  @Column({ type: 'int', default: 0 })
  totalFollowUps: number;

  // Reminder System
  @Column({ type: 'boolean', default: true })
  sendFollowUpReminder: boolean;

  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  // Assignment
  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  @Index()
  assignedTo: string;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date;

  @ManyToOne(() => User, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

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
  @Column({ name: 'has_site_visit', type: 'boolean', default: false, nullable: true })
  hasSiteVisit: boolean;

  @Column({
    name: 'site_visit_status',
    type: 'enum',
    enum: SiteVisitStatus,
    default: SiteVisitStatus.NOT_SCHEDULED,
  })
  @Index()
  siteVisitStatus: SiteVisitStatus;

  // Note: site_visit_date column doesn't exist in DB, commenting out for now
  // @Column({ type: 'date', nullable: true })
  // siteVisitDate: Date;

  @Column({ name: 'site_visit_time', type: 'time', nullable: true })
  siteVisitTime: string;

  @Column({ name: 'site_visit_feedback', type: 'text', nullable: true })
  siteVisitFeedback: string;

  @Column({ name: 'total_site_visits', type: 'int', default: 0, nullable: true })
  totalSiteVisits: number;

  @Column({ name: 'last_site_visit_date', type: 'date', nullable: true })
  lastSiteVisitDate: Date;

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
  @Column({ name: 'converted_to_customer', type: 'uuid', nullable: true })
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
