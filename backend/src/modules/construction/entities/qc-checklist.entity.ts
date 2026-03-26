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
import { User } from '../../users/entities/user.entity';

export enum QCPhase {
  FOUNDATION = 'FOUNDATION',
  STRUCTURE = 'STRUCTURE',
  MEP = 'MEP',
  FINISHING = 'FINISHING',
  HANDOVER = 'HANDOVER',
}

export enum QCResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
}

export interface QCCheckItem {
  id: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'NA' | 'PENDING';
  remarks?: string;
}

export interface QCDefect {
  id: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolvedAt?: string;
  resolvedBy?: string;
}

@Entity('qc_checklists')
export class QCChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'construction_project_id', type: 'uuid' })
  constructionProjectId: string;

  @ManyToOne(() => ConstructionProject)
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

  @Column({
    name: 'phase',
    type: 'varchar',
    length: 30,
  })
  phase: QCPhase;

  @Column({ name: 'inspection_date', type: 'date' })
  inspectionDate: Date;

  @Column({ name: 'inspector_name', type: 'varchar', length: 255 })
  inspectorName: string;

  @Column({ name: 'location_description', type: 'varchar', length: 500, nullable: true })
  locationDescription: string | null;

  @Column({ name: 'items', type: 'jsonb', default: '[]' })
  items: QCCheckItem[];

  @Column({ name: 'defects', type: 'jsonb', default: '[]' })
  defects: QCDefect[];

  @Column({
    name: 'overall_result',
    type: 'varchar',
    length: 20,
    default: QCResult.PENDING,
  })
  overallResult: QCResult;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'next_inspection_date', type: 'date', nullable: true })
  nextInspectionDate: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual: pass count
  get passCount(): number {
    return this.items.filter(i => i.status === 'PASS').length;
  }

  get failCount(): number {
    return this.items.filter(i => i.status === 'FAIL').length;
  }

  get openDefects(): number {
    return this.defects.filter(d => d.status === 'OPEN').length;
  }
}
