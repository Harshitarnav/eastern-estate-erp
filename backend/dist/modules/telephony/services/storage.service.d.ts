import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    url: string;
    key: string;
    bucket: string;
    size: number;
}
export interface DownloadResult {
    buffer: Buffer;
    contentType: string;
    size: number;
}
export declare class StorageService {
    private configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly region;
    private readonly storageType;
    private readonly localStoragePath;
    constructor(configService: ConfigService);
    uploadRecording(callSid: string, recordingBuffer: Buffer, contentType?: string): Promise<UploadResult>;
    private uploadToS3;
    private uploadToLocal;
    downloadRecording(key: string): Promise<DownloadResult>;
    private downloadFromS3;
    private downloadFromLocal;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteRecording(key: string): Promise<void>;
    private deleteFromS3;
    private deleteFromLocal;
    private generateS3Key;
    private generateLocalKey;
    private getContentType;
    healthCheck(): Promise<boolean>;
    getStatistics(): Promise<any>;
    private getLocalStatistics;
}
