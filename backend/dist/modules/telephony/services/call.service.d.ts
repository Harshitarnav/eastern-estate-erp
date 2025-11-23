import { Repository } from 'typeorm';
import { CallLog } from '../entities/call-log.entity';
import { ExotelService } from './provider/exotel.service';
import { RoundRobinService } from './round-robin.service';
import { TranscriptionService } from './transcription.service';
import { AIAnalysisService } from './ai-analysis.service';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
export interface IncomingCallRequest {
    from: string;
    to: string;
    callSid: string;
    propertyId: number;
    direction?: 'INBOUND' | 'OUTBOUND';
}
export interface CallProcessingResult {
    callSid: string;
    status: string;
    agentAssigned?: string;
    queuePosition?: number;
}
export declare class CallService {
    private callLogRepo;
    private exotelService;
    private roundRobinService;
    private transcriptionService;
    private aiAnalysisService;
    private storageService;
    private configService;
    private readonly logger;
    constructor(callLogRepo: Repository<CallLog>, exotelService: ExotelService, roundRobinService: RoundRobinService, transcriptionService: TranscriptionService, aiAnalysisService: AIAnalysisService, storageService: StorageService, configService: ConfigService);
    handleIncomingCall(request: IncomingCallRequest): Promise<CallProcessingResult>;
    handleCallComplete(callSid: string): Promise<void>;
    private processCallAsync;
    private createCallLog;
    private createLeadFromAnalysis;
    getCall(callSid: string): Promise<CallLog | null>;
    getCalls(filters: {
        propertyId?: number;
        agentId?: number;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        calls: CallLog[];
        total: number;
    }>;
    getStatistics(propertyId?: number): Promise<any>;
    reprocessCall(callSid: string): Promise<void>;
    makeOutboundCall(params: {
        propertyId: number;
        agentPhone: string;
        customerPhone: string;
        callerId?: string;
    }): Promise<CallProcessingResult>;
}
