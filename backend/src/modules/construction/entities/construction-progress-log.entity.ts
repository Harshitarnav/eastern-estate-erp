import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { User } from '../../users/entities/user.entity';

export enum ProgressType {
  STRUCTURE = 'STRUCTURE',
  INTERIOR = 'INTERIOR',
  FINISHING = 'FINISHING',
  QUALITY_CHECK = 'QUALITY_CHECK',
}

@Entity('construction_progress_logs')
export class ConstructionProgressLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'tower_id', type: 'uuid', nullable: true })
  towerId: string | null;

  @ManyToOne(() => Tower, { nullable: true })
  @JoinColumn({ name: 'tower_id' })
  tower: Tower;

  @Column({ name: 'construction_project_id', type: 'uuid', nullable: true })
  constructionProjectId: string | null;

  @Column({ name: 'log_date', type: 'date' })
  logDate: Date;

  @Column({
    name: 'progress_type',
    type: 'enum',
    enum: ProgressType,
  })
  progressType: ProgressType;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'progress_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  progressPercentage: number | null;

  @Column({ name: 'photos', type: 'jsonb', default: '[]' })
  photos: any;

  @Column({ name: 'weather_condition', type: 'varchar', length: 100, nullable: true })
  weatherCondition: string | null;

  @Column({ name: 'temperature', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number | null;

  @Column({ name: 'logged_by', type: 'uuid' })
  loggedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'logged_by' })
  logger: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
