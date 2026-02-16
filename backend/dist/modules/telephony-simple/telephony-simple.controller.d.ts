import { Repository } from 'typeorm';
import { CallLog } from '../telephony/entities/call-log.entity';
import { CallTranscription } from '../telephony/entities/call-transcription.entity';
import { AiInsight } from '../telephony/entities/ai-insight.entity';
import { AgentAvailability } from '../telephony/entities/agent-availability.entity';
export declare class TelephonySimpleController {
    private callLogRepo;
    private transcriptionRepo;
    private aiInsightRepo;
    private agentAvailabilityRepo;
    private readonly logger;
    constructor(callLogRepo: Repository<CallLog>, transcriptionRepo: Repository<CallTranscription>, aiInsightRepo: Repository<AiInsight>, agentAvailabilityRepo: Repository<AgentAvailability>);
    getCalls(propertyId?: string, status?: string, limit?: string, offset?: string): Promise<{
        success: boolean;
        data: CallLog[];
        meta: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    getCall(callSid: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: CallLog;
        message?: undefined;
    }>;
    getTranscription(callSid: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
    }>;
    getInsights(callSid: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
    }>;
    getRecording(callSid: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            url: any;
            expiresIn: number;
            callSid: string;
        };
        message?: undefined;
    }>;
    getStatistics(propertyId?: string): Promise<{
        success: boolean;
        data: {
            totalCalls: number;
            completedCalls: number;
            missedCalls: number;
            failedCalls: number;
            avgDuration: number;
            totalDuration: number;
        };
    }>;
    getHotLeads(propertyId?: string, limit?: string): Promise<{
        success: boolean;
        data: AiInsight[];
    }>;
}
