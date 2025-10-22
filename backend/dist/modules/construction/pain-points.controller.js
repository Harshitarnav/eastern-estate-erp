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
exports.PainPointsController = void 0;
const common_1 = require("@nestjs/common");
const pain_points_service_1 = require("./pain-points.service");
const create_pain_point_dto_1 = require("./dto/create-pain-point.dto");
const update_pain_point_dto_1 = require("./dto/update-pain-point.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let PainPointsController = class PainPointsController {
    constructor(painPointsService) {
        this.painPointsService = painPointsService;
    }
    create(createDto) {
        return this.painPointsService.create(createDto);
    }
    findAll(projectId, status, severity) {
        const filters = {};
        if (projectId)
            filters.projectId = projectId;
        if (status)
            filters.status = status;
        if (severity)
            filters.severity = severity;
        return this.painPointsService.findAll(filters);
    }
    getOpenIssues(projectId) {
        return this.painPointsService.getOpenIssues(projectId);
    }
    findOne(id) {
        return this.painPointsService.findOne(id);
    }
    update(id, updateDto) {
        return this.painPointsService.update(id, updateDto);
    }
    markAsResolved(id, resolutionNotes) {
        return this.painPointsService.markAsResolved(id, resolutionNotes);
    }
    remove(id) {
        return this.painPointsService.remove(id);
    }
};
exports.PainPointsController = PainPointsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pain_point_dto_1.CreatePainPointDto]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('severity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('project/:projectId/open'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "getOpenIssues", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pain_point_dto_1.UpdatePainPointDto]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('resolutionNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "markAsResolved", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PainPointsController.prototype, "remove", null);
exports.PainPointsController = PainPointsController = __decorate([
    (0, common_1.Controller)('pain-points'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pain_points_service_1.PainPointsService])
], PainPointsController);
//# sourceMappingURL=pain-points.controller.js.map