import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CampaignType {
  DIGITAL = 'DIGITAL',
  PRINT = 'PRINT',
  OUTDOOR = 'OUTDOOR',
  TV = 'TV',
  RADIO = 'RADIO',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EVENT = 'EVENT',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CampaignChannel {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  GOOGLE_ADS = 'GOOGLE_ADS',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  YOUTUBE = 'YOUTUBE',
  WHATSAPP = 'WHATSAPP',
  NEWSPAPER = 'NEWSPAPER',
  MAGAZINE = 'MAGAZINE',
  BILLBOARD = 'BILLBOARD',
  RADIO_FM = 'RADIO_FM',
  TV_CHANNEL = 'TV_CHANNEL',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  SMS_CAMPAIGN = 'SMS_CAMPAIGN',
  PROPERTY_PORTAL = 'PROPERTY_PORTAL',
  REAL_ESTATE_WEBSITE = 'REAL_ESTATE_WEBSITE',
  EVENT_EXHIBITION = 'EVENT_EXHIBITION',
  OTHER = 'OTHER',
}

@Entity('marketing_campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  campaignCode: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.DIGITAL,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({
    type: 'enum',
    enum: CampaignChannel,
  })
  channel: CampaignChannel;

  // Campaign Dates
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  // Budget & Spending
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalBudget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountSpent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remainingBudget: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  budgetUtilization: number; // Percentage

  // Performance Metrics
  @Column({ type: 'int', default: 0 })
  totalImpressions: number;

  @Column({ type: 'int', default: 0 })
  totalClicks: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  clickThroughRate: number; // CTR percentage

  @Column({ type: 'int', default: 0 })
  totalLeads: number;

  @Column({ type: 'int', default: 0 })
  qualifiedLeads: number;

  @Column({ type: 'int', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number; // Percentage

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costPerLead: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costPerConversion: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenueGenerated: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  roi: number; // Return on Investment percentage

  // Target Audience
  @Column({ type: 'jsonb', nullable: true })
  targetAudience: {
    ageRange?: string;
    gender?: string;
    location?: string[];
    income?: string;
    interests?: string[];
  };

  // Campaign Details
  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true })
  callToAction: string;

  @Column({ type: 'text', nullable: true })
  landingPageUrl: string;

  // UTM Parameters for tracking
  @Column({ length: 100, nullable: true })
  utmSource: string;

  @Column({ length: 100, nullable: true })
  utmMedium: string;

  @Column({ length: 100, nullable: true })
  utmCampaign: string;

  @Column({ length: 100, nullable: true })
  utmTerm: string;

  @Column({ length: 100, nullable: true })
  utmContent: string;

  // Media & Creative
  @Column({ type: 'jsonb', nullable: true })
  creativeAssets: string[]; // URLs to images, videos, etc.

  @Column({ type: 'text', nullable: true })
  adCopy: string;

  @Column({ type: 'jsonb', nullable: true })
  keywords: string[];

  // Vendor/Agency Details
  @Column({ length: 200, nullable: true })
  vendorName: string;

  @Column({ length: 200, nullable: true })
  agencyName: string;

  @Column({ length: 20, nullable: true })
  vendorContact: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  vendorCost: number;

  // Campaign Manager
  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  // Analytics & Reporting
  @Column({ type: 'jsonb', nullable: true })
  dailyMetrics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    leads: number;
    spend: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  channelPerformance: {
    [channel: string]: {
      impressions: number;
      clicks: number;
      leads: number;
      conversions: number;
      spend: number;
      roi: number;
    };
  };

  // Tags & Categories
  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
