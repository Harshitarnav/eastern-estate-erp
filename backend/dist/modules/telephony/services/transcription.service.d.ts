import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CallTranscription } from '../entities/call-transcription.entity';
import { CallLog } from '../entities/call-log.entity';
export interface TranscriptionResult {
    transcriptionId: number;
    callSid: string;
    text: string;
    duration: number;
    language: string;
    confidence: number;
}
export declare class TranscriptionService {
    private configService;
    private transcriptionRepo;
    private callLogRepo;
    private readonly logger;
    private readonly openai;
    private readonly whisperModel;
    private readonly tempDir;
    constructor(configService: ConfigService, transcriptionRepo: Repository<CallTranscription>, callLogRepo: Repository<CallLog>);
    transcribeCall(callSid: string, recordingBuffer: Buffer, format?: string): Promise<TranscriptionResult>;
    getTranscription(callSid: string): Promise<CallTranscription | null>;
    getTranscriptionById(id: number): Promise<CallTranscription | null>;
    searchTranscriptions(searchQuery: string, propertyId?: number, limit?: number): Promise<CallTranscription[]>;
    getStatistics(propertyId?: number): Promise<any>;
    extractKeywords(text: string): string[];
    private calculateConfidence;
    detectLanguage(recordingBuffer: Buffer, format?: string): Promise<string>;
    batchTranscribe(calls: {
        callSid: string;
        recordingBuffer: Buffer;
        format?: string;
    }[]): Promise<TranscriptionResult[]>;
    getRecentTranscriptions(limit?: number): Promise<CallTranscription[]>;
}
