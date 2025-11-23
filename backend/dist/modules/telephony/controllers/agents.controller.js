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
var AgentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const round_robin_service_1 = require("../services/round-robin.service");
const agent_dto_1 = require("../dto/agent.dto");
let AgentsController = AgentsController_1 = class AgentsController {
    constructor(roundRobinService) {
        this.roundRobinService = roundRobinService;
        this.logger = new common_1.Logger(AgentsController_1.name);
    }
    async getAgentStats(employeeId) {
        try {
            const stats = await this.roundRobinService.getAgentStats(Number(employeeId));
            if (!stats) {
                throw new common_1.HttpException('Agent not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching agent stats: ${error.message}`);
            throw error;
        }
    }
    async updateAvailability(dto) {
        try {
            await this.roundRobinService.setAgentAvailability(dto.employeeId, dto.isAvailable, dto.reason);
            return {
                success: true,
                message: 'Agent availability updated',
            };
        }
        catch (error) {
            this.logger.error(`Error updating availability: ${error.message}`);
            throw new common_1.HttpException('Failed to update availability', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQueueStats(propertyId) {
        try {
            const stats = await this.roundRobinService.getQueueStats(Number(propertyId));
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching queue stats: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch queue stats', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processQueue(propertyId) {
        try {
            await this.roundRobinService.processQueue(propertyId);
            return {
                success: true,
                message: 'Queue processing initiated',
            };
        }
        catch (error) {
            this.logger.error(`Error processing queue: ${error.message}`);
            throw new common_1.HttpException('Failed to process queue', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AgentsController = AgentsController;
__decorate([
    (0, common_1.Get)(':employeeId/stats'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAgentStats", null);
__decorate([
    (0, common_1.Put)('availability'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_dto_1.UpdateAgentAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Get)('queue/stats'),
    __param(0, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Post)('queue/process'),
    __param(0, (0, common_1.Body)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "processQueue", null);
exports.AgentsController = AgentsController = AgentsController_1 = __decorate([
    (0, common_1.Controller)('api/telephony/agents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [round_robin_service_1.RoundRobinService])
], AgentsController);
//# sourceMappingURL=agents.controller.js.map