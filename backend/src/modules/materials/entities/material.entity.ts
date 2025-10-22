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

export enum MaterialCategory {
  CEMENT = 'CEMENT',
  STEEL = 'STEEL',
  SAND = 'SAND',
  AGGREGATE = 'AGGREGATE',
  BRICKS = 'BRICKS',
  TILES = 'TILES',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  PAINT = 'PAINT',
  HARDWARE = 'HARDWARE',
  OTHER = 'OTHER',
}

export enum UnitOfMeasurement {
  KG = 'KG',
  TONNE = 'TONNE',
  BAG = 'BAG',
  PIECE = 'PIECE',
  LITRE = 'LITRE',
  CUBIC_METER = 'CUBIC_METER',
  SQUARE_METER = 'SQUARE_METER',
  BOX = 'BOX',
  SET = 'SET',
}

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'material_code', unique: true, length: 50 })
  materialCode: string;

  @Column({ name: 'material_name', length: 255 })
  materialName: string;

  @Column({
    type: 'enum',
    enum: MaterialCategory,
  })
  category: MaterialCategory;

  @Column({
    name: 'unit_of_measurement',
    type: 'enum',
    enum: UnitOfMeasurement,
  })
  unitOfMeasurement: UnitOfMeasurement;

  @Column({ name: 'current_stock', type: 'decimal', precision: 15, scale: 3, default: 0 })
  currentStock: number;

  @Column({ name: 'minimum_stock_level', type: 'decimal', precision: 15, scale: 3, default: 0 })
  minimumStockLevel: number;

  @Column({ name: 'maximum_stock_level', type: 'decimal', precision: 15, scale: 3, default: 0 })
  maximumStockLevel: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ name: 'gst_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  gstPercentage: number;

  @Column({ type: 'text', nullable: true })
  specifications: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  // Virtual property to check if stock is low
  get isLowStock(): boolean {
    return this.currentStock <= this.minimumStockLevel;
  }

  // Virtual property to get stock value
  get stockValue(): number {
    return Number(this.currentStock) * Number(this.unitPrice);
  }
}
