import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

export enum JournalEntryType {
  MANUAL = 'Manual',
  AUTOMATIC = 'Automatic',
  ADJUSTMENT = 'Adjustment',
  CLOSING = 'Closing',
}

export enum JournalEntryStatus {
  DRAFT = 'Draft',
  POSTED = 'Posted',
  REVERSED = 'Reversed',
}

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entry_number', unique: true })
  entryNumber: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({
    type: 'enum',
    enum: JournalEntryType,
    name: 'entry_type',
    default: JournalEntryType.MANUAL,
  })
  entryType: JournalEntryType;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ type: 'text' })
  narration: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'total_debit',
    default: 0,
  })
  totalDebit: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'total_credit',
    default: 0,
  })
  totalCredit: number;

  @Column({
    type: 'enum',
    enum: JournalEntryStatus,
    default: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'financial_year' })
  financialYear: string;

  @Column()
  period: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
