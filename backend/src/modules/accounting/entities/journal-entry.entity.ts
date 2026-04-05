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
import { User } from '../../users/entities/user.entity';
import { JournalEntryLine } from './journal-entry-line.entity';
import { Property } from '../../properties/entities/property.entity';

export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  APPROVED = 'APPROVED',
  VOID = 'VOID',
}

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  entryNumber: string;

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ length: 50, nullable: true })
  referenceType: string; // PAYMENT, BOOKING, SALARY, EXPENSE, ADJUSTMENT, etc.

  @Column({ nullable: true })
  referenceId: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalDebit: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalCredit: number;

  @Column({
    type: 'enum',
    enum: JournalEntryStatus,
    default: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @Column({ nullable: true })
  createdBy: string; // snake_case: created_by (via SnakeNamingStrategy)

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' }) // explicit snake_case to match DB
  creator: User;

  @Column({ nullable: true })
  approvedBy: string; // snake_case: approved_by

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date; // snake_case: approved_at

  @Column({ nullable: true })
  voidedBy: string; // snake_case: voided_by

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voided_by' })
  voider: User;

  @Column({ type: 'timestamp', nullable: true })
  voidedAt: Date; // snake_case: voided_at

  @Column({ type: 'text', nullable: true })
  voidReason: string; // snake_case: void_reason

  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, { cascade: true })
  lines: JournalEntryLine[];

  @Column({ name: 'property_id', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
