import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_number', unique: true })
  accountNumber: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'branch_name' })
  branchName: string;

  @Column({ name: 'ifsc_code' })
  ifscCode: string;

  @Column({ name: 'account_type' })
  accountType: string; // Current, Savings, OD

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'opening_balance',
    default: 0,
  })
  openingBalance: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'current_balance',
    default: 0,
  })
  currentBalance: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
