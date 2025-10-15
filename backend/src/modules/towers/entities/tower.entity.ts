import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

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
  @Column({ type: 'int' })
  totalFloors: number;

  /**
   * Total number of residential units in the tower
   * Sum of all flats across all floors
   * @example 60
   */
  @Column({ type: 'int' })
  totalUnits: number;

  /**
   * Number of basement levels (if any)
   * Used for parking or utility spaces
   * @example 2
   */
  @Column({ type: 'int', default: 0 })
  basementLevels: number;

  /**
   * Units per floor configuration
   * @example "4 units per floor (2BHK + 3BHK)"
   */
  @Column({ type: 'varchar', length: 200, nullable: true })
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
    type: 'enum',
    enum: ['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE'],
    default: 'PLANNED',
  })
  constructionStatus: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';

  /**
   * Construction start date
   */
  @Column({ type: 'date', nullable: true })
  constructionStartDate: Date;

  /**
   * Expected/Actual completion date
   */
  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  /**
   * RERA approval number for this tower
   * Required for compliance and customer trust
   * @example "RERA/OR/2024/12345"
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  reraNumber: string;

  /**
   * Total built-up area of the tower (in sq.ft)
   * @example 75000
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  builtUpArea: number;

  /**
   * Total carpet area of the tower (in sq.ft)
   * @example 60000
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carpetArea: number;

  /**
   * Floor-to-ceiling height (in feet)
   * @example 10.5
   */
  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  ceilingHeight: number;

  /**
   * Number of elevators/lifts in the tower
   * @example 2
   */
  @Column({ type: 'int', default: 1 })
  numberOfLifts: number;

  /**
   * Vastu compliance status
   * Important for Indian customers following traditional beliefs
   */
  @Column({ type: 'boolean', default: true })
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
  @Column({ type: 'text', nullable: true })
  specialFeatures: string;

  /**
   * Active status
   * Soft delete - tower can be deactivated instead of deleted
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Display order for listing
   * Lower numbers appear first
   */
  @Column({ type: 'int', default: 0 })
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
  @Column({ type: 'jsonb', nullable: true })
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
   * Note: This will be implemented when the Flats module is created
   */
  // @OneToMany(() => Flat, (flat) => flat.tower)
  // flats: Flat[];

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
