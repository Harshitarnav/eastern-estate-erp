export interface TelephonyProvider {
  // Call management
  makeCall(params: MakeCallParams): Promise<CallResponse>;
  getCallDetails(callSid: string): Promise<CallDetails>;
  endCall(callSid: string): Promise<void>;
  
  // Recording management
  getRecording(recordingSid: string): Promise<RecordingDetails>;
  downloadRecording(recordingUrl: string): Promise<Buffer>;
  
  // Number masking
  maskNumber(params: MaskNumberParams): Promise<MaskedNumberResponse>;
  
  // IVR
  playMessage(params: PlayMessageParams): Promise<void>;
  collectDtmf(params: CollectDtmfParams): Promise<string>;
}

export interface MakeCallParams {
  from: string;
  to: string;
  callerId?: string;
  timeLimit?: number;
  timeOut?: number;
  statusCallback?: string;
  recordingCallback?: string;
}

export interface CallResponse {
  callSid: string;
  status: string;
  direction: string;
  from: string;
  to: string;
  dateCreated: Date;
}

export interface CallDetails {
  callSid: string;
  status: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  recordingUrl?: string;
  recordingSid?: string;
}

export interface RecordingDetails {
  recordingSid: string;
  callSid: string;
  duration: number;
  url: string;
  size: number;
}

export interface MaskNumberParams {
  virtualNumber: string;
  customerNumber: string;
  agentNumber: string;
  expiryMinutes?: number;
}

export interface MaskedNumberResponse {
  virtualNumber: string;
  expiresAt: Date;
}

export interface PlayMessageParams {
  callSid: string;
  message: string;
  voice?: 'male' | 'female';
  language?: string;
}

export interface CollectDtmfParams {
  callSid: string;
  prompt?: string;
  timeout?: number;
  finishOnKey?: string;
  numDigits?: number;
}


