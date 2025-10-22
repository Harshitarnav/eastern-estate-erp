import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';

export enum ConstructionProjectPhase {
  PLANNING = 'PLANNING',
  EXCAVATION = 'EXCAVATION',
  FOUNDATION = 'FOUNDATION',
  STRUCTURE = 'STRUCTURE',
  FINISHING = 'FINISHING',
  COMPLETE = 'COMPLETE',
}

export enum ConstructionProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('construction_projects')
export class ConstructionProject {
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

  @Column({ name: 'project_code', type: 'varchar', length: 50, unique: true })
  projectCode: string;

  @Column({ name: 'project_name', type: 'varchar', length: 255 })
  projectName: string;

  @Column({
    name: 'project_phase',
    type: 'enum',
    enum: ConstructionProjectPhase,
    default: ConstructionProjectPhase.PLANNING,
  })
  projectPhase: ConstructionProjectPhase;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'expected_completion_date', type: 'date', nullable: true })
  expectedCompletionDate: Date | null;

  @Column({ name: 'actual_completion_date', type: 'date', nullable: true })
  actualCompletionDate: Date | null;

  @Column({ name: 'overall_progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallProgress: number;

  @Column({ name: 'structure_progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  structureProgress: number;

  @Column({ name: 'interior_progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  interiorProgress: number;

  @Column({ name: 'finishing_progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  finishingProgress: number;

  @Column({ name: 'site_engineer_id', type: 'uuid', nullable: true })
  siteEngineerId: string | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'site_engineer_id' })
  siteEngineer: Employee;

  @Column({ name: 'contractor_name', type: 'varchar', length: 255, nullable: true })
  contractorName: string | null;

  @Column({ name: 'contractor_contact', type: 'varchar', length: 20, nullable: true })
  contractorContact: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ConstructionProjectStatus,
    default: ConstructionProjectStatus.ACTIVE,
  })
  status: ConstructionProjectStatus;

  @Column({ name: 'budget_allocated', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetAllocated: number;

  @Column({ name: 'budget_spent', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetSpent: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'issues', type: 'text', array: true, nullable: true })
  issues: string[] | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
