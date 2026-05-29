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
import { Property } from '../../properties/entities/property.entity';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};


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
  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Payment Period
  @Column({ type: 'date' })
  paymentMonth: Date; // First day of the month for which salary is paid

  @Column({ type: 'decimal', precision: 6, scale: 2, transformer: decimalTransformer })
  workingDays: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, transformer: decimalTransformer })
  presentDays: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0, transformer: decimalTransformer })
  absentDays: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0, transformer: decimalTransformer })
  paidLeaveDays: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0, transformer: decimalTransformer })
  unpaidLeaveDays: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, transformer: decimalTransformer })
  overtimeHours: number;

  // Salary Components
  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  houseRentAllowance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  transportAllowance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  medicalAllowance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  overtimePayment: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  otherAllowances: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  grossSalary: number;

  // Deductions
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  pfDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  esiDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  taxDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  advanceDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  loanDeduction: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  netSalary: number;

  // Payment Details
  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
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

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

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
