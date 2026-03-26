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
exports.ConstructionReportsController = void 0;
const common_1 = require("@nestjs/common");
const construction_reports_service_1 = require("../services/construction-reports.service");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
let ConstructionReportsController = class ConstructionReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboard() {
        return this.reportsService.getDashboardSummary();
    }
    getBudgetVsActual(projectId) {
        return this.reportsService.getBudgetVsActual(projectId);
    }
    getCostToComplete(projectId) {
        return this.reportsService.getCostToComplete(projectId);
    }
    getVendorSpend(startDate, endDate) {
        return this.reportsService.getVendorSpendSummary(startDate, endDate);
    }
    getLabourProductivity(projectId) {
        return this.reportsService.getLabourProductivity(projectId);
    }
    getQCPassRate(projectId) {
        return this.reportsService.getQCPassRate(projectId);
    }
};
exports.ConstructionReportsController = ConstructionReportsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConstructionReportsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('budget'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionReportsController.prototype, "getBudgetVsActual", null);
__decorate([
    (0, common_1.Get)('cost-to-complete'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionReportsController.prototype, "getCostToComplete", null);
__decorate([
    (0, common_1.Get)('vendor-spend'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConstructionReportsController.prototype, "getVendorSpend", null);
__decorate([
    (0, common_1.Get)('labour'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionReportsController.prototype, "getLabourProductivity", null);
__decorate([
    (0, common_1.Get)('qc'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionReportsController.prototype, "getQCPassRate", null);
exports.ConstructionReportsController = ConstructionReportsController = __decorate([
    (0, common_1.Controller)('construction/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [construction_reports_service_1.ConstructionReportsService])
], ConstructionReportsController);
//# sourceMappingURL=construction-reports.controller.js.map