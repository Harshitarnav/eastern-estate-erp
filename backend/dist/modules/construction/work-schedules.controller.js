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
exports.WorkSchedulesController = void 0;
const common_1 = require("@nestjs/common");
const work_schedules_service_1 = require("./work-schedules.service");
const create_work_schedule_dto_1 = require("./dto/create-work-schedule.dto");
const update_work_schedule_dto_1 = require("./dto/update-work-schedule.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let WorkSchedulesController = class WorkSchedulesController {
    constructor(schedulesService) {
        this.schedulesService = schedulesService;
    }
    create(createDto) {
        return this.schedulesService.create(createDto);
    }
    findAll(projectId, assignedTo, status) {
        const filters = {};
        if (projectId)
            filters.projectId = projectId;
        if (assignedTo)
            filters.assignedTo = assignedTo;
        if (status)
            filters.status = status;
        return this.schedulesService.findAll(filters);
    }
    getUpcomingTasks(projectId, days) {
        const daysNum = days ? parseInt(days) : 7;
        return this.schedulesService.getUpcomingTasks(projectId, daysNum);
    }
    getOverdueTasks(projectId) {
        return this.schedulesService.getOverdueTasks(projectId);
    }
    getTasksByEngineer(engineerId) {
        return this.schedulesService.getTasksByEngineer(engineerId);
    }
    findOne(id) {
        return this.schedulesService.findOne(id);
    }
    update(id, updateDto) {
        return this.schedulesService.update(id, updateDto);
    }
    updateProgress(id, progress) {
        return this.schedulesService.updateProgress(id, progress);
    }
    remove(id) {
        return this.schedulesService.remove(id);
    }
};
exports.WorkSchedulesController = WorkSchedulesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_schedule_dto_1.CreateWorkScheduleDto]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('assignedTo')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('project/:projectId/upcoming'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "getUpcomingTasks", null);
__decorate([
    (0, common_1.Get)('project/:projectId/overdue'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "getOverdueTasks", null);
__decorate([
    (0, common_1.Get)('engineer/:engineerId'),
    __param(0, (0, common_1.Param)('engineerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "getTasksByEngineer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_work_schedule_dto_1.UpdateWorkScheduleDto]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('progress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkSchedulesController.prototype, "remove", null);
exports.WorkSchedulesController = WorkSchedulesController = __decorate([
    (0, common_1.Controller)('work-schedules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [work_schedules_service_1.WorkSchedulesService])
], WorkSchedulesController);
//# sourceMappingURL=work-schedules.controller.js.map