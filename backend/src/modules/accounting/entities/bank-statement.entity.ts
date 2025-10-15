import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BankAccount } from './bank-account.entity';

@Entity('bank_statements')
export class BankStatement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bank_account_id' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({ name: 'statement_date', type: 'date' })
  statementDate: Date;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

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

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  balance: number;

  @Column({ name: 'transaction_type', nullable: true })
  transactionType: string;

  @Column({ name: 'is_reconciled', default: false })
  isReconciled: boolean;

  @Column({ name: 'reconciled_with_entry_id', nullable: true })
  reconciledWithEntryId: string;

  @Column({ name: 'reconciled_date', type: 'date', nullable: true })
  reconciledDate: Date;

  @Column({ name: 'uploaded_file', nullable: true })
  uploadedFile: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
