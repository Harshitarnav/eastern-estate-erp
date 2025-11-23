import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CallLog } from './call-log.entity';
import { CallTranscription } from './call-transcription.entity';

@Entity('ai_insights', { schema: 'telephony' })
export class AiInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'call_log_id', type: 'uuid' })
  callLogId: string;

  @OneToOne(() => CallLog, callLog => callLog.aiInsight)
  @JoinColumn({ name: 'call_log_id' })
  callLog: CallLog;

  @Column({ name: 'transcription_id', type: 'uuid', nullable: true })
  transcriptionId: string;

  @OneToOne(() => CallTranscription, { nullable: true })
  @JoinColumn({ name: 'transcription_id' })
  transcription: CallTranscription;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary: string;

  @Column({ name: 'detailed_summary', type: 'text', nullable: true })
  detailedSummary: string;

  @Column({ name: 'key_points', type: 'text', array: true, nullable: true })
  keyPoints: string[];

  @Column({ name: 'overall_sentiment', nullable: true })
  overallSentiment: string;

  @Column({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  sentimentScore: number;

  @Column({ name: 'sentiment_by_segment', type: 'jsonb', nullable: true })
  sentimentBySegment: any;

  @Column({ name: 'customer_emotion', nullable: true })
  customerEmotion: string;

  @Column({ name: 'primary_intent', nullable: true })
  primaryIntent: string;

  @Column({ name: 'secondary_intents', type: 'text', array: true, nullable: true })
  secondaryIntents: string[];

  @Column({ name: 'intent_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  intentConfidence: number;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail: string;

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone: string;

  @Column({ name: 'customer_alternate_phone', nullable: true })
  customerAlternatePhone: string;

  @Column({ name: 'budget_min', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ name: 'budget_currency', default: 'INR' })
  budgetCurrency: string;

  @Column({ name: 'preferred_location', type: 'text', nullable: true })
  preferredLocation: string;

  @Column({ name: 'property_type', nullable: true })
  propertyType: string;

  @Column({ name: 'bhk_requirement', nullable: true })
  bhkRequirement: string;

  @Column({ name: 'property_requirements', type: 'jsonb', nullable: true })
  propertyRequirements: any;

  @Column({ name: 'timeline', nullable: true })
  timeline: string;

  @Column({ name: 'urgency_level', nullable: true })
  urgencyLevel: string;

  @Column({ name: 'ready_to_visit', nullable: true })
  readyToVisit: boolean;

  @Column({ name: 'preferred_visit_date', type: 'date', nullable: true })
  preferredVisitDate: Date;

  @Column({ name: 'key_topics', type: 'text', array: true, nullable: true })
  keyTopics: string[];

  @Column({ name: 'mentioned_properties', type: 'text', array: true, nullable: true })
  mentionedProperties: string[];

  @Column({ name: 'mentioned_competitors', type: 'text', array: true, nullable: true })
  mentionedCompetitors: string[];

  @Column({ name: 'customer_questions', type: 'jsonb', nullable: true })
  customerQuestions: any[];

  @Column({ name: 'objections', type: 'jsonb', nullable: true })
  objections: any[];

  @Column({ name: 'action_items', type: 'jsonb', nullable: true })
  actionItems: any[];

  @Column({ name: 'follow_up_required', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_reason', type: 'text', nullable: true })
  followUpReason: string;

  @Column({ name: 'lead_quality_score', nullable: true })
  leadQualityScore: number;

  @Column({ name: 'conversion_probability', type: 'decimal', precision: 5, scale: 2, nullable: true })
  conversionProbability: number;

  @Column({ name: 'hot_lead', default: false })
  hotLead: boolean;

  @Column({ name: 'next_best_action', type: 'text', nullable: true })
  nextBestAction: string;

  @Column({ name: 'recommended_properties', type: 'uuid', array: true, nullable: true })
  recommendedProperties: string[];

  @Column({ name: 'talking_points', type: 'text', array: true, nullable: true })
  talkingPoints: string[];

  @Column({ name: 'model_used', default: 'gpt-4-turbo-preview' })
  modelUsed: string;

  @Column({ name: 'processing_cost', type: 'decimal', precision: 10, scale: 4, nullable: true })
  processingCost: number;

  @Column({ name: 'processing_time', nullable: true })
  processingTime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

