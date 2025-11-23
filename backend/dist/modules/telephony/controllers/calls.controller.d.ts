import { CallService } from '../services/call.service';
import { TranscriptionService } from '../services/transcription.service';
import { AIAnalysisService } from '../services/ai-analysis.service';
import { StorageService } from '../services/storage.service';
import { MakeCallDto, CallQueryDto } from '../dto/incoming-call.dto';
export declare class CallsController {
    private callService;
    private transcriptionService;
    private aiAnalysisService;
    private storageService;
    private readonly logger;
    constructor(callService: CallService, transcriptionService: TranscriptionService, aiAnalysisService: AIAnalysisService, storageService: StorageService);
    getCalls(query: CallQueryDto): Promise<{
        success: boolean;
        data: import("../entities/call-log.entity").CallLog[];
        meta: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    getCall(callSid: string): Promise<{
        success: boolean;
        data: import("../entities/call-log.entity").CallLog;
    }>;
    getTranscription(callSid: string): Promise<{
        success: boolean;
        data: import("../entities/call-transcription.entity").CallTranscription;
    }>;
    getInsights(callSid: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getRecording(callSid: string): Promise<{
        success: boolean;
        data: {
            url: string;
            expiresIn: number;
            callSid: string;
        };
    }>;
    makeCall(makeCallDto: MakeCallDto): Promise<{
        success: boolean;
        data: import("../services/call.service").CallProcessingResult;
    }>;
    reprocessCall(callSid: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getStatistics(propertyId?: number): Promise<{
        success: boolean;
        data: any;
    }>;
    searchTranscriptions(query: string, propertyId?: number, limit?: number): Promise<{
        success: boolean;
        data: import("../entities/call-transcription.entity").CallTranscription[];
    }>;
    getHotLeads(propertyId?: number, limit?: number): Promise<{
        success: boolean;
        data: AIInsight[];
    }>;
}
