export declare class IncomingCallDto {
    CallSid: string;
    From: string;
    To: string;
    CallStatus?: string;
    Direction?: string;
    propertyId?: number;
}
export declare class CallStatusDto {
    CallSid: string;
    CallStatus: string;
    CallDuration?: string;
    RecordingUrl?: string;
    RecordingSid?: string;
    StartTime?: string;
    EndTime?: string;
}
export declare class RecordingStatusDto {
    CallSid: string;
    RecordingUrl: string;
    RecordingSid: string;
    RecordingDuration?: string;
    RecordingStatus?: string;
}
export declare class MakeCallDto {
    propertyId: number;
    agentPhone: string;
    customerPhone: string;
    callerId?: string;
}
export declare class CallQueryDto {
    propertyId?: number;
    agentId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}
