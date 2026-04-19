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
import { ConstructionProject } from './construction-project.entity';
import { Property } from '../../properties/entities/property.entity';
import { Tower } from '../../towers/entities/tower.entity';
import { User } from '../../users/entities/user.entity';

export enum UpdateVisibility {
  ALL = 'ALL',
  INTERNAL = 'INTERNAL',
  MANAGEMENT_ONLY = 'MANAGEMENT_ONLY',
}

export enum DevelopmentUpdateScope {
  PROPERTY = 'PROPERTY',
  TOWER = 'TOWER',
  COMMON_AREA = 'COMMON_AREA',
}

export enum DevelopmentUpdateCategory {
  BEAUTIFICATION = 'BEAUTIFICATION',
  LIFT = 'LIFT',
  HALLWAY_LOBBY = 'HALLWAY_LOBBY',
  LANDSCAPING = 'LANDSCAPING',
  FACADE_PAINT = 'FACADE_PAINT',
  AMENITY = 'AMENITY',
  SECURITY_GATES = 'SECURITY_GATES',
  UTILITIES_EXTERNAL = 'UTILITIES_EXTERNAL',
  SIGNAGE = 'SIGNAGE',
  CLEANING = 'CLEANING',
  SAFETY = 'SAFETY',
  OTHER = 'OTHER',
}

@Entity('construction_development_updates')
@Index(['propertyId', 'updateDate'])
@Index(['scopeType'])
@Index(['category'])
export class ConstructionDevelopmentUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Legacy anchor - now optional so property/tower-wide updates don't need a project.
  @Column({ name: 'construction_project_id', type: 'uuid', nullable: true })
  constructionProjectId: string | null;

  @ManyToOne(() => ConstructionProject, { nullable: true })
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property?: Property;

  @Column({ name: 'tower_id', type: 'uuid', nullable: true })
  towerId: string | null;

  @ManyToOne(() => Tower, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tower_id' })
  tower?: Tower;

  @Column({
    name: 'scope_type',
    type: 'varchar',
    length: 30,
    enum: DevelopmentUpdateScope,
    nullable: true,
  })
  scopeType: DevelopmentUpdateScope | null;

  @Column({ name: 'common_area_label', type: 'varchar', length: 200, nullable: true })
  commonAreaLabel: string | null;

  @Column({
    name: 'category',
    type: 'varchar',
    length: 40,
    enum: DevelopmentUpdateCategory,
    nullable: true,
  })
  category: DevelopmentUpdateCategory | null;

  @Column({ name: 'update_date', type: 'date' })
  updateDate: Date;

  @Column({ name: 'update_title', type: 'varchar', length: 255 })
  updateTitle: string;

  @Column({ name: 'update_description', type: 'text' })
  updateDescription: string;

  @Column({ name: 'feedback_notes', type: 'text', nullable: true })
  feedbackNotes: string | null;

  @Column({ type: 'jsonb', default: [] })
  images: string[]; // Array of image URLs

  @Column({ type: 'jsonb', default: [] })
  attachments: string[]; // Array of document URLs

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({
    type: 'varchar',
    length: 20,
    enum: UpdateVisibility,
    default: UpdateVisibility.ALL,
  })
  visibility: UpdateVisibility;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get hasImages(): boolean {
    return Array.isArray(this.images) && this.images.length > 0;
  }

  get hasAttachments(): boolean {
    return Array.isArray(this.attachments) && this.attachments.length > 0;
  }

  get imageCount(): number {
    return Array.isArray(this.images) ? this.images.length : 0;
  }

  get attachmentCount(): number {
    return Array.isArray(this.attachments) ? this.attachments.length : 0;
  }

  get isRecent(): boolean {
    const daysDiff = Math.floor(
      (new Date().getTime() - new Date(this.updateDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 7; // Within last 7 days
  }
}
