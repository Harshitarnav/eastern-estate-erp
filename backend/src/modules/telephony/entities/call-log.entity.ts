import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { CallRecording } from './call-recording.entity';
import { CallTranscription } from './call-transcription.entity';
import { AiInsight } from './ai-insight.entity';

@Entity('call_logs', { schema: 'telephony' })
export class CallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'call_sid', unique: true })
  callSid: string;

  @Column({ name: 'conversation_uuid', nullable: true })
  conversationUuid: string;

  @Column({ name: 'direction' })
  direction: 'INBOUND' | 'OUTBOUND';

  @Column({ name: 'call_type', default: 'GENERAL' })
  callType: string;

  @Column({ name: 'from_number' })
  fromNumber: string;

  @Column({ name: 'to_number' })
  toNumber: string;

  @Column({ name: 'masked_number', nullable: true })
  maskedNumber: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'assigned_agent_id', type: 'uuid', nullable: true })
  assignedAgentId: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'assigned_agent_id' })
  assignedAgent: Employee;

  @Column({ name: 'status', default: 'QUEUED' })
  status: string;

  @Column({ name: 'ivr_selection', nullable: true })
  ivrSelection: string;

  @Column({ name: 'ivr_path', type: 'jsonb', nullable: true })
  ivrPath: any;

  @Column({ name: 'duration', default: 0 })
  duration: number;

  @Column({ name: 'ring_duration', nullable: true })
  ringDuration: number;

  @Column({ name: 'conversation_duration', nullable: true })
  conversationDuration: number;

  @Column({ name: 'queue_position', nullable: true })
  queuePosition: number;

  @Column({ name: 'wait_time', default: 0 })
  waitTime: number;

  @Column({ name: 'queue_name', nullable: true })
  queueName: string;

  @Column({ name: 'round_robin_attempt', default: 1 })
  roundRobinAttempt: number;

  @Column({ name: 'agents_tried', type: 'uuid', array: true, nullable: true })
  agentsTried: string[];

  @Column({ name: 'call_quality', nullable: true })
  callQuality: string;

  @Column({ name: 'disconnect_reason', nullable: true })
  disconnectReason: string;

  @Column({ name: 'recording_url', type: 'text', nullable: true })
  recordingUrl: string;

  @Column({ name: 'recording_sid', nullable: true })
  recordingSid: string;

  @Column({ name: 'recording_duration', nullable: true })
  recordingDuration: number;

  @Column({ name: 'recording_status', default: 'PENDING' })
  recordingStatus: string;

  @Column({ name: 'transcription_text', type: 'text', nullable: true })
  transcriptionText: string;

  @Column({ name: 'transcription_status', default: 'PENDING' })
  transcriptionStatus: string;

  @Column({ name: 'transcription_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  transcriptionConfidence: number;

  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary: string;

  @Column({ name: 'ai_detailed_summary', type: 'text', nullable: true })
  aiDetailedSummary: string;

  @Column({ name: 'sentiment', nullable: true })
  sentiment: string;

  @Column({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  sentimentScore: number;

  @Column({ name: 'intent', nullable: true })
  intent: string;

  @Column({ name: 'key_topics', type: 'jsonb', nullable: true })
  keyTopics: string[];

  @Column({ name: 'action_items', type: 'jsonb', nullable: true })
  actionItems: any[];

  @Column({ name: 'entities_extracted', type: 'jsonb', nullable: true })
  entitiesExtracted: any;

  @Column({ name: 'lead_quality_score', nullable: true })
  leadQualityScore: number;

  @Column({ name: 'conversion_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  conversionProbability: number;

  @Column({ name: 'next_action_suggestion', type: 'text', nullable: true })
  nextActionSuggestion: string;

  @Column({ name: 'queued_at', type: 'timestamp', nullable: true })
  queuedAt: Date;

  @Column({ name: 'ringing_started_at', type: 'timestamp', nullable: true })
  ringingStartedAt: Date;

  @Column({ name: 'answered_at', type: 'timestamp', nullable: true })
  answeredAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ name: 'exotel_metadata', type: 'jsonb', nullable: true })
  exotelMetadata: any;

  @Column({ name: 'custom_data', type: 'jsonb', nullable: true })
  customData: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => CallRecording, recording => recording.callLog)
  recordings: CallRecording[];

  @OneToOne(() => CallTranscription, transcription => transcription.callLog)
  transcription: CallTranscription;

  @OneToOne(() => AiInsight, insight => insight.callLog)
  aiInsight: AiInsight;
}


