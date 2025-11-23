import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { CallLog } from './call-log.entity';
import { CallRecording } from './call-recording.entity';
import { AiInsight } from './ai-insight.entity';

@Entity('call_transcriptions', { schema: 'telephony' })
export class CallTranscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'call_log_id', type: 'uuid' })
  callLogId: string;

  @OneToOne(() => CallLog, callLog => callLog.transcription)
  @JoinColumn({ name: 'call_log_id' })
  callLog: CallLog;

  @Column({ name: 'recording_id', type: 'uuid', nullable: true })
  recordingId: string;

  @ManyToOne(() => CallRecording, { nullable: true })
  @JoinColumn({ name: 'recording_id' })
  recording: CallRecording;

  @Column({ name: 'full_text', type: 'text' })
  fullText: string;

  @Column({ name: 'segments', type: 'jsonb', nullable: true })
  segments: any[];

  @Column({ name: 'language', default: 'en' })
  language: string;

  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number;

  @Column({ name: 'speakers_detected', nullable: true })
  speakersDetected: number;

  @Column({ name: 'agent_segments', type: 'jsonb', nullable: true })
  agentSegments: any;

  @Column({ name: 'customer_segments', type: 'jsonb', nullable: true })
  customerSegments: any;

  @Column({ name: 'provider', default: 'openai-whisper' })
  provider: string;

  @Column({ name: 'model_used', nullable: true })
  modelUsed: string;

  @Column({ name: 'processing_status', default: 'PENDING' })
  processingStatus: string;

  @Column({ name: 'processing_time', nullable: true })
  processingTime: number;

  @Column({ name: 'cost', type: 'decimal', precision: 10, scale: 4, nullable: true })
  cost: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => AiInsight, insight => insight.transcription)
  aiInsight: AiInsight;
}

