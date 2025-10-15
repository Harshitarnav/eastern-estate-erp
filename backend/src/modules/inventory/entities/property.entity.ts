import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tower } from './tower.entity';
import { User } from '../../users/entities/user.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
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

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalArea: number;

  @Column({ length: 20, default: 'sqft' })
  areaUnit: string;

  @Column({ type: 'date', nullable: true })
  launchDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedCompletionDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate: Date;

  @Column({ length: 100, nullable: true })
  reraNumber: string;

  @Column({ length: 50, nullable: true })
  projectType: string;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  images: any;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column({ type: 'jsonb', nullable: true })
  amenities: any;

  @OneToMany(() => Tower, tower => tower.property)
  towers: Tower[];

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