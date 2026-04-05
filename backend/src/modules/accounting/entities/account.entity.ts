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
import { Property } from '../../properties/entities/property.entity';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique constraint is now composite (account_code + property_id scope) — managed by migration v014
  @Column({ name: 'account_code', length: 50 })
  accountCode: string;

  @Column({ name: 'account_name', length: 200 })
  accountName: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({ name: 'account_category', length: 100 })
  accountCategory: string;

  @Column({ name: 'parent_account_id', nullable: true })
  parentAccountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount: Account;

  @OneToMany(() => Account, (account) => account.parentAccount)
  childAccounts: Account[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column('decimal', { name: 'opening_balance', precision: 15, scale: 2, default: 0 })
  openingBalance: number;

  @Column('decimal', { name: 'current_balance', precision: 15, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
