import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  ALERT = 'ALERT',
}

export enum NotificationCategory {
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  LEAD = 'LEAD',
  CONSTRUCTION = 'CONSTRUCTION',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  ACCOUNTING = 'ACCOUNTING',
  SYSTEM = 'SYSTEM',
  TASK = 'TASK',
  REMINDER = 'REMINDER',
}

/**
 * Notification Entity
 * 
 * Stores in-app notifications for users based on their roles and departments.
 * Can be configured to send email notifications as well.
 */
@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['targetRoles'])
@Index(['targetDepartments'])
@Index(['createdAt'])
@Index(['category'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Target User (specific user or null for role/department-based)
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Role-Based Targeting (comma-separated role names)
  @Column({ type: 'text', nullable: true })
  targetRoles: string;

  // Department-Based Targeting (comma-separated department names)
  @Column({ type: 'text', nullable: true })
  targetDepartments: string;

  // Notification Content
  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
    default: NotificationCategory.SYSTEM,
  })
  category: NotificationCategory;

  // Action Link (optional)
  @Column({ type: 'text', nullable: true })
  actionUrl: string;

  @Column({ length: 100, nullable: true })
  actionLabel: string;

  // Related Entity Reference
  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ length: 100, nullable: true })
  relatedEntityType: string;

  // Status
  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  // Email Notification
  @Column({ default: false })
  shouldSendEmail: boolean;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date;

  // Priority
  @Column({ type: 'int', default: 0 })
  priority: number;

  // Expiry
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // System Fields
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
