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
exports.DailyProgressReportsController = void 0;
const common_1 = require("@nestjs/common");
const daily_progress_reports_service_1 = require("./daily-progress-reports.service");
const create_daily_progress_report_dto_1 = require("./dto/create-daily-progress-report.dto");
const update_daily_progress_report_dto_1 = require("./dto/update-daily-progress-report.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let DailyProgressReportsController = class DailyProgressReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    create(createDto) {
        return this.reportsService.create(createDto);
    }
    findAll(projectId, fromDate, toDate) {
        const filters = {};
        if (projectId)
            filters.projectId = projectId;
        if (fromDate)
            filters.fromDate = new Date(fromDate);
        if (toDate)
            filters.toDate = new Date(toDate);
        return this.reportsService.findAll(filters);
    }
    getAttendanceSummary(projectId, month, year) {
        return this.reportsService.getAttendanceSummary(projectId, parseInt(month), parseInt(year));
    }
    findOne(id) {
        return this.reportsService.findOne(id);
    }
    update(id, updateDto) {
        return this.reportsService.update(id, updateDto);
    }
    remove(id) {
        return this.reportsService.remove(id);
    }
};
exports.DailyProgressReportsController = DailyProgressReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_daily_progress_report_dto_1.CreateDailyProgressReportDto]),
    __metadata("design:returntype", void 0)
], DailyProgressReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DailyProgressReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('attendance/:projectId/:month/:year'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('month')),
    __param(2, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DailyProgressReportsController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DailyProgressReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_daily_progress_report_dto_1.UpdateDailyProgressReportDto]),
    __metadata("design:returntype", void 0)
], DailyProgressReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DailyProgressReportsController.prototype, "remove", null);
exports.DailyProgressReportsController = DailyProgressReportsController = __decorate([
    (0, common_1.Controller)('daily-progress-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [daily_progress_reports_service_1.DailyProgressReportsService])
], DailyProgressReportsController);
//# sourceMappingURL=daily-progress-reports.controller.js.map