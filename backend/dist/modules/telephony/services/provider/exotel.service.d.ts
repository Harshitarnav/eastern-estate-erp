import { ConfigService } from '@nestjs/config';
import { TelephonyProvider, MakeCallParams, CallResponse, CallDetails, RecordingDetails, MaskNumberParams, MaskedNumberResponse, PlayMessageParams, CollectDtmfParams } from './telephony-provider.interface';
export declare class ExotelService implements TelephonyProvider {
    private configService;
    private readonly logger;
    private readonly client;
    private readonly apiKey;
    private readonly apiToken;
    private readonly sid;
    private readonly subdomain;
    private readonly virtualNumber;
    private readonly webhookBaseUrl;
    constructor(configService: ConfigService);
    makeCall(params: MakeCallParams): Promise<CallResponse>;
    getCallDetails(callSid: string): Promise<CallDetails>;
    endCall(callSid: string): Promise<void>;
    getRecording(recordingSid: string): Promise<RecordingDetails>;
    downloadRecording(recordingUrl: string): Promise<Buffer>;
    maskNumber(params: MaskNumberParams): Promise<MaskedNumberResponse>;
    playMessage(params: PlayMessageParams): Promise<void>;
    collectDtmf(params: CollectDtmfParams): Promise<string>;
    getCalls(params: {
        page?: number;
        pageSize?: number;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<any>;
    healthCheck(): Promise<boolean>;
    generateIvrTwiML(options: {
        welcomeMessage: string;
        menuOptions: {
            digit: string;
            action: string;
            message: string;
        }[];
    }): string;
}
