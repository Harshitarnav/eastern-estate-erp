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
exports.FlatProgressController = void 0;
const common_1 = require("@nestjs/common");
const flat_progress_service_1 = require("./flat-progress.service");
const create_flat_progress_dto_1 = require("./dto/create-flat-progress.dto");
const update_flat_progress_dto_1 = require("./dto/update-flat-progress.dto");
const construction_tower_progress_entity_1 = require("./entities/construction-tower-progress.entity");
let FlatProgressController = class FlatProgressController {
    constructor(flatProgressService) {
        this.flatProgressService = flatProgressService;
    }
    async createFlatProgress(projectId, flatId, createDto) {
        return this.flatProgressService.create({
            ...createDto,
            constructionProjectId: projectId,
            flatId,
        });
    }
    async updateFlatProgress(id, updateDto) {
        return this.flatProgressService.update(id, updateDto);
    }
    async getFlatProgress(projectId, flatId, phase) {
        if (phase) {
            return this.flatProgressService.findByFlatAndPhase(flatId, phase);
        }
        return this.flatProgressService.findByFlat(flatId);
    }
    async getFlatPhaseProgress(flatId, phase) {
        return this.flatProgressService.findByFlatAndPhase(flatId, phase);
    }
    async getFlatSummary(projectId) {
        return this.flatProgressService.getFlatProgressSummary(projectId);
    }
    async getFlatsReadyForHandover(projectId) {
        return this.flatProgressService.getFlatsReadyForHandover(projectId);
    }
    async getFlatProgressByTower(projectId, towerId) {
        return this.flatProgressService.getFlatProgressByTower(projectId, towerId);
    }
    async initializeFlatPhases(projectId, flatId) {
        return this.flatProgressService.initializeFlatPhases(projectId, flatId);
    }
    async calculateProgress(flatId, projectId) {
        const overallProgress = await this.flatProgressService.updateFlatOverallProgress(flatId, projectId);
        return { overallProgress };
    }
    async getProjectFlatsCompletion(projectId) {
        const completion = await this.flatProgressService.getProjectFlatsCompletionPercentage(projectId);
        return { completion };
    }
    async deleteFlatProgress(id) {
        return this.flatProgressService.remove(id);
    }
    async getAllFlatProgress(projectId) {
        return this.flatProgressService.findByProject(projectId);
    }
};
exports.FlatProgressController = FlatProgressController;
__decorate([
    (0, common_1.Post)(':projectId/flats/:flatId/progress'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('flatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_flat_progress_dto_1.CreateFlatProgressDto]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "createFlatProgress", null);
__decorate([
    (0, common_1.Put)('flat-progress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_flat_progress_dto_1.UpdateFlatProgressDto]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "updateFlatProgress", null);
__decorate([
    (0, common_1.Get)(':projectId/flats/:flatId/progress'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('flatId')),
    __param(2, (0, common_1.Query)('phase')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getFlatProgress", null);
__decorate([
    (0, common_1.Get)(':projectId/flats/:flatId/progress/:phase'),
    __param(0, (0, common_1.Param)('flatId')),
    __param(1, (0, common_1.Param)('phase')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getFlatPhaseProgress", null);
__decorate([
    (0, common_1.Get)(':id/flat-summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getFlatSummary", null);
__decorate([
    (0, common_1.Get)(':id/flats-ready-for-handover'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getFlatsReadyForHandover", null);
__decorate([
    (0, common_1.Get)(':projectId/towers/:towerId/flats-progress'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('towerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getFlatProgressByTower", null);
__decorate([
    (0, common_1.Post)(':projectId/flats/:flatId/initialize'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('flatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "initializeFlatPhases", null);
__decorate([
    (0, common_1.Post)('flats/:flatId/calculate-progress'),
    __param(0, (0, common_1.Param)('flatId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "calculateProgress", null);
__decorate([
    (0, common_1.Get)(':id/flats-completion'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getProjectFlatsCompletion", null);
__decorate([
    (0, common_1.Delete)('flat-progress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "deleteFlatProgress", null);
__decorate([
    (0, common_1.Get)(':id/all-flat-progress'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatProgressController.prototype, "getAllFlatProgress", null);
exports.FlatProgressController = FlatProgressController = __decorate([
    (0, common_1.Controller)('construction-projects'),
    __metadata("design:paramtypes", [flat_progress_service_1.FlatProgressService])
], FlatProgressController);
//# sourceMappingURL=flat-progress.controller.js.map