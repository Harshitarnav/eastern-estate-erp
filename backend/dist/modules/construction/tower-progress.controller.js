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
exports.TowerProgressController = void 0;
const common_1 = require("@nestjs/common");
const tower_progress_service_1 = require("./tower-progress.service");
const create_tower_progress_dto_1 = require("./dto/create-tower-progress.dto");
const update_tower_progress_dto_1 = require("./dto/update-tower-progress.dto");
const construction_tower_progress_entity_1 = require("./entities/construction-tower-progress.entity");
let TowerProgressController = class TowerProgressController {
    constructor(towerProgressService) {
        this.towerProgressService = towerProgressService;
    }
    async createTowerProgress(projectId, towerId, createDto) {
        return this.towerProgressService.create({
            ...createDto,
            constructionProjectId: projectId,
            towerId,
        });
    }
    async updateTowerProgress(id, updateDto) {
        return this.towerProgressService.update(id, updateDto);
    }
    async getTowerProgress(projectId, towerId, phase) {
        if (phase) {
            return this.towerProgressService.findByTowerAndPhase(towerId, phase);
        }
        return this.towerProgressService.findByTower(towerId);
    }
    async getTowerPhaseProgress(towerId, phase) {
        return this.towerProgressService.findByTowerAndPhase(towerId, phase);
    }
    async getTowerSummary(projectId) {
        return this.towerProgressService.getTowerProgressSummary(projectId);
    }
    async initializeTowerPhases(projectId, towerId) {
        return this.towerProgressService.initializeTowerPhases(projectId, towerId);
    }
    async calculateProgress(towerId, projectId) {
        const overallProgress = await this.towerProgressService.updateTowerOverallProgress(towerId, projectId);
        return { overallProgress };
    }
    async getProjectTowersCompletion(projectId) {
        const completion = await this.towerProgressService.getProjectTowersCompletionPercentage(projectId);
        return { completion };
    }
    async deleteTowerProgress(id) {
        return this.towerProgressService.remove(id);
    }
    async getAllTowerProgress(projectId) {
        return this.towerProgressService.findByProject(projectId);
    }
};
exports.TowerProgressController = TowerProgressController;
__decorate([
    (0, common_1.Post)(':projectId/towers/:towerId/progress'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('towerId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_tower_progress_dto_1.CreateTowerProgressDto]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "createTowerProgress", null);
__decorate([
    (0, common_1.Put)('tower-progress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tower_progress_dto_1.UpdateTowerProgressDto]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "updateTowerProgress", null);
__decorate([
    (0, common_1.Get)(':projectId/towers/:towerId/progress'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('towerId')),
    __param(2, (0, common_1.Query)('phase')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "getTowerProgress", null);
__decorate([
    (0, common_1.Get)(':projectId/towers/:towerId/progress/:phase'),
    __param(0, (0, common_1.Param)('towerId')),
    __param(1, (0, common_1.Param)('phase')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "getTowerPhaseProgress", null);
__decorate([
    (0, common_1.Get)(':id/tower-summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "getTowerSummary", null);
__decorate([
    (0, common_1.Post)(':projectId/towers/:towerId/initialize'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('towerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "initializeTowerPhases", null);
__decorate([
    (0, common_1.Post)('towers/:towerId/calculate-progress'),
    __param(0, (0, common_1.Param)('towerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "calculateProgress", null);
__decorate([
    (0, common_1.Get)(':id/towers-completion'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "getProjectTowersCompletion", null);
__decorate([
    (0, common_1.Delete)('tower-progress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "deleteTowerProgress", null);
__decorate([
    (0, common_1.Get)(':id/all-tower-progress'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowerProgressController.prototype, "getAllTowerProgress", null);
exports.TowerProgressController = TowerProgressController = __decorate([
    (0, common_1.Controller)('construction-projects'),
    __metadata("design:paramtypes", [tower_progress_service_1.TowerProgressService])
], TowerProgressController);
//# sourceMappingURL=tower-progress.controller.js.map