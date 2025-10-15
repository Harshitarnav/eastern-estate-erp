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

export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_code', unique: true })
  accountCode: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    name: 'account_type',
  })
  accountType: AccountType;

  @Column({ name: 'parent_account_id', nullable: true })
  parentAccountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount: Account;

  @OneToMany(() => Account, (account) => account.parentAccount)
  childAccounts: Account[];

  @Column({ default: 1 })
  level: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

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

  @Column({ name: 'gst_applicable', default: false })
  gstApplicable: boolean;

  @Column({ name: 'hsn_code', nullable: true })
  hsnCode: string;

  @Column({ name: 'tax_category', nullable: true })
  taxCategory: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
