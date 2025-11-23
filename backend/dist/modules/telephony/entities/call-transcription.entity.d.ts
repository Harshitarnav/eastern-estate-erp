import { CallLog } from './call-log.entity';
import { CallRecording } from './call-recording.entity';
import { AiInsight } from './ai-insight.entity';
export declare class CallTranscription {
    id: string;
    callLogId: string;
    callLog: CallLog;
    recordingId: string;
    recording: CallRecording;
    fullText: string;
    segments: any[];
    language: string;
    confidenceScore: number;
    speakersDetected: number;
    agentSegments: any;
    customerSegments: any;
    provider: string;
    modelUsed: string;
    processingStatus: string;
    processingTime: number;
    cost: number;
    errorMessage: string;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
    aiInsight: AiInsight;
}
