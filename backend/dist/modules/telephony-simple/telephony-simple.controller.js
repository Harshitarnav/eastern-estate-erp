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
var TelephonySimpleController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonySimpleController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const call_log_entity_1 = require("../telephony/entities/call-log.entity");
const call_transcription_entity_1 = require("../telephony/entities/call-transcription.entity");
const ai_insight_entity_1 = require("../telephony/entities/ai-insight.entity");
const agent_availability_entity_1 = require("../telephony/entities/agent-availability.entity");
let TelephonySimpleController = TelephonySimpleController_1 = class TelephonySimpleController {
    constructor(callLogRepo, transcriptionRepo, aiInsightRepo, agentAvailabilityRepo) {
        this.callLogRepo = callLogRepo;
        this.transcriptionRepo = transcriptionRepo;
        this.aiInsightRepo = aiInsightRepo;
        this.agentAvailabilityRepo = agentAvailabilityRepo;
        this.logger = new common_1.Logger(TelephonySimpleController_1.name);
    }
    async getCalls(propertyId, status, limit, offset) {
        try {
            const queryBuilder = this.callLogRepo
                .createQueryBuilder('call')
                .orderBy('call.queuedAt', 'DESC');
            if (propertyId) {
                queryBuilder.andWhere('call.propertyId = :propertyId', { propertyId });
            }
            if (status) {
                queryBuilder.andWhere('call.status = :status', { status });
            }
            const limitNum = limit ? parseInt(limit) : 50;
            const offsetNum = offset ? parseInt(offset) : 0;
            const [calls, total] = await queryBuilder
                .skip(offsetNum)
                .take(limitNum)
                .getManyAndCount();
            return {
                success: true,
                data: calls,
                meta: {
                    total,
                    limit: limitNum,
                    offset: offsetNum,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error fetching calls: ${error.message}`);
            return {
                success: false,
                data: [],
                meta: { total: 0, limit: 50, offset: 0 },
            };
        }
    }
    async getCall(callSid) {
        try {
            const call = await this.callLogRepo.findOne({
                where: { callSid },
            });
            if (!call) {
                return {
                    success: false,
                    message: 'Call not found',
                };
            }
            return {
                success: true,
                data: call,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching call: ${error.message}`);
            return {
                success: false,
                message: 'Failed to fetch call',
            };
        }
    }
    async getTranscription(callSid) {
        try {
            const call = await this.callLogRepo.findOne({
                where: { callSid },
                relations: ['transcription'],
            });
            if (!call || !call.transcription) {
                return {
                    success: false,
                    message: 'Transcription not found',
                };
            }
            return {
                success: true,
                data: call.transcription,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching transcription: ${error.message}`);
            return {
                success: false,
                message: 'Failed to fetch transcription',
            };
        }
    }
    async getInsights(callSid) {
        try {
            const call = await this.callLogRepo.findOne({
                where: { callSid },
                relations: ['aiInsight'],
            });
            if (!call || !call.aiInsight) {
                return {
                    success: false,
                    message: 'Insights not found',
                };
            }
            return {
                success: true,
                data: call.aiInsight,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching insights: ${error.message}`);
            return {
                success: false,
                message: 'Failed to fetch insights',
            };
        }
    }
    async getRecording(callSid) {
        try {
            const call = await this.callLogRepo.findOne({
                where: { callSid },
            });
            if (!call || !call.recordingUrl) {
                return {
                    success: false,
                    message: 'Recording not found',
                };
            }
            return {
                success: true,
                data: {
                    url: call.recordingUrl,
                    expiresIn: 3600,
                    callSid,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error fetching recording: ${error.message}`);
            return {
                success: false,
                message: 'Failed to fetch recording',
            };
        }
    }
    async getStatistics(propertyId) {
        try {
            this.logger.log('Fetching call statistics...');
            let baseQuery = this.callLogRepo.createQueryBuilder('call');
            if (propertyId) {
                baseQuery = baseQuery.where('call.propertyId = :propertyId', { propertyId });
            }
            const totalCalls = await baseQuery.getCount();
            this.logger.log(`Total calls found: ${totalCalls}`);
            let completedQuery = this.callLogRepo.createQueryBuilder('call');
            if (propertyId) {
                completedQuery = completedQuery.where('call.propertyId = :propertyId', { propertyId });
            }
            const completedCalls = await completedQuery
                .andWhere('call.status = :status', { status: 'COMPLETED' })
                .getCount();
            let missedQuery = this.callLogRepo.createQueryBuilder('call');
            if (propertyId) {
                missedQuery = missedQuery.where('call.propertyId = :propertyId', { propertyId });
            }
            const missedCalls = await missedQuery
                .andWhere('call.status = :status', { status: 'NO_ANSWER' })
                .getCount();
            let failedQuery = this.callLogRepo.createQueryBuilder('call');
            if (propertyId) {
                failedQuery = failedQuery.where('call.propertyId = :propertyId', { propertyId });
            }
            const failedCalls = await failedQuery
                .andWhere('call.status = :status', { status: 'FAILED' })
                .getCount();
            let avgQuery = this.callLogRepo.createQueryBuilder('call');
            if (propertyId) {
                avgQuery = avgQuery.where('call.propertyId = :propertyId', { propertyId });
            }
            const avgDuration = await avgQuery
                .select('AVG(call.duration)', 'avg')
                .getRawOne();
            const stats = {
                totalCalls,
                completedCalls,
                missedCalls,
                failedCalls,
                avgDuration: parseInt(avgDuration?.avg || '0'),
                totalDuration: 0,
            };
            this.logger.log(`Stats: ${JSON.stringify(stats)}`);
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching statistics: ${error.message}`, error.stack);
            return {
                success: true,
                data: {
                    totalCalls: 0,
                    completedCalls: 0,
                    missedCalls: 0,
                    failedCalls: 0,
                    avgDuration: 0,
                    totalDuration: 0,
                },
            };
        }
    }
    async getHotLeads(propertyId, limit) {
        try {
            this.logger.log('Fetching hot leads...');
            const queryBuilder = this.aiInsightRepo
                .createQueryBuilder('ai')
                .where('ai.hot_lead = true')
                .orderBy('ai.lead_quality_score', 'DESC')
                .addOrderBy('ai.conversion_probability', 'DESC');
            if (propertyId) {
                queryBuilder
                    .innerJoin('ai.callLog', 'call')
                    .andWhere('call.property_id = :propertyId', { propertyId });
            }
            const limitNum = limit ? parseInt(limit) : 50;
            const hotLeads = await queryBuilder.take(limitNum).getMany();
            this.logger.log(`Found ${hotLeads.length} hot leads`);
            return {
                success: true,
                data: hotLeads,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching hot leads: ${error.message}`, error.stack);
            return {
                success: true,
                data: [],
            };
        }
    }
};
exports.TelephonySimpleController = TelephonySimpleController;
__decorate([
    (0, common_1.Get)('calls'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getCalls", null);
__decorate([
    (0, common_1.Get)('calls/:callSid'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getCall", null);
__decorate([
    (0, common_1.Get)('calls/:callSid/transcription'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getTranscription", null);
__decorate([
    (0, common_1.Get)('calls/:callSid/insights'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getInsights", null);
__decorate([
    (0, common_1.Get)('calls/:callSid/recording'),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getRecording", null);
__decorate([
    (0, common_1.Get)('calls/stats/summary'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('calls/insights/hot-leads'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TelephonySimpleController.prototype, "getHotLeads", null);
exports.TelephonySimpleController = TelephonySimpleController = TelephonySimpleController_1 = __decorate([
    (0, common_1.Controller)('telephony'),
    __param(0, (0, typeorm_1.InjectRepository)(call_log_entity_1.CallLog)),
    __param(1, (0, typeorm_1.InjectRepository)(call_transcription_entity_1.CallTranscription)),
    __param(2, (0, typeorm_1.InjectRepository)(ai_insight_entity_1.AiInsight)),
    __param(3, (0, typeorm_1.InjectRepository)(agent_availability_entity_1.AgentAvailability)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TelephonySimpleController);
//# sourceMappingURL=telephony-simple.controller.js.map