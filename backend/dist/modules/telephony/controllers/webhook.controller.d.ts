import { Response } from 'express';
import { CallService } from '../services/call.service';
import { IncomingCallDto, CallStatusDto, RecordingStatusDto } from '../dto/incoming-call.dto';
export declare class WebhookController {
    private callService;
    private readonly logger;
    constructor(callService: CallService);
    handleIncomingCall(callData: IncomingCallDto, res: Response): Promise<any>;
    handleCallStatus(statusData: CallStatusDto, res: Response): Promise<any>;
    handleRecordingStatus(recordingData: RecordingStatusDto, res: Response): Promise<any>;
    handleIVRResponse(body: any, res: Response): Promise<any>;
    private generateTwiML;
    private generateErrorTwiML;
    private extractPropertyId;
    healthCheck(res: Response): any;
}
