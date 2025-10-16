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
import { Tower } from '../../towers/entities/tower.entity';

export enum ProjectPhase {
  PLANNING = 'PLANNING',
  SITE_PREPARATION = 'SITE_PREPARATION',
  FOUNDATION = 'FOUNDATION',
  STRUCTURE = 'STRUCTURE',
  MASONRY = 'MASONRY',
  ROOFING = 'ROOFING',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  PLASTERING = 'PLASTERING',
  FLOORING = 'FLOORING',
  PAINTING = 'PAINTING',
  FINISHING = 'FINISHING',
  LANDSCAPING = 'LANDSCAPING',
  HANDOVER = 'HANDOVER',
  COMPLETED = 'COMPLETED',
}

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum InspectionStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL = 'CONDITIONAL',
}

/**
 * ConstructionProject Entity
 * 
 * Tracks construction progress, milestones, contractors, and quality inspections.
 */
@Entity('construction_projects')
@Index(['projectPhase'])
@Index(['projectStatus'])
@Index(['propertyId'])
export class ConstructionProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Project Information
  @Column({ length: 100, unique: true })
  @Index()
  projectCode: string;

  @Column({ length: 200 })
  projectName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'uuid', nullable: true })
  towerId: string;

  @ManyToOne(() => Tower, { nullable: true })
  @JoinColumn({ name: 'tower_id' })
  tower: Tower;

  // Phase & Status
  @Column({
    type: 'enum',
    enum: ProjectPhase,
    default: ProjectPhase.PLANNING,
  })
  projectPhase: ProjectPhase;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  projectStatus: ProjectStatus;

  // Progress Tracking
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  overallProgress: number; // 0-100%

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  planningProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  sitePrepProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  foundationProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  structureProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  masonryProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  roofingProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  plumbingProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  electricalProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  plasteringProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  flooringProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  paintingProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  finishingProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  landscapingProgress: number;

  // Timeline
  @Column({ type: 'date' })
  plannedStartDate: Date;

  @Column({ type: 'date' })
  plannedEndDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'date', nullable: true })
  estimatedCompletionDate: Date;

  @Column({ type: 'int', default: 0 })
  delayDays: number;

  // Contractor Information
  @Column({ length: 200, nullable: true })
  mainContractorName: string;

  @Column({ length: 200, nullable: true })
  mainContractorEmail: string;

  @Column({ length: 50, nullable: true })
  mainContractorPhone: string;

  @Column({ type: 'text', nullable: true })
  mainContractorAddress: string;

  @Column({ type: 'simple-json', nullable: true })
  subContractors: {
    name: string;
    type: string; // Electrical, Plumbing, etc.
    phone: string;
    email?: string;
  }[];

  // Budget & Costs
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  estimatedBudget: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  actualCost: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  materialCost: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  laborCost: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  overheadCost: number;

  // Milestones
  @Column({ type: 'simple-json', nullable: true })
  milestones: {
    id: string;
    name: string;
    phase: string;
    targetDate: string;
    completedDate?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
    progress: number;
  }[];

  // Quality Inspections
  @Column({ type: 'simple-json', nullable: true })
  inspections: {
    id: string;
    inspectionType: string;
    inspectionDate: string;
    inspector: string;
    status: InspectionStatus;
    remarks?: string;
    photos?: string[];
  }[];

  @Column({ type: 'int', default: 0 })
  totalInspections: number;

  @Column({ type: 'int', default: 0 })
  passedInspections: number;

  @Column({ type: 'int', default: 0 })
  failedInspections: number;

  // Material Usage
  @Column({ type: 'simple-json', nullable: true })
  materialUsage: {
    itemId: string;
    itemName: string;
    quantityUsed: number;
    unit: string;
    usedDate: string;
  }[];

  // Team & Labor
  @Column({ type: 'int', default: 0 })
  workersCount: number;

  @Column({ type: 'int', default: 0 })
  engineersCount: number;

  @Column({ type: 'int', default: 0 })
  supervisorsCount: number;

  @Column({ length: 200, nullable: true })
  projectManager: string;

  @Column({ length: 200, nullable: true })
  siteEngineer: string;

  // Safety & Compliance
  @Column({ type: 'int', default: 0 })
  safetyIncidents: number;

  @Column({ type: 'date', nullable: true })
  lastSafetyInspection: Date;

  @Column({ type: 'boolean', default: true })
  safetyCompliant: boolean;

  @Column({ type: 'simple-array', nullable: true })
  permits: string[];

  @Column({ type: 'boolean', default: false })
  allPermitsObtained: boolean;

  // Documentation
  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ type: 'simple-array', nullable: true })
  blueprints: string[];

  // Weather Impact
  @Column({ type: 'int', default: 0 })
  weatherDelayDays: number;

  @Column({ type: 'text', nullable: true })
  weatherRemarks: string;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  risksIdentified: string;

  @Column({ type: 'text', nullable: true })
  mitigationStrategies: string;

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
