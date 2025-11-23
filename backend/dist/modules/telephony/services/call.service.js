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
var CallService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const call_log_entity_1 = require("../entities/call-log.entity");
const exotel_service_1 = require("./provider/exotel.service");
const round_robin_service_1 = require("./round-robin.service");
const transcription_service_1 = require("./transcription.service");
const ai_analysis_service_1 = require("./ai-analysis.service");
const storage_service_1 = require("./storage.service");
const config_1 = require("@nestjs/config");
let CallService = CallService_1 = class CallService {
    constructor(callLogRepo, exotelService, roundRobinService, transcriptionService, aiAnalysisService, storageService, configService) {
        this.callLogRepo = callLogRepo;
        this.exotelService = exotelService;
        this.roundRobinService = roundRobinService;
        this.transcriptionService = transcriptionService;
        this.aiAnalysisService = aiAnalysisService;
        this.storageService = storageService;
        this.configService = configService;
        this.logger = new common_1.Logger(CallService_1.name);
    }
    async handleIncomingCall(request) {
        try {
            this.logger.log(`Incoming call from ${request.from} to ${request.to}`);
            const callLog = await this.createCallLog(request);
            const agent = await this.roundRobinService.getNextAvailableAgent({
                propertyId: request.propertyId,
                customerPhone: request.from,
            });
            if (agent) {
                this.logger.log(`Routing call ${request.callSid} to agent ${agent.employeeName}`);
                callLog.agentId = agent.employeeId;
                callLog.status = 'IN_PROGRESS';
                await this.callLogRepo.save(callLog);
                await this.roundRobinService.updateAgentLoad(agent.employeeId, true);
                return {
                    callSid: request.callSid,
                    status: 'CONNECTED',
                    agentAssigned: agent.employeeName,
                };
            }
            else {
                this.logger.log(`No agents available, adding call ${request.callSid} to queue`);
                const queueEntry = await this.roundRobinService.addToQueue({
                    propertyId: request.propertyId,
                    customerPhone: request.from,
                });
                callLog.status = 'QUEUED';
                await this.callLogRepo.save(callLog);
                return {
                    callSid: request.callSid,
                    status: 'QUEUED',
                    queuePosition: 1,
                };
            }
        }
        catch (error) {
            this.logger.error(`Error handling incoming call: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleCallComplete(callSid) {
        try {
            this.logger.log(`Processing completed call ${callSid}`);
            const callLog = await this.callLogRepo.findOne({ where: { callSid } });
            if (!callLog) {
                throw new Error(`Call ${callSid} not found`);
            }
            callLog.status = 'COMPLETED';
            callLog.endTime = new Date();
            const callDetails = await this.exotelService.getCallDetails(callSid);
            callLog.duration = callDetails.duration;
            callLog.recordingUrl = callDetails.recordingUrl;
            callLog.recordingSid = callDetails.recordingSid;
            await this.callLogRepo.save(callLog);
            if (callLog.agentId) {
                await this.roundRobinService.updateAgentLoad(callLog.agentId, false);
            }
            this.processCallAsync(callSid);
        }
        catch (error) {
            this.logger.error(`Error handling call complete: ${error.message}`, error.stack);
        }
    }
    async processCallAsync(callSid) {
        try {
            this.logger.log(`Starting async processing for call ${callSid}`);
            const callLog = await this.callLogRepo.findOne({ where: { callSid } });
            const minDuration = this.configService.get('MIN_CALL_DURATION_FOR_TRANSCRIPTION', 30);
            if (callLog.duration < minDuration) {
                this.logger.log(`Call ${callSid} too short (${callLog.duration}s), skipping processing`);
                return;
            }
            if (!callLog.recordingUrl) {
                this.logger.warn(`No recording URL for call ${callSid}`);
                return;
            }
            this.logger.log(`Downloading recording from ${callLog.recordingUrl}`);
            const recordingBuffer = await this.exotelService.downloadRecording(callLog.recordingUrl);
            this.logger.log(`Uploading recording to storage`);
            const uploadResult = await this.storageService.uploadRecording(callSid, recordingBuffer, 'audio/mpeg');
            callLog.storageUrl = uploadResult.url;
            callLog.storageKey = uploadResult.key;
            await this.callLogRepo.save(callLog);
            if (this.configService.get('AUTO_TRANSCRIBE_CALLS', true)) {
                this.logger.log(`Transcribing call ${callSid}`);
                const transcription = await this.transcriptionService.transcribeCall(callSid, recordingBuffer, 'mp3');
                if (this.configService.get('AUTO_ANALYZE_CALLS', true)) {
                    this.logger.log(`Analyzing call ${callSid} with AI`);
                    const analysis = await this.aiAnalysisService.analyzeCall(callSid);
                    if (analysis.hotLead &&
                        this.configService.get('AUTO_CREATE_LEADS', true)) {
                        this.logger.log(`Hot lead detected! Creating lead for ${analysis.leadInfo.customerName}`);
                        await this.createLeadFromAnalysis(callSid, analysis);
                    }
                }
            }
            this.logger.log(`Async processing completed for call ${callSid}`);
        }
        catch (error) {
            this.logger.error(`Error in async call processing for ${callSid}: ${error.message}`, error.stack);
        }
    }
    async createCallLog(request) {
        const callLog = this.callLogRepo.create({
            callSid: request.callSid,
            propertyId: request.propertyId,
            customerPhone: request.from,
            virtualNumber: request.to,
            direction: request.direction || 'INBOUND',
            status: 'INITIATED',
            startTime: new Date(),
        });
        return await this.callLogRepo.save(callLog);
    }
    async createLeadFromAnalysis(callSid, analysis) {
        try {
            this.logger.log(`Would create lead with data:`, {
                name: analysis.leadInfo.customerName,
                phone: analysis.leadInfo.customerPhone,
                email: analysis.leadInfo.customerEmail,
                budget: `₹${analysis.leadInfo.budgetMin} - ₹${analysis.leadInfo.budgetMax}`,
                location: analysis.leadInfo.preferredLocation,
                bhk: analysis.leadInfo.bhkRequirement,
                source: 'TELEPHONY',
                callSid: callSid,
                leadScore: analysis.leadQualityScore,
            });
        }
        catch (error) {
            this.logger.error(`Error creating lead: ${error.message}`);
        }
    }
    async getCall(callSid) {
        return await this.callLogRepo.findOne({
            where: { callSid },
            relations: ['transcription', 'aiInsight'],
        });
    }
    async getCalls(filters) {
        try {
            const queryBuilder = this.callLogRepo.createQueryBuilder('call');
            if (filters.propertyId) {
                queryBuilder.andWhere('call.property_id = :propertyId', {
                    propertyId: filters.propertyId,
                });
            }
            if (filters.agentId) {
                queryBuilder.andWhere('call.agent_id = :agentId', {
                    agentId: filters.agentId,
                });
            }
            if (filters.status) {
                queryBuilder.andWhere('call.status = :status', {
                    status: filters.status,
                });
            }
            if (filters.startDate) {
                queryBuilder.andWhere('call.start_time >= :startDate', {
                    startDate: filters.startDate,
                });
            }
            if (filters.endDate) {
                queryBuilder.andWhere('call.start_time <= :endDate', {
                    endDate: filters.endDate,
                });
            }
            queryBuilder.orderBy('call.start_time', 'DESC');
            const total = await queryBuilder.getCount();
            queryBuilder
                .skip(filters.offset || 0)
                .take(filters.limit || 50);
            const calls = await queryBuilder.getMany();
            return { calls, total };
        }
        catch (error) {
            this.logger.error(`Error fetching calls: ${error.message}`);
            return { calls: [], total: 0 };
        }
    }
    async getStatistics(propertyId) {
        try {
            let query = this.callLogRepo.createQueryBuilder('call');
            if (propertyId) {
                query = query.where('call.property_id = :propertyId', { propertyId });
            }
            const stats = await query
                .select([
                'COUNT(*) as total_calls',
                'COUNT(*) FILTER (WHERE status = \'COMPLETED\') as completed_calls',
                'COUNT(*) FILTER (WHERE status = \'MISSED\') as missed_calls',
                'COUNT(*) FILTER (WHERE status = \'FAILED\') as failed_calls',
                'AVG(duration)::int as avg_duration',
                'SUM(duration)::int as total_duration',
            ])
                .getRawOne();
            return {
                totalCalls: parseInt(stats.total_calls) || 0,
                completedCalls: parseInt(stats.completed_calls) || 0,
                missedCalls: parseInt(stats.missed_calls) || 0,
                failedCalls: parseInt(stats.failed_calls) || 0,
                avgDuration: parseInt(stats.avg_duration) || 0,
                totalDuration: parseInt(stats.total_duration) || 0,
            };
        }
        catch (error) {
            this.logger.error(`Error getting statistics: ${error.message}`);
            return null;
        }
    }
    async reprocessCall(callSid) {
        await this.processCallAsync(callSid);
    }
    async makeOutboundCall(params) {
        try {
            this.logger.log(`Making outbound call from ${params.agentPhone} to ${params.customerPhone}`);
            const callResponse = await this.exotelService.makeCall({
                from: params.agentPhone,
                to: params.customerPhone,
                callerId: params.callerId,
            });
            const callLog = await this.createCallLog({
                callSid: callResponse.callSid,
                from: params.agentPhone,
                to: params.customerPhone,
                propertyId: params.propertyId,
                direction: 'OUTBOUND',
            });
            return {
                callSid: callResponse.callSid,
                status: callResponse.status,
            };
        }
        catch (error) {
            this.logger.error(`Error making outbound call: ${error.message}`);
            throw error;
        }
    }
};
exports.CallService = CallService;
exports.CallService = CallService = CallService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(call_log_entity_1.CallLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        exotel_service_1.ExotelService,
        round_robin_service_1.RoundRobinService,
        transcription_service_1.TranscriptionService,
        ai_analysis_service_1.AIAnalysisService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], CallService);
//# sourceMappingURL=call.service.js.map