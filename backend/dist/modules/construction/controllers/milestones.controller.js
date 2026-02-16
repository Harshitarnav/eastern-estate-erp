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
exports.MilestonesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const milestone_detection_service_1 = require("../services/milestone-detection.service");
const auto_demand_draft_service_1 = require("../services/auto-demand-draft.service");
let MilestonesController = class MilestonesController {
    constructor(milestoneDetectionService, autoDemandDraftService) {
        this.milestoneDetectionService = milestoneDetectionService;
        this.autoDemandDraftService = autoDemandDraftService;
    }
    async getDetectedMilestones() {
        return await this.milestoneDetectionService.detectMilestones();
    }
    async getDetectedMilestonesForFlat(flatId) {
        return await this.milestoneDetectionService.detectMilestonesForFlat(flatId);
    }
    async getConstructionSummary(flatId) {
        return await this.milestoneDetectionService.getConstructionSummary(flatId);
    }
    async triggerDemandDraft(body, req) {
        return await this.autoDemandDraftService.manualGenerateDemandDraft(body.flatPaymentPlanId, body.milestoneSequence, req.user.id);
    }
};
exports.MilestonesController = MilestonesController;
__decorate([
    (0, common_1.Get)('detected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "getDetectedMilestones", null);
__decorate([
    (0, common_1.Get)('flat/:flatId'),
    __param(0, (0, common_1.Param)('flatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "getDetectedMilestonesForFlat", null);
__decorate([
    (0, common_1.Get)('flat/:flatId/summary'),
    __param(0, (0, common_1.Param)('flatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "getConstructionSummary", null);
__decorate([
    (0, common_1.Post)('trigger-demand-draft'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "triggerDemandDraft", null);
exports.MilestonesController = MilestonesController = __decorate([
    (0, common_1.Controller)('construction/milestones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [milestone_detection_service_1.MilestoneDetectionService,
        auto_demand_draft_service_1.AutoDemandDraftService])
], MilestonesController);
//# sourceMappingURL=milestones.controller.js.map