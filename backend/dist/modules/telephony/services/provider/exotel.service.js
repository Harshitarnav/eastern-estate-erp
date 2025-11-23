"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExotelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExotelService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
let ExotelService = ExotelService_1 = class ExotelService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ExotelService_1.name);
        this.apiKey = this.configService.get('EXOTEL_API_KEY');
        this.apiToken = this.configService.get('EXOTEL_API_TOKEN');
        this.sid = this.configService.get('EXOTEL_SID');
        this.subdomain = this.configService.get('EXOTEL_SUBDOMAIN', 'api.exotel.com');
        this.virtualNumber = this.configService.get('EXOTEL_PHONE_NUMBER');
        this.webhookBaseUrl = this.configService.get('EXOTEL_WEBHOOK_BASE_URL');
        this.client = axios_1.default.create({
            baseURL: `https://${this.apiKey}:${this.apiToken}@${this.subdomain}/v1/Accounts/${this.sid}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        this.logger.log('Exotel Service initialized');
    }
    async makeCall(params) {
        try {
            this.logger.log(`Making call from ${params.from} to ${params.to}`);
            const formData = new URLSearchParams({
                From: params.from,
                To: params.to,
                CallerId: params.callerId || this.virtualNumber,
                TimeLimit: (params.timeLimit || 3600).toString(),
                TimeOut: (params.timeOut || 30).toString(),
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
        }
        catch (error) {
            this.logger.error(`Failed to make call: ${error.message}`, error.stack);
            throw new common_1.HttpException('Failed to initiate call', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCallDetails(callSid) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get call details: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch call details', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async endCall(callSid) {
        try {
            this.logger.log(`Ending call ${callSid}`);
            const formData = new URLSearchParams({
                Status: 'completed',
            });
            await this.client.post(`/Calls/${callSid}.json`, formData);
            this.logger.log(`Call ${callSid} ended successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to end call: ${error.message}`);
            throw new common_1.HttpException('Failed to end call', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRecording(recordingSid) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get recording: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch recording details', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadRecording(recordingUrl) {
        try {
            this.logger.log(`Downloading recording from ${recordingUrl}`);
            const response = await axios_1.default.get(recordingUrl, {
                auth: {
                    username: this.apiKey,
                    password: this.apiToken,
                },
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error(`Failed to download recording: ${error.message}`);
            throw new common_1.HttpException('Failed to download recording', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async maskNumber(params) {
        try {
            this.logger.log(`Masking number for ${params.customerNumber} → ${params.agentNumber}`);
            const expiryMinutes = params.expiryMinutes || 60;
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
        }
        catch (error) {
            this.logger.error(`Failed to mask number: ${error.message}`);
            throw new common_1.HttpException('Failed to mask number', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async playMessage(params) {
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
        }
        catch (error) {
            this.logger.error(`Failed to play message: ${error.message}`);
            throw new common_1.HttpException('Failed to play message', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async collectDtmf(params) {
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
            const response = await this.client.post(`/Calls/${params.callSid}/Gather.json`, formData);
            const digits = response.data.Gather?.Digits || '';
            this.logger.log(`Collected DTMF: ${digits}`);
            return digits;
        }
        catch (error) {
            this.logger.error(`Failed to collect DTMF: ${error.message}`);
            throw new common_1.HttpException('Failed to collect DTMF input', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCalls(params) {
        try {
            const queryParams = new URLSearchParams({
                Page: (params.page || 0).toString(),
                PageSize: (params.pageSize || 50).toString(),
            });
            if (params.status)
                queryParams.append('Status', params.status);
            if (params.startDate)
                queryParams.append('StartTime>', params.startDate.toISOString());
            if (params.endDate)
                queryParams.append('StartTime<', params.endDate.toISOString());
            const response = await this.client.get(`/Calls.json?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get calls: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch calls', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async healthCheck() {
        try {
            const response = await this.client.get('/');
            return response.status === 200;
        }
        catch (error) {
            this.logger.error(`Exotel health check failed: ${error.message}`);
            return false;
        }
    }
    generateIvrTwiML(options) {
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
};
exports.ExotelService = ExotelService;
exports.ExotelService = ExotelService = ExotelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ExotelService);
//# sourceMappingURL=exotel.service.js.map