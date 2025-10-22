import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ConstructionProject } from './construction-project.entity';
import { User } from '../../users/entities/user.entity';

export enum UpdateVisibility {
  ALL = 'ALL',
  INTERNAL = 'INTERNAL',
  MANAGEMENT_ONLY = 'MANAGEMENT_ONLY',
}

@Entity('construction_development_updates')
export class ConstructionDevelopmentUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'construction_project_id', type: 'uuid' })
  constructionProjectId: string;

  @ManyToOne(() => ConstructionProject)
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

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
