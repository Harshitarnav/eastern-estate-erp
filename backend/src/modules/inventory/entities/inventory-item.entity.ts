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

export enum ItemCategory {
  CONSTRUCTION_MATERIAL = 'CONSTRUCTION_MATERIAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  HARDWARE = 'HARDWARE',
  PAINT = 'PAINT',
  TILES = 'TILES',
  FIXTURES = 'FIXTURES',
  TOOLS = 'TOOLS',
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT',
  OTHER = 'OTHER',
}

export enum Unit {
  KG = 'KG',
  LITRE = 'LITRE',
  METER = 'METER',
  SQ_METER = 'SQ_METER',
  PIECE = 'PIECE',
  BOX = 'BOX',
  BAG = 'BAG',
  ROLL = 'ROLL',
  SET = 'SET',
  UNIT = 'UNIT',
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDERED = 'ORDERED',
  DISCONTINUED = 'DISCONTINUED',
}

/**
 * InventoryItem Entity
 * 
 * Tracks inventory items, stock levels, and suppliers.
 */
@Entity('inventory_items')
@Index(['category'])
@Index(['propertyId'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Item Information
  @Column({ length: 100, unique: true })
  @Index()
  itemCode: string;

  @Column({ length: 200 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemCategory,
  })
  category: ItemCategory;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ length: 100, nullable: true })
  model: string;

  // Stock Information
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: Unit,
  })
  unit: Unit;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  minimumStock: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  maximumStock: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  reorderPoint: number;

  @Column({
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.IN_STOCK,
  })
  @Index()
  stockStatus: StockStatus;

  // Pricing
  @Column('decimal', { precision: 15, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 15, scale: 2 })
  totalValue: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  lastPurchasePrice: number;

  @Column({ type: 'date', nullable: true })
  lastPurchaseDate: Date;

  // Supplier Information
  @Column({ length: 200, nullable: true })
  supplierName: string;

  @Column({ length: 200, nullable: true })
  supplierEmail: string;

  @Column({ length: 50, nullable: true })
  supplierPhone: string;

  @Column({ type: 'text', nullable: true })
  supplierAddress: string;

  // Location
  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ length: 200, nullable: true })
  warehouseLocation: string;

  @Column({ length: 100, nullable: true })
  rackNumber: string;

  @Column({ length: 100, nullable: true })
  binNumber: string;

  // Quality & Specifications
  @Column({ length: 100, nullable: true })
  specification: string;

  @Column({ length: 100, nullable: true })
  grade: string;

  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ length: 100, nullable: true })
  batchNumber: string;

  @Column({ length: 100, nullable: true })
  serialNumber: string;

  // Usage Tracking
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalIssued: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalReceived: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalReturned: number;

  @Column({ type: 'date', nullable: true })
  lastIssuedDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReceivedDate: Date;

  // Documents & Images
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  // Additional Info
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  @Index()
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
