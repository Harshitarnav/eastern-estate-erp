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

@Entity('round_robin_config', { schema: 'telephony' })
export class RoundRobinConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'department' })
  department: string;

  @Column({ name: 'algorithm', default: 'ROUND_ROBIN' })
  algorithm: 'ROUND_ROBIN' | 'LEAST_BUSY' | 'SKILL_BASED' | 'PRIORITY';

  @Column({ name: 'max_queue_size', default: 100 })
  maxQueueSize: number;

  @Column({ name: 'max_wait_time', default: 300 })
  maxWaitTime: number;

  @Column({ name: 'max_ring_time', default: 30 })
  maxRingTime: number;

  @Column({ name: 'overflow_action', default: 'VOICEMAIL' })
  overflowAction: 'VOICEMAIL' | 'CALLBACK' | 'TRANSFER' | 'HANGUP';

  @Column({ name: 'overflow_number', nullable: true })
  overflowNumber: string;

  @Column({ name: 'overflow_message', type: 'text', nullable: true })
  overflowMessage: string;

  @Column({ name: 'business_hours', type: 'jsonb', nullable: true })
  businessHours: any;

  @Column({ name: 'timezone', default: 'Asia/Kolkata' })
  timezone: string;

  @Column({ name: 'priority_rules', type: 'jsonb', nullable: true })
  priorityRules: any;

  @Column({ name: 'active', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

