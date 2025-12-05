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
exports.FollowUpController = void 0;
const common_1 = require("@nestjs/common");
const followup_service_1 = require("./followup.service");
const create_followup_dto_1 = require("./dto/create-followup.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
let FollowUpController = class FollowUpController {
    constructor(followUpService) {
        this.followUpService = followUpService;
    }
    create(createFollowUpDto, req) {
        const user = req.user;
        const effectiveUserId = this.isManager(user) && createFollowUpDto.performedBy
            ? createFollowUpDto.performedBy
            : user?.id;
        return this.followUpService.create({ ...createFollowUpDto, performedBy: effectiveUserId }, user);
    }
    findByLead(leadId, req) {
        return this.followUpService.findByLead(leadId, req.user);
    }
    findBySalesPerson(salesPersonId, startDate, endDate, req) {
        const effectiveUserId = this.getEffectiveUserId(req, salesPersonId);
        return this.followUpService.findBySalesPerson(effectiveUserId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, req?.user);
    }
    getUpcomingFollowUps(salesPersonId, req) {
        return this.followUpService.getUpcomingFollowUps(this.getEffectiveUserId(req, salesPersonId), req.user);
    }
    getStatistics(salesPersonId, startDate, endDate, req) {
        return this.followUpService.getStatistics(this.getEffectiveUserId(req, salesPersonId), new Date(startDate), new Date(endDate), req.user);
    }
    getSiteVisitStatistics(salesPersonId, startDate, endDate, req) {
        return this.followUpService.getSiteVisitStatistics(this.getEffectiveUserId(req, salesPersonId), new Date(startDate), new Date(endDate), req.user);
    }
    findOne(id, req) {
        return this.followUpService.findOne(id, req.user);
    }
    update(id, updateData, req) {
        return this.followUpService.update(id, updateData, req.user);
    }
    markReminderSent(id, req) {
        return this.followUpService.markReminderSent(id, req.user);
    }
    remove(id, req) {
        return this.followUpService.remove(id, req.user);
    }
    isManager(user) {
        const roles = user?.roles?.map((r) => r.name) ?? [];
        return roles.some((r) => ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r));
    }
    getEffectiveUserId(req, requestedUserId) {
        const user = req?.user;
        if (this.isManager(user) && requestedUserId)
            return requestedUserId;
        return user?.id;
    }
};
exports.FollowUpController = FollowUpController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_followup_dto_1.CreateFollowUpDto, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "findByLead", null);
__decorate([
    (0, common_1.Get)('salesperson/:salesPersonId'),
    __param(0, (0, common_1.Param)('salesPersonId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "findBySalesPerson", null);
__decorate([
    (0, common_1.Get)('salesperson/:salesPersonId/upcoming'),
    __param(0, (0, common_1.Param)('salesPersonId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "getUpcomingFollowUps", null);
__decorate([
    (0, common_1.Get)('salesperson/:salesPersonId/statistics'),
    __param(0, (0, common_1.Param)('salesPersonId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('salesperson/:salesPersonId/site-visit-statistics'),
    __param(0, (0, common_1.Param)('salesPersonId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "getSiteVisitStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/reminder-sent'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "markReminderSent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowUpController.prototype, "remove", null);
exports.FollowUpController = FollowUpController = __decorate([
    (0, common_1.Controller)('followups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [followup_service_1.FollowUpService])
], FollowUpController);
//# sourceMappingURL=followup.controller.js.map