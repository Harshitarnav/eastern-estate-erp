import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { DataCompletenessStatus } from '../../../common/enums/data-completeness-status.enum';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};

/**
 * Tower Entity
 * 
 * Represents a tower/building within a property project.
 * Part of the hierarchy: Property → Tower → Floors → Flats
 * 
 * Eastern Estate Philosophy:
 * Each tower is designed to foster "Life Long Bonding" - creating
 * vertical communities where families grow together across floors.
 * 
 * @entity towers
 */
@Entity('towers')
export class Tower {
  /**
   * Unique identifier for the tower
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Tower name/identifier
   * @example "Tower A", "Emerald Block", "Diamond Wing"
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * Tower number/code for internal reference
   * @example "T1", "A", "01"
   */
  @Column({ type: 'varchar', length: 50 })
  towerNumber: string;

  @Column({ name: 'tower_code', type: 'varchar', length: 50 })
  @Index()
  towerCode: string;

  /**
   * Detailed description of the tower
   * Including unique features, views, or special characteristics
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Total number of floors in the tower
   * Excludes basement/parking levels
   * @example 15
   */
  @Column({ name: 'total_floors', type: 'int' })
  totalFloors: number;

  /**
   * Total number of residential units in the tower
   * Sum of all flats across all floors
   * @example 60
   */
  @Column({ name: 'total_units', type: 'int' })
  totalUnits: number;

  /**
   * Planned number of units in the tower
   * Helps identify missing unit definitions
   */
  @Column({ name: 'units_planned', type: 'int', default: 0 })
  unitsPlanned: number;

  /**
   * Number of units already defined (persisted flats)
   */
  @Column({ name: 'units_defined', type: 'int', default: 0 })
  unitsDefined: number;

  /**
   * Number of basement levels (if any)
   * Used for parking or utility spaces
   * @example 2
   */
  @Column({ name: 'basement_levels', type: 'int', default: 0 })
  basementLevels: number;

  /**
   * Units per floor configuration
   * @example "4 units per floor (2BHK + 3BHK)"
   */
  @Column({ name: 'units_per_floor', type: 'varchar', length: 200, nullable: true })
  unitsPerFloor: string;

  /**
   * Tower-specific amenities
   * JSON array of amenities available in this specific tower
   * @example ["Dedicated Lift", "Sky Lounge", "Terrace Garden"]
   */
  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  /**
   * Construction status
   * Tracks the current state of tower construction
   */
  @Column({
    name: 'construction_status',
    type: 'enum',
    enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
    default: 'PLANNED',
  })
  constructionStatus: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';

  /**
   * Construction start date
   */
  @Column({ name: 'construction_start_date', type: 'date', nullable: true })
  constructionStartDate: Date;

  /**
   * Expected/Actual completion date
   */
  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate: Date;

  /**
   * RERA approval number for this tower
   * Required for compliance and customer trust
   * @example "RERA/OR/2024/12345"
   */
  @Column({ name: 'rera_number', type: 'varchar', length: 100, nullable: true })
  reraNumber: string;

  /**
   * Total built-up area of the tower (in sq.ft)
   * @example 75000
   */
  @Column({ name: 'built_up_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  builtUpArea: number;

  /**
   * Total carpet area of the tower (in sq.ft)
   * @example 60000
   */
  @Column({ name: 'carpet_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  carpetArea: number;

  /**
   * Floor-to-ceiling height (in feet)
   * @example 10.5
   */
  @Column({ name: 'ceiling_height', type: 'decimal', precision: 4, scale: 2, nullable: true })
  ceilingHeight: number;

  /**
   * Number of elevators/lifts in the tower
   * @example 2
   */
  @Column({ name: 'number_of_lifts', type: 'int', default: 1 })
  numberOfLifts: number;

  /**
   * Vastu compliance status
   * Important for Indian customers following traditional beliefs
   */
  @Column({ name: 'vastu_compliant', type: 'boolean', default: true })
  vastuCompliant: boolean;

  /**
   * Facing direction of the tower
   * @example "North", "East", "South-East"
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  facing: string;

  /**
   * Special features or highlights
   * Marketing points that make this tower unique
   * @example "Premium corner units with 270° views"
   */
  @Column({ name: 'special_features', type: 'text', nullable: true })
  specialFeatures: string;

  /**
   * Active status
   * Soft delete - tower can be deactivated instead of deleted
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Editorial data completeness checklist
   * Stores which metadata items are ready
   */
  @Column({ name: 'tower_checklist', type: 'jsonb', nullable: true })
  towerChecklist: Record<string, boolean> | null;

  /**
   * Data completeness percentage (0-100)
   */
  @Column({
    name: 'data_completion_pct',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  dataCompletionPct: number;

  /**
   * Rolling editorial data status
   */
  @Column({
    name: 'data_completeness_status',
    type: 'enum',
    enum: DataCompletenessStatus,
    enumName: 'data_completeness_status_enum',
    default: DataCompletenessStatus.NOT_STARTED,
  })
  dataCompletenessStatus: DataCompletenessStatus;

  /**
   * Outstanding data issues count
   */
  @Column({ name: 'issues_count', type: 'int', default: 0 })
  issuesCount: number;

  /**
   * Display order for listing
   * Lower numbers appear first
   */
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  /**
   * Images of the tower
   * JSON array of image URLs (renders, actual photos)
   */
  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  /**
   * Floor plan images
   * JSON object mapping floor numbers to plan URLs
   * @example { "ground": "url1", "1-10": "url2", "11-15": "url3" }
   */
  @Column({ name: 'floor_plans', type: 'jsonb', nullable: true })
  floorPlans: Record<string, string>;

  /**
   * Property relationship
   * Each tower belongs to one property/project
   */
  @ManyToOne(() => Property, (property) => property.towers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'property_id' })
  propertyId: string;

  /**
   * Flats relationship
   * One tower has many flats/units
   */
  @OneToMany(() => Flat, (flat) => flat.tower)
  flats: Flat[];

  /**
   * Creation timestamp
   * Automatically set when tower is first created
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Last update timestamp
   * Automatically updated on any change
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Import Flat after the class to avoid circular dependency issues
import { Flat } from '../../flats/entities/flat.entity';
