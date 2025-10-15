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

export enum FlatStatus {
  AVAILABLE = 'AVAILABLE',
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
  @Column('uuid')
  @Index()
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid')
  @Index()
  towerId: string;

  @ManyToOne(() => Tower, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'towerId' })
  tower: Tower;

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
