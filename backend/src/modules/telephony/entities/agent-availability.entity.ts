import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('agent_availability', { schema: 'telephony' })
export class AgentAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'status', default: 'AVAILABLE' })
  status: 'AVAILABLE' | 'ON_CALL' | 'BREAK' | 'OFFLINE';

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'alternate_number', nullable: true })
  alternateNumber: string;

  @Column({ name: 'extension', nullable: true })
  extension: string;

  @Column({ name: 'exotel_agent_id', nullable: true })
  exotelAgentId: string;

  @Column({ name: 'max_concurrent_calls', default: 2 })
  maxConcurrentCalls: number;

  @Column({ name: 'current_calls', default: 0 })
  currentCalls: number;

  @Column({ name: 'total_calls_today', default: 0 })
  totalCallsToday: number;

  @Column({ name: 'total_duration_today', default: 0 })
  totalDurationToday: number;

  @Column({ name: 'successful_calls_today', default: 0 })
  successfulCallsToday: number;

  @Column({ name: 'missed_calls_today', default: 0 })
  missedCallsToday: number;

  @Column({ name: 'last_call_assigned_at', type: 'timestamp', nullable: true })
  lastCallAssignedAt: Date;

  @Column({ name: 'last_call_completed_at', type: 'timestamp', nullable: true })
  lastCallCompletedAt: Date;

  @Column({ name: 'priority_score', default: 100 })
  priorityScore: number;

  @Column({ name: 'break_start_time', type: 'timestamp', nullable: true })
  breakStartTime: Date;

  @Column({ name: 'break_duration', nullable: true })
  breakDuration: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'settings', type: 'jsonb', default: '{}' })
  settings: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


