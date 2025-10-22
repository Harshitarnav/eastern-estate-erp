import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Property } from '../../properties/entities/property.entity';
import { Account } from './account.entity';
import { JournalEntry } from './journal-entry.entity';

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expense_code', unique: true, length: 50 })
  expenseCode: string;

  @Column({ name: 'expense_category', length: 100 })
  expenseCategory: string; // SALARY, RENT, UTILITIES, MARKETING, MATERIALS, MAINTENANCE, TRAVEL, OTHER

  @Column({ name: 'expense_type', length: 100 })
  expenseType: string;

  @Column({ name: 'expense_sub_category', length: 100, nullable: true })
  expenseSubCategory: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: Date;

  @Column({ name: 'vendor_id', nullable: true })
  vendorId: string;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'construction_project_id', nullable: true })
  constructionProjectId: string;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod: string; // CASH, CHEQUE, BANK_TRANSFER, UPI, CARD

  @Column({ name: 'payment_reference', length: 200, nullable: true })
  paymentReference: string;

  @Column({ name: 'payment_status', length: 50, default: 'PENDING' })
  paymentStatus: string; // PENDING, PAID, PARTIAL

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  invoiceDate: Date;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: string;

  @ManyToOne(() => JournalEntry, { nullable: true })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
