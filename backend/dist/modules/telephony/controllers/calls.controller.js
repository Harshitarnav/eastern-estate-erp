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
var CallsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const call_service_1 = require("../services/call.service");
const transcription_service_1 = require("../services/transcription.service");
const ai_analysis_service_1 = require("../services/ai-analysis.service");
const storage_service_1 = require("../services/storage.service");
const incoming_call_dto_1 = require("../dto/incoming-call.dto");
let CallsController = CallsController_1 = class CallsController {
    constructor(callService, transcriptionService, aiAnalysisService, storageService) {
        this.callService = callService;
        this.transcriptionService = transcriptionService;
        this.aiAnalysisService = aiAnalysisService;
        this.storageService = storageService;
        this.logger = new common_1.Logger(CallsController_1.name);
    }
    async getCalls(query) {
        try {
            const filters = {
                propertyId: query.propertyId ? Number(query.propertyId) : undefined,
                agentId: query.agentId ? Number(query.agentId) : undefined,
                status: query.status,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
                limit: query.limit ? Number(query.limit) : 50,
                offset: query.offset ? Number(query.offset) : 0,
            };
            const result = await this.callService.getCalls(filters);
            return {
                success: true,
                data: result.calls,
                meta: {
                    total: result.total,
                    limit: filters.limit,
                    offset: filters.offset,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error fetching calls: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch calls', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCall(callSid) {
        try {
            const call = await this.callService.getCall(callSid);
            if (!call) {
                throw new common_1.HttpException('Call not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: call,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching call: ${error.message}`);
            throw error;
        }
    }
    async getTranscription(callSid) {
        try {
            const transcription = await this.transcriptionService.getTranscription(callSid);
            if (!transcription) {
                throw new common_1.HttpException('Transcription not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: transcription,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching transcription: ${error.message}`);
            throw error;
        }
    }
    async getInsights(callSid) {
        try {
            const insights = await this.aiAnalysisService.getInsights(callSid);
            if (!insights) {
                throw new common_1.HttpException('Insights not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: insights,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching insights: ${error.message}`);
            throw error;
        }
    }
    async getRecording(callSid) {
        try {
            const call = await this.callService.getCall(callSid);
            if (!call || !call.storageKey) {
                throw new common_1.HttpException('Recording not found', common_1.HttpStatus.NOT_FOUND);
            }
            const url = await this.storageService.getSignedUrl(call.storageKey, 3600);
            return {
                success: true,
                data: {
                    url,
                    expiresIn: 3600,
                    callSid,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error fetching recording: ${error.message}`);
            throw error;
        }
    }
    async makeCall(makeCallDto) {
        try {
            const result = await this.callService.makeOutboundCall(makeCallDto);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Error making call: ${error.message}`);
            throw new common_1.HttpException('Failed to make call', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async reprocessCall(callSid) {
        try {
            await this.callService.reprocessCall(callSid);
            return {
                success: true,
                message: 'Call reprocessing initiated',
            };
        }
        catch (error) {
            this.logger.error(`Error reprocessing call: ${error.message}`);
            throw new common_1.HttpException('Failed to reprocess call', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStatistics(propertyId) {
        try {
            const stats = await this.callService.getStatistics(propertyId);
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching statistics: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch statistics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async searchTranscriptions(query, propertyId, limit) {
        try {
            const results = await this.transcriptionService.searchTranscriptions(query, propertyId, limit || 50);
            return {
                success: true,
                data: results,
            };
        }
        catch (error) {
            this.logger.error(`Error searching transcriptions: ${error.message}`);
            throw new common_1.HttpException('Failed to search transcriptions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getHotLeads(propertyId, limit) {
        try {
            const hotLeads = await this.aiAnalysisService.getHotLeads(propertyId, limit || 50);
            return {
                success: true,
                data: hotLeads,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching hot leads: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch hot leads', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incoming_call_dto_1.CallQueryDto]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getCalls", null);
__decorate([
    (0, common_1.Get)(':callSid'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getCall", null);
__decorate([
    (0, common_1.Get)(':callSid/transcription'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getTranscription", null);
__decorate([
    (0, common_1.Get)(':callSid/insights'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getInsights", null);
__decorate([
    (0, common_1.Get)(':callSid/recording'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getRecording", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [incoming_call_dto_1.MakeCallDto]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "makeCall", null);
__decorate([
    (0, common_1.Post)(':callSid/reprocess'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "reprocessCall", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('search/transcriptions'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('propertyId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "searchTranscriptions", null);
__decorate([
    (0, common_1.Get)('insights/hot-leads'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getHotLeads", null);
exports.CallsController = CallsController = CallsController_1 = __decorate([
    (0, common_1.Controller)('api/telephony/calls'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [call_service_1.CallService,
        transcription_service_1.TranscriptionService,
        ai_analysis_service_1.AIAnalysisService,
        storage_service_1.StorageService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map