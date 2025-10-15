import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'journal_entry_id' })
  journalEntryId: string;

  @ManyToOne(() => JournalEntry)
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @Column({ name: 'line_number' })
  lineNumber: number;

  @Column({ name: 'account_id' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'account_code' })
  accountCode: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'debit_amount',
    default: 0,
  })
  debitAmount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'credit_amount',
    default: 0,
  })
  creditAmount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cost_center', nullable: true })
  costCenter: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'gst_amount',
    default: 0,
  })
  gstAmount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'tds_amount',
    default: 0,
  })
  tdsAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
