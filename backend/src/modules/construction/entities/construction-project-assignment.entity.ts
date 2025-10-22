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
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';

export enum AssignmentRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_ENGINEER = 'SITE_ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
  FOREMAN = 'FOREMAN',
  QUALITY_INSPECTOR = 'QUALITY_INSPECTOR',
}

@Entity('construction_project_assignments')
export class ConstructionProjectAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'construction_project_id', type: 'uuid' })
  constructionProjectId: string;

  @ManyToOne(() => ConstructionProject)
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    type: 'varchar',
    length: 30,
    enum: AssignmentRole,
  })
  role: AssignmentRole;

  @Column({ name: 'assigned_date', type: 'date' })
  assignedDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
