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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const call_service_1 = require("../services/call.service");
const incoming_call_dto_1 = require("../dto/incoming-call.dto");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(callService) {
        this.callService = callService;
        this.logger = new common_1.Logger(WebhookController_1.name);
    }
    async handleIncomingCall(callData, res) {
        try {
            this.logger.log(`Incoming call webhook: ${JSON.stringify(callData)}`);
            const propertyId = callData.propertyId || this.extractPropertyId(callData.To);
            const result = await this.callService.handleIncomingCall({
                callSid: callData.CallSid,
                from: callData.From,
                to: callData.To,
                propertyId,
                direction: 'INBOUND',
            });
            const twiml = this.generateTwiML(result);
            res.set('Content-Type', 'text/xml');
            res.status(common_1.HttpStatus.OK).send(twiml);
        }
        catch (error) {
            this.logger.error(`Error handling incoming call: ${error.message}`, error.stack);
            const errorTwiml = this.generateErrorTwiML();
            res.set('Content-Type', 'text/xml');
            res.status(common_1.HttpStatus.OK).send(errorTwiml);
        }
    }
    async handleCallStatus(statusData, res) {
        try {
            this.logger.log(`Call status webhook: ${JSON.stringify(statusData)}`);
            switch (statusData.CallStatus.toLowerCase()) {
                case 'completed':
                    await this.callService.handleCallComplete(statusData.CallSid);
                    break;
                case 'busy':
                case 'no-answer':
                case 'canceled':
                case 'failed':
                    this.logger.log(`Call ${statusData.CallSid} ${statusData.CallStatus}`);
                    break;
            }
            res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (error) {
            this.logger.error(`Error handling call status: ${error.message}`, error.stack);
            res.status(common_1.HttpStatus.OK).json({ success: false, error: error.message });
        }
    }
    async handleRecordingStatus(recordingData, res) {
        try {
            this.logger.log(`Recording status webhook: ${JSON.stringify(recordingData)}`);
            if (recordingData.RecordingStatus?.toLowerCase() === 'completed') {
                this.logger.log(`Recording completed for call ${recordingData.CallSid}`);
            }
            res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (error) {
            this.logger.error(`Error handling recording status: ${error.message}`, error.stack);
            res.status(common_1.HttpStatus.OK).json({ success: false, error: error.message });
        }
    }
    async handleIVRResponse(body, res) {
        try {
            this.logger.log(`IVR response: ${JSON.stringify(body)}`);
            const digits = body.Digits;
            let twiml = '';
            switch (digits) {
                case '1':
                    twiml = this.generateTwiML({ status: 'SALES', agentAssigned: 'Sales Team' });
                    break;
                case '2':
                    twiml = this.generateTwiML({ status: 'SUPPORT', agentAssigned: 'Support Team' });
                    break;
                case '3':
                    twiml = this.generateTwiML({ status: 'INFO', agentAssigned: 'Info Team' });
                    break;
                default:
                    twiml = this.generateErrorTwiML('Invalid option selected');
            }
            res.set('Content-Type', 'text/xml');
            res.status(common_1.HttpStatus.OK).send(twiml);
        }
        catch (error) {
            this.logger.error(`Error handling IVR response: ${error.message}`);
            const errorTwiml = this.generateErrorTwiML();
            res.set('Content-Type', 'text/xml');
            res.status(common_1.HttpStatus.OK).send(errorTwiml);
        }
    }
    generateTwiML(result) {
        let twiml = '<?xml version="1.0" encoding="UTF-8"?>';
        twiml += '<Response>';
        if (result.status === 'CONNECTED' && result.agentAssigned) {
            twiml += '<Say voice="woman" language="en-IN">Please hold while we connect you to our agent.</Say>';
        }
        else if (result.status === 'QUEUED') {
            twiml += '<Say voice="woman" language="en-IN">All our agents are currently busy. Please stay on the line.</Say>';
            twiml += '<Play>https://your-domain.com/hold-music.mp3</Play>';
        }
        else {
            twiml += '<Say voice="woman" language="en-IN">Thank you for calling Eastern Estate.</Say>';
        }
        twiml += '</Response>';
        return twiml;
    }
    generateErrorTwiML(message) {
        let twiml = '<?xml version="1.0" encoding="UTF-8"?>';
        twiml += '<Response>';
        twiml += `<Say voice="woman" language="en-IN">${message || 'We apologize, but we are unable to process your call at this time. Please try again later.'}</Say>`;
        twiml += '<Hangup/>';
        twiml += '</Response>';
        return twiml;
    }
    extractPropertyId(virtualNumber) {
        return 1;
    }
    healthCheck(res) {
        res.status(common_1.HttpStatus.OK).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('incoming-call'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incoming_call_dto_1.IncomingCallDto, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleIncomingCall", null);
__decorate([
    (0, common_1.Post)('call-status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incoming_call_dto_1.CallStatusDto, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleCallStatus", null);
__decorate([
    (0, common_1.Post)('recording-status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incoming_call_dto_1.RecordingStatusDto, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleRecordingStatus", null);
__decorate([
    (0, common_1.Post)('ivr-response'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleIVRResponse", null);
__decorate([
    (0, common_1.Post)('health'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], WebhookController.prototype, "healthCheck", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, common_1.Controller)('api/telephony/webhook'),
    __metadata("design:paramtypes", [call_service_1.CallService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map