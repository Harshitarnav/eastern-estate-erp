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
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  voidedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'voidedBy' })
  voider: User;

  @Column({ type: 'timestamp', nullable: true })
  voidedAt: Date;

  @Column({ type: 'text', nullable: true })
  voidReason: string;

  @OneToMany(() => JournalEntryLine, (line) => line.journalEntry, { cascade: true })
  lines: JournalEntryLine[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
