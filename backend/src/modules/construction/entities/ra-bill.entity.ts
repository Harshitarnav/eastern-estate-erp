import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ConstructionProject } from './construction-project.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

export enum RABillStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  CERTIFIED = 'CERTIFIED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

@Entity('ra_bills')
export class RABill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ra_bill_number', type: 'varchar', length: 50, unique: true })
  raBillNumber: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ name: 'construction_project_id', type: 'uuid' })
  constructionProjectId: string;

  @ManyToOne(() => ConstructionProject)
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'bill_date', type: 'date' })
  billDate: Date;

  @Column({ name: 'bill_period_start', type: 'date', nullable: true })
  billPeriodStart: Date | null;

  @Column({ name: 'bill_period_end', type: 'date', nullable: true })
  billPeriodEnd: Date | null;

  @Column({ name: 'work_description', type: 'text' })
  workDescription: string;

  // Cumulative gross value of work certified in this and all previous bills
  @Column({ name: 'gross_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossAmount: number;

  // Total of all previous RA bills for this contract
  @Column({ name: 'previous_bills_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  previousBillsAmount: number;

  // Payable this bill = grossAmount - previousBillsAmount
  @Column({ name: 'net_this_bill', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netThisBill: number;

  // Retention (security deposit held back) e.g. 5 or 10 percent
  @Column({ name: 'retention_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  retentionPercentage: number;

  @Column({ name: 'retention_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  retentionAmount: number;

  // Deduction for advances given to contractor
  @Column({ name: 'advance_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  advanceDeduction: number;

  @Column({ name: 'other_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ name: 'other_deductions_description', type: 'varchar', length: 500, nullable: true })
  otherDeductionsDescription: string | null;

  // Final amount payable to contractor
  @Column({ name: 'net_payable', type: 'decimal', precision: 15, scale: 2, default: 0 })
  netPayable: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: RABillStatus.DRAFT,
  })
  status: RABillStatus;

  @Column({ name: 'certified_by', type: 'uuid', nullable: true })
  certifiedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'certified_by' })
  certifier: User;

  @Column({ name: 'certified_at', type: 'timestamp', nullable: true })
  certifiedAt: Date | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  paymentReference: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  /** Auto-generated journal entry when this bill is marked PAID */
  @Column({ name: 'journal_entry_id', type: 'uuid', nullable: true })
  journalEntryId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
