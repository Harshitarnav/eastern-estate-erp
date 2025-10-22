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

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendor_code', unique: true, length: 50 })
  vendorCode: string;

  @Column({ name: 'vendor_name', length: 255 })
  vendorName: string;

  @Column({ name: 'contact_person', length: 255, nullable: true })
  contactPerson: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ name: 'alternate_phone', length: 20, nullable: true })
  alternatePhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 10, nullable: true })
  pincode: string;

  @Column({ name: 'gst_number', length: 20, nullable: true })
  gstNumber: string;

  @Column({ name: 'pan_number', length: 20, nullable: true })
  panNumber: string;

  @Column({ name: 'bank_name', length: 255, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'ifsc_code', length: 20, nullable: true })
  ifscCode: string;

  @Column({ name: 'materials_supplied', type: 'jsonb', default: '[]' })
  materialsSupplied: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'payment_terms', length: 255, nullable: true })
  paymentTerms: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'outstanding_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  outstandingAmount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  // Virtual property to check credit availability
  get availableCredit(): number {
    return Number(this.creditLimit) - Number(this.outstandingAmount);
  }

  // Virtual property to check if credit limit exceeded
  get isCreditLimitExceeded(): boolean {
    return Number(this.outstandingAmount) > Number(this.creditLimit);
  }
}
