import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';

@Entity('construction_projects')
export class ConstructionProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'project_name', type: 'varchar', length: 255 })
  projectName: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'expected_completion_date', type: 'date' })
  expectedCompletionDate: Date;

  // Align column name with existing DB schema (actual_end_date in DB)
  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualCompletionDate: Date | null;

  @Column({ 
    name: 'status', 
    type: 'varchar', 
    length: 20, 
    default: 'PLANNING' 
  })
  status: string;

  @Column({ name: 'overall_progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallProgress: number;

  @Column({ name: 'budget_allocated', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetAllocated: number;

  @Column({ name: 'budget_spent', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetSpent: number;

  @Column({ name: 'project_manager_id', type: 'uuid', nullable: true })
  projectManagerId: string | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'project_manager_id' })
  projectManager: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
