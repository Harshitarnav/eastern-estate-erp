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
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionPhase, PhaseStatus } from './construction-tower-progress.entity';

@Entity('construction_flat_progress')
export class ConstructionFlatProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'construction_project_id', type: 'uuid' })
  constructionProjectId: string;

  @ManyToOne(() => ConstructionProject)
  @JoinColumn({ name: 'construction_project_id' })
  constructionProject: ConstructionProject;

  @Column({ name: 'flat_id', type: 'uuid' })
  flatId: string;

  @ManyToOne(() => Flat)
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @Column({
    type: 'varchar',
    length: 30,
    enum: ConstructionPhase,
  })
  phase: ConstructionPhase;

  @Column({
    name: 'phase_progress',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  phaseProgress: number;

  @Column({
    name: 'overall_progress',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  overallProgress: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expectedEndDate: Date | null;

  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualEndDate: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: PhaseStatus,
    default: PhaseStatus.NOT_STARTED,
  })
  status: PhaseStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isDelayed(): boolean {
    if (!this.expectedEndDate || this.status === PhaseStatus.COMPLETED) {
      return false;
    }
    return new Date() > new Date(this.expectedEndDate);
  }

  get daysRemaining(): number | null {
    if (!this.expectedEndDate || this.status === PhaseStatus.COMPLETED) {
      return null;
    }
    const today = new Date();
    const expected = new Date(this.expectedEndDate);
    const diff = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  get isCompleted(): boolean {
    return this.status === PhaseStatus.COMPLETED && this.phaseProgress === 100;
  }

  get isReadyForHandover(): boolean {
    return this.phase === ConstructionPhase.HANDOVER && this.phaseProgress === 100;
  }
}
