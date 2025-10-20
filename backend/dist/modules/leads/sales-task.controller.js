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
exports.SalesTaskController = void 0;
const common_1 = require("@nestjs/common");
const sales_task_service_1 = require("./sales-task.service");
const create_sales_task_dto_1 = require("./dto/create-sales-task.dto");
const sales_task_entity_1 = require("./entities/sales-task.entity");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let SalesTaskController = class SalesTaskController {
    constructor(salesTaskService) {
        this.salesTaskService = salesTaskService;
    }
    create(createSalesTaskDto) {
        return this.salesTaskService.create(createSalesTaskDto);
    }
    findByUser(userId, status) {
        return this.salesTaskService.findByUser(userId, status);
    }
    getTodayTasks(userId) {
        return this.salesTaskService.getTodayTasks(userId);
    }
    getUpcomingTasks(userId, days) {
        return this.salesTaskService.getUpcomingTasks(userId, days ? Number(days) : 7);
    }
    getOverdueTasks(userId) {
        return this.salesTaskService.getOverdueTasks(userId);
    }
    getStatistics(userId, startDate, endDate) {
        return this.salesTaskService.getStatistics(userId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    getTasksByDateRange(userId, startDate, endDate) {
        return this.salesTaskService.getTasksByDateRange(userId, new Date(startDate), new Date(endDate));
    }
    findOne(id) {
        return this.salesTaskService.findOne(id);
    }
    update(id, updateData) {
        return this.salesTaskService.update(id, updateData);
    }
    completeTask(id, body) {
        return this.salesTaskService.completeTask(id, body.outcome, body.notes);
    }
    updateStatus(id, body) {
        return this.salesTaskService.updateStatus(id, body.status);
    }
    cancelTask(id, body) {
        return this.salesTaskService.cancelTask(id, body.reason);
    }
    markReminderSent(id) {
        return this.salesTaskService.markReminderSent(id);
    }
    remove(id) {
        return this.salesTaskService.remove(id);
    }
};
exports.SalesTaskController = SalesTaskController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_task_dto_1.CreateSalesTaskDto]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('user/:userId/today'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "getTodayTasks", null);
__decorate([
    (0, common_1.Get)('user/:userId/upcoming'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "getUpcomingTasks", null);
__decorate([
    (0, common_1.Get)('user/:userId/overdue'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "getOverdueTasks", null);
__decorate([
    (0, common_1.Get)('user/:userId/statistics'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('user/:userId/by-date'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "getTasksByDateRange", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "completeTask", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "cancelTask", null);
__decorate([
    (0, common_1.Patch)(':id/reminder-sent'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "markReminderSent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'sales_manager', 'sales_gm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesTaskController.prototype, "remove", null);
exports.SalesTaskController = SalesTaskController = __decorate([
    (0, common_1.Controller)('sales-tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sales_task_service_1.SalesTaskService])
], SalesTaskController);
//# sourceMappingURL=sales-task.controller.js.map