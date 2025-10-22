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

export enum TeamType {
  CONTRACTOR = 'CONTRACTOR',
  IN_HOUSE = 'IN_HOUSE',
  LABOR = 'LABOR',
}

@Entity('construction_teams')
export class ConstructionTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_name', type: 'varchar', length: 255 })
  teamName: string;

  @Column({ name: 'team_code', type: 'varchar', length: 50, unique: true, nullable: true })
  teamCode: string | null;

  @Column({
    name: 'team_type',
    type: 'enum',
    enum: TeamType,
  })
  teamType: TeamType;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'construction_project_id', type: 'uuid', nullable: true })
  constructionProjectId: string | null;

  @Column({ name: 'leader_name', type: 'varchar', length: 255 })
  leaderName: string;

  @Column({ name: 'contact_number', type: 'varchar', length: 20 })
  contactNumber: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'total_members', type: 'integer', default: 0 })
  totalMembers: number;

  @Column({ name: 'active_members', type: 'integer', default: 0 })
  activeMembers: number;

  @Column({ name: 'specialization', type: 'varchar', length: 255, nullable: true })
  specialization: string | null;

  @Column({ name: 'skills', type: 'text', array: true, nullable: true })
  skills: string[] | null;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate: Date | null;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date | null;

  @Column({ name: 'daily_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  dailyRate: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
