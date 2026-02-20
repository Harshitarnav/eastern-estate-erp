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
import { Tower } from '../../towers/entities/tower.entity';
import { Property } from '../../properties/entities/property.entity';
import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};

export enum FlatStatus {
  AVAILABLE = 'AVAILABLE',
  ON_HOLD = 'ON_HOLD',
  BLOCKED = 'BLOCKED',
  BOOKED = 'BOOKED',
  SOLD = 'SOLD',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
}

export enum FlatType {
  STUDIO = 'STUDIO',
  ONE_BHK = '1BHK',
  TWO_BHK = '2BHK',
  THREE_BHK = '3BHK',
  FOUR_BHK = '4BHK',
  PENTHOUSE = 'PENTHOUSE',
  DUPLEX = 'DUPLEX',
  VILLA = 'VILLA',
}

export enum FacingDirection {
  NORTH = 'North',
  SOUTH = 'South',
  EAST = 'East',
  WEST = 'West',
  NORTH_EAST = 'North-East',
  NORTH_WEST = 'North-West',
  SOUTH_EAST = 'South-East',
  SOUTH_WEST = 'South-West',
}

/**
 * Flat/Unit Entity
 * 
 * Represents individual flats/units within towers.
 * Part of the hierarchy: Property → Tower → Flat
 * 
 * Features:
 * - Unit specifications (area, type, floor)
 * - Pricing and availability
 * - Floor plans and images
 * - Facing direction
 * - Vastu compliance
 * - Customer assignment
 */
