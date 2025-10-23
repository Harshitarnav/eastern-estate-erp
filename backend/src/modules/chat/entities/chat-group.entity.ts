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
import { Employee } from '../../employees/entities/employee.entity';

export enum ChatGroupType {
  GROUP = 'GROUP',
  DIRECT = 'DIRECT',
}

/**
 * Chat Group Entity
 * Represents a chat group or direct conversation
 */
@Entity('chat_groups')
@Index(['createdByEmployeeId'])
@Index(['groupType'])
@Index(['isActive'])
@Index(['createdAt'])
export class ChatGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ChatGroupType,
    default: ChatGroupType.GROUP,
  })
  groupType: ChatGroupType;

  @Column({ length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'uuid', name: 'created_by_employee_id', nullable: true })
  createdByEmployeeId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'created_by_employee_id' })
  createdBy: Employee;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
