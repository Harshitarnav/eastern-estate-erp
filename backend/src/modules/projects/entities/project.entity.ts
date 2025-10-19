import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Property } from '../../properties/entities/property.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_code', unique: true, length: 50 })
  projectCode: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ length: 100, nullable: true })
  city: string | null;

  @Column({ length: 100, nullable: true })
  state: string | null;

  @Column({ length: 100, nullable: true })
  country: string | null;

  @Column({ length: 15, nullable: true })
  pincode: string | null;

  @Column({ length: 50, nullable: true })
  status: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'contact_person', length: 150, nullable: true })
  contactPerson: string | null;

  @Column({ name: 'contact_email', length: 150, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'contact_phone', length: 25, nullable: true })
  contactPhone: string | null;

  @Column({ name: 'gst_number', length: 25, nullable: true })
  gstNumber: string | null;

  @Column({ name: 'pan_number', length: 25, nullable: true })
  panNumber: string | null;

  @Column({ name: 'finance_entity_name', length: 150, nullable: true })
  financeEntityName: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => require('../../properties/entities/property.entity').Property,
    (property: Property) => property.project,
  )
  properties: Property[];
}
