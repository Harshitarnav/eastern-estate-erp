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
import { User } from '../../users/entities/user.entity';

/**
 * Demand Draft Template Entity
 * 
 * HTML templates for auto-generating demand drafts.
 * Contains placeholders that get replaced with actual data.
 */
@Entity('demand_draft_templates')
@Index(['isActive'])
@Index(['tone'])
export class DemandDraftTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })
  subject: string;

  @Column({ name: 'html_content', type: 'text' })
  htmlContent: string;

  // Tone keys used by the overdue scanner to pick the right template.
  // Valid values: ON_TIME, REMINDER_1..REMINDER_4, CANCELLATION_WARNING, POST_WARNING.
  @Column({ name: 'tone', type: 'varchar', length: 40, default: 'ON_TIME' })
  tone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
