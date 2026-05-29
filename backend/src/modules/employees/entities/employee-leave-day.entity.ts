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

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};


export enum EmployeeLeaveKind {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  ABSENT = 'ABSENT',
}

/**
 * One row per calendar day (per leave kind): full day (1) or half day (0.5).
 * Kept indefinitely for history; soft-delete via isActive.
 */
@Entity('employee_leave_days')
@Index(['employeeId'])
@Index(['leaveDate'])
export class EmployeeLeaveDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'leave_date', type: 'date' })
  leaveDate: Date;

  /** 1 = full day, 0.5 = half day */
  @Column({ name: 'day_fraction', type: 'decimal', precision: 3, scale: 2, default: 1, transformer: decimalTransformer })
  dayFraction: number;

  @Column({ name: 'leave_kind', type: 'varchar', length: 20 })
  leaveKind: EmployeeLeaveKind;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;
}
