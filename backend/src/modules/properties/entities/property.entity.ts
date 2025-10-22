import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Tower } from '../../towers/entities/tower.entity';
import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_code', unique: true, length: 50 })
  propertyCode: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 10 })
  pincode: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
    transformer: decimalTransformer,
  })
  latitude: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
    transformer: decimalTransformer,
  })
  longitude: number;

  @Column({
    name: 'nearby_landmarks',
    type: 'text',
    nullable: true,
  })
  nearbyLandmarks: string;

  @Column({
    name: 'total_area',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  totalArea: number;

  @Column({ name: 'area_unit', length: 20, default: 'sqft' })
  areaUnit: string;

  @Column({
    name: 'built_up_area',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  builtUpArea: number;

  @Column({ name: 'number_of_towers', type: 'int', nullable: true })
  numberOfTowers: number;

  @Column({ name: 'number_of_units', type: 'int', nullable: true })
  numberOfUnits: number;

  @Column({ name: 'total_towers_planned', type: 'int', nullable: true })
  totalTowersPlanned: number | null;

  @Column({ name: 'total_units_planned', type: 'int', nullable: true })
  totalUnitsPlanned: number | null;

  @Column({ name: 'floors_per_tower', length: 50, nullable: true })
  floorsPerTower: string;

  @Column({ name: 'launch_date', type: 'date', nullable: true })
  launchDate: Date;

  @Column({ name: 'expected_completion_date', type: 'date', nullable: true })
  expectedCompletionDate: Date;

  @Column({ name: 'actual_completion_date', type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ name: 'rera_number', length: 100, nullable: true })
  reraNumber: string;

  @Column({ name: 'rera_status', length: 50, nullable: true })
  reraStatus: string;

  @Column({ name: 'project_type', length: 50, nullable: true })
  projectType: string;

  @Column({ name: 'property_type', length: 50, nullable: true })
  propertyType: string;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @Column({
    name: 'price_min',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  priceMin: number;

  @Column({
    name: 'price_max',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  priceMax: number;

  @Column({
    name: 'expected_revenue',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  expectedRevenue: number;

  @Column({ name: 'bhk_types', type: 'simple-array', nullable: true })
  bhkTypes: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  images: any;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column({ type: 'jsonb', nullable: true })
  amenities: any;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'inventory_checklist',
    type: 'jsonb',
    nullable: true,
  })
  inventoryChecklist: Record<string, boolean> | null;

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
    name: 'data_completeness_status',
    type: 'enum',
    enum: DataCompletenessStatus,
    enumName: 'data_completeness_status_enum',
    default: DataCompletenessStatus.NOT_STARTED,
  })
  dataCompletenessStatus: DataCompletenessStatus;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationship with towers
  @OneToMany(
    () => require('../../towers/entities/tower.entity').Tower,
    (tower: Tower) => tower.property,
  )
  towers: Tower[];

  // Virtual fields for frontend (not in database)
  towersCount?: number;
  totalFlats?: number;
  soldFlats?: number;
  availableFlats?: number;
  projectCode?: string | null;
  projectName?: string | null;
}
