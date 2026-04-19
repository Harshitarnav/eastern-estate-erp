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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getDashboard(propertyId, req) {
        const accessible = req?.accessiblePropertyIds;
        let effective = propertyId;
        if (accessible && accessible.length > 0) {
            if (propertyId && !accessible.includes(propertyId)) {
                effective = '00000000-0000-0000-0000-000000000000';
            }
            else if (!propertyId) {
                effective = accessible[0];
            }
        }
        return this.reportsService.getDashboard(effective);
    }
    async getOutstanding(propertyId, towerId, status, req) {
        const accessible = req?.accessiblePropertyIds;
        let effective = propertyId;
        if (accessible && accessible.length > 0) {
            if (propertyId && !accessible.includes(propertyId)) {
                effective = '00000000-0000-0000-0000-000000000000';
            }
            else if (!propertyId) {
                effective = accessible[0];
            }
        }
        return this.reportsService.getOutstandingReport({
            propertyId: effective || undefined,
            towerId: towerId || undefined,
            status: status || undefined,
        });
    }
    async getCollection(propertyId, towerId, startDate, endDate, paymentMethod, req) {
        const accessible = req?.accessiblePropertyIds;
        let effective = propertyId;
        if (accessible && accessible.length > 0) {
            if (propertyId && !accessible.includes(propertyId)) {
                effective = '00000000-0000-0000-0000-000000000000';
            }
            else if (!propertyId) {
                effective = accessible[0];
            }
        }
        return this.reportsService.getCollectionReport({
            propertyId: effective || undefined,
            towerId: towerId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            paymentMethod: paymentMethod || undefined,
        });
    }
    async getInventory(propertyId, towerId, status, flatType, req) {
        const accessible = req?.accessiblePropertyIds;
        let effective = propertyId;
        if (accessible && accessible.length > 0) {
            if (propertyId && !accessible.includes(propertyId)) {
                effective = '00000000-0000-0000-0000-000000000000';
            }
            else if (!propertyId) {
                effective = accessible[0];
            }
        }
        return this.reportsService.getInventoryReport({
            propertyId: effective || undefined,
            towerId: towerId || undefined,
            status: status || undefined,
            flatType: flatType || undefined,
        });
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('outstanding'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('towerId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getOutstanding", null);
__decorate([
    (0, common_1.Get)('collection'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('towerId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('paymentMethod')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCollection", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Query)('towerId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('flatType')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getInventory", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map