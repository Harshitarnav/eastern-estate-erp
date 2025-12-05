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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("./leads.service");
const priority_service_1 = require("./priority.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let LeadsController = class LeadsController {
    constructor(leadsService, priorityService) {
        this.leadsService = leadsService;
        this.priorityService = priorityService;
    }
    async create(createLeadDto) {
        return this.leadsService.create(createLeadDto);
    }
    async findAll(query, req) {
        console.log('[LeadsController] findAll query:', query, 'user:', req.user?.id);
        return this.leadsService.findAll(query, req.user);
    }
    async getStatistics() {
        return this.leadsService.getStatistics();
    }
    async getPrioritizedLeads(req, userId) {
        const leads = await this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
        const prioritized = this.priorityService.prioritizeLeads(leads);
        return prioritized.map(lead => ({
            ...lead,
            priorityInfo: this.priorityService.calculateLeadPriority(lead),
        }));
    }
    async getTodaysTasks(req, userId) {
        const leads = await this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
        return this.priorityService.getTodaysPrioritizedTasks(leads);
    }
    async getSmartTips(req, userId) {
        const leads = await this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
        return {
            tips: this.priorityService.getSmartTips(leads),
            timestamp: new Date(),
        };
    }
    async getMyLeads(userId, req) {
        return this.leadsService.getMyLeads(this.getEffectiveUserId(req, userId));
    }
    async getDueFollowUps(req, userId) {
        return this.leadsService.getDueFollowUps(this.getEffectiveUserId(req, userId));
    }
    async findOne(id) {
        return this.leadsService.findOne(id);
    }
    async update(id, updateLeadDto) {
        return this.leadsService.update(id, updateLeadDto);
    }
    async assignLead(id, userId, req) {
        return this.leadsService.assignLead(id, userId, req.user?.id);
    }
    async updateStatus(id, status, notes) {
        return this.leadsService.updateStatus(id, status, notes);
    }
    async remove(id) {
        return this.leadsService.remove(id);
    }
    async createPublicLead(createLeadDto, req) {
        const token = (req.headers['x-public-token'] || req.query.token);
        const expected = process.env.PUBLIC_LEAD_TOKEN;
        if (!expected || token !== expected) {
            throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
        }
        const payload = {
            firstName: createLeadDto.firstName || 'Website',
            lastName: createLeadDto.lastName || 'Lead',
            phone: createLeadDto.phone || createLeadDto['phoneNumber'] || '',
            email: createLeadDto.email || '',
            source: createLeadDto.source || 'WEBSITE',
            status: createLeadDto.status || 'NEW',
            notes: createLeadDto.notes || '',
            propertyId: createLeadDto.propertyId,
            towerId: createLeadDto['towerId'],
            flatId: createLeadDto['flatId'],
        };
        return this.leadsService.create(payload);
    }
    async bulkAssignLeads(bulkAssignDto) {
        return this.leadsService.bulkAssignLeads(bulkAssignDto);
    }
    async checkDuplicateLead(checkDto) {
        return this.leadsService.checkDuplicateLead(checkDto);
    }
    async getAgentDashboardStats(agentId, query) {
        return this.leadsService.getAgentDashboardStats(agentId, query);
    }
    async getAdminDashboardStats(query) {
        return this.leadsService.getAdminDashboardStats(query);
    }
    async getTeamDashboardStats(gmId, query) {
        return this.leadsService.getTeamDashboardStats(gmId, query);
    }
    async importLeads(importDto) {
        return this.leadsService.importLeads(importDto);
    }
    getEffectiveUserId(req, requestedUserId) {
        const user = req.user;
        const roles = user?.roles?.map((r) => r.name) ?? [];
        const isManager = roles.some((r) => ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r));
        if (isManager && requestedUserId)
            return requestedUserId;
        return user?.id;
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryLeadDto, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('prioritized'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getPrioritizedLeads", null);
__decorate([
    (0, common_1.Get)('today-tasks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getTodaysTasks", null);
__decorate([
    (0, common_1.Get)('smart-tips'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getSmartTips", null);
__decorate([
    (0, common_1.Get)('my-leads/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getMyLeads", null);
__decorate([
    (0, common_1.Get)('due-followups'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getDueFollowUps", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "assignLead", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('public'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "createPublicLead", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "bulkAssignLeads", null);
__decorate([
    (0, common_1.Post)('check-duplicate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "checkDuplicateLead", null);
__decorate([
    (0, common_1.Get)('dashboard/agent/:agentId'),
    __param(0, (0, common_1.Param)('agentId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getAgentDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/admin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getAdminDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/team/:gmId'),
    __param(0, (0, common_1.Param)('gmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getTeamDashboardStats", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "importLeads", null);
exports.LeadsController = LeadsController = __decorate([
    (0, common_1.Controller)('leads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [leads_service_1.LeadsService,
        priority_service_1.PriorityService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map