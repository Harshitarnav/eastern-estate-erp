// backend/src/modules/inventory/entities/flat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { Tower } from './tower.entity';
import { Floor } from './floor.entity';

@Entity('flats')
export class Flat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  property: Property;

  @ManyToOne(() => Tower, tower => tower.flats, { onDelete: 'CASCADE' })
  tower: Tower;

  @ManyToOne(() => Floor, floor => floor.flats, { onDelete: 'CASCADE' })
  floor: Floor;

  @Column({ length: 50 })
  flatCode: string;

  @Column({ length: 50 })
  flatNumber: string;

  @Column({ length: 100, nullable: true })
  flatName: string;

  @Column({ length: 50 })
  flatType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  carpetArea: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  builtUpArea: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  superBuiltUpArea: number;

  @Column({ length: 20, default: 'sqft' })
  areaUnit: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseRatePerSqft: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  gstAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  registrationCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  otherCharges: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column()
  bedrooms: number;

  @Column()
  bathrooms: number;

  @Column({ default: 0 })
  balconies: number;

  @Column({ default: false })
  hasStudyRoom: boolean;

  @Column({ default: false })
  hasServantRoom: boolean;

  @Column({ default: false })
  hasPoojaRoom: boolean;

  @Column({ type: 'jsonb', nullable: true })
  roomDetails: any;

  @Column({ length: 50, nullable: true })
  facing: string;

  @Column({ length: 50, default: 'Unfurnished' })
  furnishingStatus: string;

  @Column({ length: 50, nullable: true })
  flooringType: string;

  @Column({ length: 50, nullable: true })
  kitchenType: string;

  @Column({ type: 'text', nullable: true })
  floorPlanImage: string;

  @Column({ type: 'jsonb', nullable: true })
  images: any;

  @Column({ type: 'text', nullable: true })
  paymentPlanDocument: string;

  @Column({ type: 'text', nullable: true })
  surroundingDescription: string;

  @Column({ length: 50, default: 'Available' })
  status: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  // ✅ These should be UUID strings, not relationships
  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}