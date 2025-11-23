import { CallLog } from './call-log.entity';
import { CallTranscription } from './call-transcription.entity';
export declare class CallRecording {
    id: string;
    callLogId: string;
    callLog: CallLog;
    recordingUrl: string;
    recordingSid: string;
    duration: number;
    fileSize: number;
    format: string;
    storageProvider: string;
    s3Bucket: string;
    s3Key: string;
    localPath: string;
    isDownloaded: boolean;
    isProcessed: boolean;
    isTranscribed: boolean;
    recordedAt: Date;
    downloadedAt: Date;
    processedAt: Date;
    createdAt: Date;
    transcription: CallTranscription;
}
