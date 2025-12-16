import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { CallLog } from './call-log.entity';
import { CallTranscription } from './call-transcription.entity';

@Entity('call_recordings', { schema: 'telephony' })
export class CallRecording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'call_log_id', type: 'uuid' })
  callLogId: string;

  @ManyToOne(() => CallLog, callLog => callLog.recordings)
  @JoinColumn({ name: 'call_log_id' })
  callLog: CallLog;

  @Column({ name: 'recording_url', type: 'text' })
  recordingUrl: string;

  @Column({ name: 'recording_sid', unique: true, nullable: true })
  recordingSid: string;

  @Column({ name: 'duration' })
  duration: number;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'format', default: 'mp3' })
  format: string;

  @Column({ name: 'storage_provider', default: 'aws' })
  storageProvider: string;

  @Column({ name: 's3_bucket', nullable: true })
  s3Bucket: string;

  @Column({ name: 's3_key', type: 'text', nullable: true })
  s3Key: string;

  @Column({ name: 'local_path', type: 'text', nullable: true })
  localPath: string;

  @Column({ name: 'is_downloaded', default: false })
  isDownloaded: boolean;

  @Column({ name: 'is_processed', default: false })
  isProcessed: boolean;

  @Column({ name: 'is_transcribed', default: false })
  isTranscribed: boolean;

  @Column({ name: 'recorded_at', type: 'timestamp', nullable: true })
  recordedAt: Date;

  @Column({ name: 'downloaded_at', type: 'timestamp', nullable: true })
  downloadedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => CallTranscription, transcription => transcription.recording)
  transcription: CallTranscription;
}


