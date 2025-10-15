import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

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

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 10 })
  pincode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'total_area', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalArea: number;

  @Column({ name: 'area_unit', length: 20, default: 'sqft' })
  areaUnit: string;

  @Column({ name: 'launch_date', type: 'date', nullable: true })
  launchDate: Date;

  @Column({ name: 'expected_completion_date', type: 'date', nullable: true })
  expectedCompletionDate: Date;

  @Column({ name: 'actual_completion_date', type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ name: 'rera_number', length: 100, nullable: true })
  reraNumber: string;

  @Column({ name: 'project_type', length: 50, nullable: true })
  projectType: string;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  images: any;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column({ type: 'jsonb', nullable: true })
  amenities: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationship with towers (will be properly typed when tower module is loaded)
  towers?: any[];

  // Virtual fields for frontend (not in database)
  towersCount?: number;
  totalFlats?: number;
  soldFlats?: number;
  availableFlats?: number;
}