@Entity('flats')
@Index(['towerId', 'flatNumber'], { unique: true })
@Index(['propertyId', 'status'])
@Index(['status', 'isActive'])
export class Flat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationships
  @Column('uuid', { name: 'property_id' })
  @Index()
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column('uuid', { name: 'tower_id' })
  @Index()
  towerId: string;

  @ManyToOne(() => Tower, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tower_id' })
  tower: Tower;

  @Column({ name: 'flat_code', length: 50 })
  @Index()
  flatCode: string; // Internal code (kept in sync with flatNumber for defaults)

  // Basic Information
  @Column({ length: 50 })
  @Index()
  flatNumber: string; // e.g., "T1-101", "A-201"

  @Column({ length: 100 })
  name: string; // e.g., "Unit 101 - Premium 3BHK"

  @Column({ type: 'text', nullable: true })
  description: string;

  // Unit Specifications
  @Column({
    type: 'enum',
    enum: FlatType,
  })
  @Index()
  type: FlatType;

  @Column('int')
  @Index()
  floor: number;

  @Column('int', { default: 2 })
  bedrooms: number;

  @Column('int', { default: 2 })
  bathrooms: number;

  @Column('int', { default: 0 })
  balconies: number;

  @Column({ type: 'boolean', default: false })
  servantRoom: boolean;

  @Column({ type: 'boolean', default: false })
  studyRoom: boolean;

  @Column({ type: 'boolean', default: false })
  poojaRoom: boolean;

  // Area Details
  @Column('decimal', { precision: 10, scale: 2 })
  superBuiltUpArea: number; // in sq.ft

  @Column('decimal', { precision: 10, scale: 2 })
  builtUpArea: number; // in sq.ft

  @Column('decimal', { precision: 10, scale: 2 })
  carpetArea: number; // in sq.ft

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  balconyArea: number; // in sq.ft

  // Pricing
  @Column('decimal', { precision: 15, scale: 2 })
  @Index()
  basePrice: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  pricePerSqft: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  registrationCharges: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  maintenanceCharges: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  parkingCharges: number;

  @Column('decimal', { precision: 15, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  discountAmount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  finalPrice: number;

  // Status and Availability
  @Column({
    type: 'enum',
    enum: FlatStatus,
    default: FlatStatus.UNDER_CONSTRUCTION,
  })
  @Index()
  status: FlatStatus;

  @Column({ type: 'boolean', default: true })
  @Index()
  isAvailable: boolean;

  @Column({ type: 'date', nullable: true })
  availableFrom: Date;

  @Column({ type: 'date', nullable: true })
  expectedPossession: Date;

  // Construction Progress Tracking
  @Column({ name: 'construction_stage', length: 50, nullable: true })
  constructionStage: string; // Current phase: FOUNDATION, STRUCTURE, MEP, FINISHING, HANDOVER

  @Column({ 
    name: 'construction_progress', 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0,
    transformer: decimalTransformer,
  })
  constructionProgress: number; // Overall construction completion percentage (0-100)

  @Column({ name: 'last_construction_update', type: 'timestamp', nullable: true })
  lastConstructionUpdate: Date;

  @Column({ name: 'flat_checklist', type: 'jsonb', nullable: true })
  flatChecklist: Record<string, boolean> | null;

  @Column({
    name: 'data_completion_pct',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  dataCompletionPct: number;

  @Column({
    name: 'completeness_status',
    type: 'enum',
    enum: DataCompletenessStatus,
    enumName: 'data_completeness_status_enum',
    default: DataCompletenessStatus.NOT_STARTED,
  })
  completenessStatus: DataCompletenessStatus;

  @Column({ name: 'issues', type: 'jsonb', nullable: true })
  issues: string[] | null;

  @Column({ name: 'issues_count', type: 'int', default: 0 })
  issuesCount: number;

  // Features and Specifications
  @Column({
    type: 'enum',
    enum: FacingDirection,
    nullable: true,
  })
  facing: FacingDirection;

  @Column({ type: 'boolean', default: true })
  vastuCompliant: boolean;

  @Column({ type: 'boolean', default: false })
  cornerUnit: boolean;

  @Column({ type: 'boolean', default: false })
  roadFacing: boolean;

  @Column({ type: 'boolean', default: false })
  parkFacing: boolean;

  @Column('int', { default: 0 })
  parkingSlots: number;

  @Column({ type: 'boolean', default: false })
  coveredParking: boolean;

  // Furnishing
  @Column({ length: 50, nullable: true })
  furnishingStatus: string; // Unfurnished, Semi-Furnished, Fully-Furnished

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[]; // AC, Modular Kitchen, Wardrobes, etc.

  // Additional Details
  @Column({ type: 'text', nullable: true })
  specialFeatures: string;

  @Column({ type: 'text', nullable: true })
  floorPlanUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: true })
  virtualTourUrl: string;

  // Customer Information (when booked/sold)
  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'date', nullable: true })
  bookingDate: Date;

  @Column({ type: 'date', nullable: true })
  soldDate: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  tokenAmount: number;

  @Column({ type: 'text', nullable: true })
  paymentPlan: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  // Documents & Compliance
  @Column({ name: 'sale_agreement_url', type: 'text', nullable: true })
  saleAgreementUrl: string | null;

  @Column({ name: 'allotment_letter_url', type: 'text', nullable: true })
  allotmentLetterUrl: string | null;

  @Column({ name: 'possession_letter_url', type: 'text', nullable: true })
  possessionLetterUrl: string | null;

  @Column({ name: 'payment_plan_url', type: 'text', nullable: true })
  paymentPlanUrl: string | null;

  @Column({ name: 'registration_receipt_urls', type: 'jsonb', nullable: true })
  registrationReceiptUrls: string[] | null;

  @Column({ name: 'payment_receipt_urls', type: 'jsonb', nullable: true })
  paymentReceiptUrls: string[] | null;

  @Column({ name: 'demand_letter_urls', type: 'jsonb', nullable: true })
  demandLetterUrls: string[] | null;

  @Column({ name: 'noc_url', type: 'text', nullable: true })
  nocUrl: string | null;

  @Column({ name: 'rera_certificate_url', type: 'text', nullable: true })
  reraCertificateUrl: string | null;

  @Column({ name: 'kyc_docs_urls', type: 'jsonb', nullable: true })
  kycDocsUrls: string[] | null;

  @Column({ name: 'snag_list_url', type: 'text', nullable: true })
  snagListUrl: string | null;

  @Column({ name: 'handover_checklist_url', type: 'text', nullable: true })
  handoverChecklistUrl: string | null;

  @Column({ name: 'other_documents', type: 'jsonb', nullable: true })
  otherDocuments: string[] | null;

  // Status & Dates
  @Column({ name: 'agreement_date', type: 'date', nullable: true })
  agreementDate: Date | null;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate: Date | null;

  @Column({ name: 'handover_date', type: 'date', nullable: true })
  handoverDate: Date | null;

  @Column({
    name: 'loan_status',
    type: 'varchar',
    length: 20,
    default: 'NONE',
  })
  loanStatus: 'NONE' | 'APPLIED' | 'SANCTIONED' | 'DISBURSED';

  @Column({
    name: 'handover_status',
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  handoverStatus: 'PENDING' | 'READY' | 'HANDED_OVER';

  @Column({
    name: 'verification_status',
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  verificationStatus: 'PENDING' | 'VERIFIED';

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string | null;

  // Assignments & Contacts
  @Column({ name: 'salesperson_id', type: 'uuid', nullable: true })
  salespersonId: string | null;

  @Column({ name: 'service_contact_id', type: 'uuid', nullable: true })
  serviceContactId: string | null;

  @Column({ name: 'co_buyer_name', type: 'text', nullable: true })
  coBuyerName: string | null;

  @Column({ name: 'co_buyer_email', type: 'text', nullable: true })
  coBuyerEmail: string | null;

  @Column({ name: 'co_buyer_phone', type: 'text', nullable: true })
  coBuyerPhone: string | null;

  // Inventory / Extras
  @Column({ name: 'parking_number', type: 'varchar', length: 50, nullable: true })
  parkingNumber: string | null;

  @Column({ name: 'parking_type', type: 'varchar', length: 50, nullable: true })
  parkingType: string | null;

  @Column({ name: 'storage_id', type: 'varchar', length: 50, nullable: true })
  storageId: string | null;

  @Column({ name: 'furnishing_pack', type: 'varchar', length: 50, nullable: true })
  furnishingPack: string | null;

  @Column({ name: 'appliance_pack', type: 'boolean', default: false })
  appliancePack: boolean;

  // System Fields
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
