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
import { Account } from './account.entity';

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  REVISED = 'REVISED',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'budget_name', length: 200 })
  budgetName: string;

  @Column({ name: 'budget_code', unique: true, length: 50 })
  budgetCode: string;

  @Column({ name: 'fiscal_year' })
  fiscalYear: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column('decimal', { name: 'budgeted_amount', precision: 15, scale: 2 })
  budgetedAmount: number;

  @Column('decimal', { name: 'actual_amount', precision: 15, scale: 2, default: 0 })
  actualAmount: number;

//   @Column('decimal', { precision: 15, scale: 2, generatedType: 'STORED', asExpression: '(actual_amount - budgeted_amount)' })
//   varianceAmount: number;

//   @Column('decimal', { precision: 5, scale: 2, generatedType: 'STORED', asExpression: `(CASE WHEN budgeted_amount > 0 THEN ((actual_amount - budgeted_amount) / budgeted_amount * 100) ELSE 0 END)` })
//   variancePercentage: number;

  @Column({
    type: 'enum',
    enum: BudgetStatus,
    default: BudgetStatus.DRAFT,
  })
  status: BudgetStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
