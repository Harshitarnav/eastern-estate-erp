import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DemandDraftStatus {
  DRAFT = 'DRAFT', // Generated content, editable
  READY = 'READY', // Finalized and exported
  SENT = 'SENT', // Delivered to customer
  FAILED = 'FAILED', // Export or send failed
}

@Entity('demand_drafts')
@Index(['flatId'])
@Index(['customerId'])
@Index(['bookingId'])
export class DemandDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'flat_id', type: 'uuid', nullable: true })
  flatId: string | null;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @Column({ name: 'milestone_id', type: 'varchar', length: 200, nullable: true })
  milestoneId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: DemandDraftStatus.DRAFT })
  status: DemandDraftStatus;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  // Optional JSON with placeholders, bank details, etc.
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'generated_at', type: 'timestamp', nullable: true })
  generatedAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
