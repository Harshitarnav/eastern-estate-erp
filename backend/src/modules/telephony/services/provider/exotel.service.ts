import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  TelephonyProvider,
  MakeCallParams,
  CallResponse,
  CallDetails,
  RecordingDetails,
  MaskNumberParams,
  MaskedNumberResponse,
  PlayMessageParams,
  CollectDtmfParams,
} from './telephony-provider.interface';

/**
 * Exotel Service - Complete integration with Exotel API
 * Handles calls, recordings, number masking, and IVR
 */
@Injectable()
export class ExotelService implements TelephonyProvider {
  private readonly logger = new Logger(ExotelService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiToken: string;
  private readonly sid: string;
  private readonly subdomain: string;
  private readonly virtualNumber: string;
  private readonly webhookBaseUrl: string;

  constructor(private configService: ConfigService) {
    // Load Exotel configuration from environment
    this.apiKey = this.configService.get<string>('EXOTEL_API_KEY');
    this.apiToken = this.configService.get<string>('EXOTEL_API_TOKEN');
    this.sid = this.configService.get<string>('EXOTEL_SID');
    this.subdomain = this.configService.get<string>('EXOTEL_SUBDOMAIN', 'api.exotel.com');
    this.virtualNumber = this.configService.get<string>('EXOTEL_PHONE_NUMBER');
    this.webhookBaseUrl = this.configService.get<string>('EXOTEL_WEBHOOK_BASE_URL');

    // Create Axios client with authentication
    this.client = axios.create({
      baseURL: `https://${this.apiKey}:${this.apiToken}@${this.subdomain}/v1/Accounts/${this.sid}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.logger.log('Exotel Service initialized');
  }

  /**
   * Make an outbound call
   */
  async makeCall(params: MakeCallParams): Promise<CallResponse> {
    try {
      this.logger.log(`Making call from ${params.from} to ${params.to}`);

      const formData = new URLSearchParams({
        From: params.from,
        To: params.to,
        CallerId: params.callerId || this.virtualNumber,
        TimeLimit: (params.timeLimit || 3600).toString(), // Default 1 hour
        TimeOut: (params.timeOut || 30).toString(), // Default 30 seconds
        Record: 'true',
        StatusCallback: params.statusCallback || `${this.webhookBaseUrl}/api/telephony/webhook/call-status`,
        RecordingStatusCallback: params.recordingCallback || `${this.webhookBaseUrl}/api/telephony/webhook/recording-status`,
      });

      const response = await this.client.post('/Calls/connect.json', formData);
      
      const call = response.data.Call;
      
      return {
        callSid: call.Sid,
        status: call.Status,
        direction: call.Direction,
        from: call.From,
        to: call.To,
        dateCreated: new Date(call.DateCreated),
      };
    } catch (error) {
      this.logger.error(`Failed to make call: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to initiate call',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get call details by SID
   */
  async getCallDetails(callSid: string): Promise<CallDetails> {
    try {
      this.logger.log(`Fetching call details for ${callSid}`);

      const response = await this.client.get(`/Calls/${callSid}.json`);
      const call = response.data.Call;

      return {
        callSid: call.Sid,
        status: call.Status,
        duration: parseInt(call.Duration) || 0,
        startTime: new Date(call.StartTime),
        endTime: new Date(call.EndTime),
        recordingUrl: call.RecordingUrl,
        recordingSid: call.RecordingSid,
      };
    } catch (error) {
      this.logger.error(`Failed to get call details: ${error.message}`);
      throw new HttpException(
        'Failed to fetch call details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<void> {
    try {
      this.logger.log(`Ending call ${callSid}`);

      const formData = new URLSearchParams({
        Status: 'completed',
      });

      await this.client.post(`/Calls/${callSid}.json`, formData);
      this.logger.log(`Call ${callSid} ended successfully`);
    } catch (error) {
      this.logger.error(`Failed to end call: ${error.message}`);
      throw new HttpException(
        'Failed to end call',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get recording details
   */
  async getRecording(recordingSid: string): Promise<RecordingDetails> {
    try {
      this.logger.log(`Fetching recording ${recordingSid}`);

      const response = await this.client.get(`/Recordings/${recordingSid}.json`);
      const recording = response.data.Recording;

      return {
        recordingSid: recording.Sid,
        callSid: recording.CallSid,
        duration: parseInt(recording.Duration),
        url: recording.RecordingUrl,
        size: recording.Size || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get recording: ${error.message}`);
      throw new HttpException(
        'Failed to fetch recording details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Download recording as Buffer
   */
  async downloadRecording(recordingUrl: string): Promise<Buffer> {
    try {
      this.logger.log(`Downloading recording from ${recordingUrl}`);

      const response = await axios.get(recordingUrl, {
        auth: {
          username: this.apiKey,
          password: this.apiToken,
        },
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to download recording: ${error.message}`);
      throw new HttpException(
        'Failed to download recording',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mask customer number (Connect number)
   * Creates a temporary mapping between customer and agent via virtual number
   */
  async maskNumber(params: MaskNumberParams): Promise<MaskedNumberResponse> {
    try {
      this.logger.log(`Masking number for ${params.customerNumber} → ${params.agentNumber}`);

      const expiryMinutes = params.expiryMinutes || 60; // Default 1 hour
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

      const formData = new URLSearchParams({
        VirtualNumber: params.virtualNumber,
        FirstNumber: params.customerNumber,
        SecondNumber: params.agentNumber,
        ExpiryMinutes: expiryMinutes.toString(),
      });

      await this.client.post('/Calls/connect.json', formData);

      this.logger.log(`Number masked successfully, expires at ${expiryDate.toISOString()}`);

      return {
        virtualNumber: params.virtualNumber,
        expiresAt: expiryDate,
      };
    } catch (error) {
      this.logger.error(`Failed to mask number: ${error.message}`);
      throw new HttpException(
        'Failed to mask number',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Play a message during call (Text-to-Speech)
   */
  async playMessage(params: PlayMessageParams): Promise<void> {
    try {
      this.logger.log(`Playing message on call ${params.callSid}`);

      const voice = params.voice || 'female';
      const language = params.language || 'en';

      const formData = new URLSearchParams({
        Url: `${this.webhookBaseUrl}/api/telephony/twiml/play-message`,
        Message: params.message,
        Voice: voice,
        Language: language,
      });

      await this.client.post(`/Calls/${params.callSid}/Play.json`, formData);
      this.logger.log('Message played successfully');
    } catch (error) {
      this.logger.error(`Failed to play message: ${error.message}`);
      throw new HttpException(
        'Failed to play message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Collect DTMF input from caller
   */
  async collectDtmf(params: CollectDtmfParams): Promise<string> {
    try {
      this.logger.log(`Collecting DTMF on call ${params.callSid}`);

      const formData = new URLSearchParams({
        Url: `${this.webhookBaseUrl}/api/telephony/twiml/collect-dtmf`,
        Timeout: (params.timeout || 10).toString(),
        FinishOnKey: params.finishOnKey || '#',
        NumDigits: (params.numDigits || 1).toString(),
      });

      if (params.prompt) {
        formData.append('Prompt', params.prompt);
      }

      const response = await this.client.post(
        `/Calls/${params.callSid}/Gather.json`,
        formData,
      );

      const digits = response.data.Gather?.Digits || '';
      this.logger.log(`Collected DTMF: ${digits}`);

      return digits;
    } catch (error) {
      this.logger.error(`Failed to collect DTMF: ${error.message}`);
      throw new HttpException(
        'Failed to collect DTMF input',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all calls (with pagination)
   */
  async getCalls(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        Page: (params.page || 0).toString(),
        PageSize: (params.pageSize || 50).toString(),
      });

      if (params.status) queryParams.append('Status', params.status);
      if (params.startDate) queryParams.append('StartTime>', params.startDate.toISOString());
      if (params.endDate) queryParams.append('StartTime<', params.endDate.toISOString());

      const response = await this.client.get(`/Calls.json?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get calls: ${error.message}`);
      throw new HttpException(
        'Failed to fetch calls',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check to verify Exotel credentials
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Exotel health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate TwiML for IVR
   */
  generateIvrTwiML(options: {
    welcomeMessage: string;
    menuOptions: { digit: string; action: string; message: string }[];
  }): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>';
    twiml += '<Response>';
    twiml += `<Say voice="woman" language="en-IN">${options.welcomeMessage}</Say>`;
    twiml += '<Gather action="/api/telephony/webhook/ivr-response" method="POST" timeout="10" numDigits="1">';
    
    options.menuOptions.forEach((option) => {
      twiml += `<Say>Press ${option.digit} for ${option.message}</Say>`;
    });
    
    twiml += '</Gather>';
    twiml += '<Say>Sorry, we did not receive any input. Goodbye.</Say>';
    twiml += '</Response>';

    return twiml;
  }
}


