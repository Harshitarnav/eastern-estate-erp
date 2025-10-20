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
exports.SalesTargetController = void 0;
const common_1 = require("@nestjs/common");
const sales_target_service_1 = require("./sales-target.service");
const create_sales_target_dto_1 = require("./dto/create-sales-target.dto");
const sales_target_entity_1 = require("./entities/sales-target.entity");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let SalesTargetController = class SalesTargetController {
    constructor(salesTargetService) {
        this.salesTargetService = salesTargetService;
    }
    create(createSalesTargetDto) {
        return this.salesTargetService.create(createSalesTargetDto);
    }
    findBySalesPerson(salesPersonId) {
        return this.salesTargetService.findBySalesPerson(salesPersonId);
    }
    getActiveTarget(salesPersonId, period) {
        return this.salesTargetService.getActiveTarget(salesPersonId, period);
    }
    getTeamPerformanceSummary(teamMemberIds) {
        const ids = teamMemberIds.split(',');
        return this.salesTargetService.getTeamPerformanceSummary(ids);
    }
    getTeamTargets(teamMemberIds, period) {
        const ids = teamMemberIds.split(',');
        return this.salesTargetService.getTeamTargets(ids, period);
    }
    findOne(id) {
        return this.salesTargetService.findOne(id);
    }
    update(id, updateData) {
        return this.salesTargetService.update(id, updateData);
    }
    updateAchievement(id) {
        return this.salesTargetService.updateAchievement(id);
    }
    updateSelfTarget(id, body) {
        return this.salesTargetService.updateSelfTarget(id, body.selfTargetBookings, body.selfTargetRevenue, body.notes);
    }
    markIncentivePaid(id) {
        return this.salesTargetService.markIncentivePaid(id);
    }
    remove(id) {
        return this.salesTargetService.remove(id);
    }
};
exports.SalesTargetController = SalesTargetController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_target_dto_1.CreateSalesTargetDto]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('salesperson/:salesPersonId'),
    __param(0, (0, common_1.Param)('salesPersonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "findBySalesPerson", null);
__decorate([
    (0, common_1.Get)('salesperson/:salesPersonId/active'),
    __param(0, (0, common_1.Param)('salesPersonId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "getActiveTarget", null);
__decorate([
    (0, common_1.Get)('team/performance-summary'),
    __param(0, (0, common_1.Query)('teamMemberIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "getTeamPerformanceSummary", null);
__decorate([
    (0, common_1.Get)('team/targets'),
    __param(0, (0, common_1.Query)('teamMemberIds')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "getTeamTargets", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/update-achievement'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "updateAchievement", null);
__decorate([
    (0, common_1.Patch)(':id/self-target'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "updateSelfTarget", null);
__decorate([
    (0, common_1.Patch)(':id/mark-incentive-paid'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "markIncentivePaid", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTargetController.prototype, "remove", null);
exports.SalesTargetController = SalesTargetController = __decorate([
    (0, common_1.Controller)('sales-targets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sales_target_service_1.SalesTargetService])
], SalesTargetController);
//# sourceMappingURL=sales-target.controller.js.map