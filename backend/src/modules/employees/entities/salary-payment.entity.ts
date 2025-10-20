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
import { Employee } from './employee.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMode {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  UPI = 'UPI',
}

/**
 * Salary Payment Entity
 * 
 * Tracks monthly salary payments for employees
 */
@Entity('salary_payments')
@Index(['employeeId'])
@Index(['paymentMonth'])
@Index(['paymentStatus'])
export class SalaryPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Employee Reference
  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Payment Period
  @Column({ type: 'date' })
  paymentMonth: Date; // First day of the month for which salary is paid

  @Column({ type: 'int' })
  workingDays: number;

  @Column({ type: 'int' })
  presentDays: number;

  @Column({ type: 'int', default: 0 })
  absentDays: number;

  @Column({ type: 'int', default: 0 })
  paidLeaveDays: number;

  @Column({ type: 'int', default: 0 })
  unpaidLeaveDays: number;

  @Column({ type: 'int', default: 0 })
  overtimeHours: number;

  // Salary Components
  @Column('decimal', { precision: 15, scale: 2 })
  basicSalary: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  houseRentAllowance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  transportAllowance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  medicalAllowance: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  overtimePayment: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  otherAllowances: number;

  @Column('decimal', { precision: 15, scale: 2 })
  grossSalary: number;

  // Deductions
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  pfDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  esiDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  taxDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  advanceDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  loanDeduction: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column('decimal', { precision: 15, scale: 2 })
  totalDeductions: number;

  @Column('decimal', { precision: 15, scale: 2 })
  netSalary: number;

  // Payment Details
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMode,
    nullable: true,
  })
  paymentMode: PaymentMode;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ length: 100, nullable: true })
  transactionReference: string;

  @Column({ length: 200, nullable: true })
  paymentRemarks: string;

  // Bank Details (in case different from employee master)
  @Column({ length: 200, nullable: true })
  bankName: string;

  @Column({ length: 50, nullable: true })
  accountNumber: string;

  @Column({ length: 50, nullable: true })
  ifscCode: string;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // System Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;
}
