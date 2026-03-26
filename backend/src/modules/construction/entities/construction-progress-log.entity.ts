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
import { ConstructionProject } from './construction-project.entity';

export enum ProgressType {
  STRUCTURE = 'STRUCTURE',
  INTERIOR = 'INTERIOR',
  FINISHING = 'FINISHING',
  QUALITY_CHECK = 'QUALITY_CHECK',
}

export enum ShiftType {
  DAY = 'DAY',
  NIGHT = 'NIGHT',
}

@Entity('construction_progress_logs')
export class ConstructionProgressLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'tower_id', type: 'uuid', nullable: true })
  towerId: string | null;

  @ManyToOne(() => Tower, { nullable: true })
  @JoinColumn({ name: 'tower_id' })
  tower: Tower;

  @Column({ name: 'construction_project_id', type: 'uuid', nullable: true })
  constructionProjectId: string | null;

  @ManyToOne(() => ConstructionProject, { nullable: true })
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

  @Column({ name: 'log_date', type: 'date' })
  logDate: Date;

  @Column({
    name: 'progress_type',
    type: 'enum',
    enum: ProgressType,
    nullable: true,
  })
  progressType: ProgressType | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'progress_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  progressPercentage: number | null;

  @Column({ name: 'photos', type: 'jsonb', default: '[]' })
  photos: any;

  @Column({ name: 'weather_condition', type: 'varchar', length: 100, nullable: true })
  weatherCondition: string | null;

  @Column({ name: 'temperature', type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number | null;

  @Column({ name: 'logged_by', type: 'uuid', nullable: true })
  loggedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'logged_by' })
  logger: User;

  // ── New fields for project-based daily progress logs ──────────────────────

  @Column({
    name: 'shift',
    type: 'enum',
    enum: ShiftType,
    nullable: true,
  })
  shift: ShiftType | null;

  @Column({ name: 'workers_present', type: 'int', nullable: true })
  workersPresent: number | null;

  @Column({ name: 'workers_absent', type: 'int', nullable: true })
  workersAbsent: number | null;

  @Column({ name: 'materials_used', type: 'text', nullable: true })
  materialsUsed: string | null;

  @Column({ name: 'issues_delays', type: 'text', nullable: true })
  issuesDelays: string | null;

  @Column({ name: 'supervisor_name', type: 'varchar', length: 255, nullable: true })
  supervisorName: string | null;

  @Column({ name: 'next_day_plan', type: 'text', nullable: true })
  nextDayPlan: string | null;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
