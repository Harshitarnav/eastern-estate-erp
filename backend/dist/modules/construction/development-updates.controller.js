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
exports.DevelopmentUpdatesController = void 0;
const common_1 = require("@nestjs/common");
const development_updates_service_1 = require("./development-updates.service");
const create_development_update_dto_1 = require("./dto/create-development-update.dto");
const update_development_update_dto_1 = require("./dto/update-development-update.dto");
let DevelopmentUpdatesController = class DevelopmentUpdatesController {
    constructor(developmentUpdatesService) {
        this.developmentUpdatesService = developmentUpdatesService;
    }
    async createUpdate(projectId, createDto, req) {
        const userId = req.user?.sub || req.user?.id;
        return this.developmentUpdatesService.create({ ...createDto, constructionProjectId: projectId }, userId);
    }
    async getProjectUpdates(projectId) {
        return this.developmentUpdatesService.findByProject(projectId);
    }
    async getUpdate(updateId) {
        return this.developmentUpdatesService.findOne(updateId);
    }
    async updateUpdate(updateId, updateDto) {
        return this.developmentUpdatesService.update(updateId, updateDto);
    }
    async deleteUpdate(updateId) {
        return this.developmentUpdatesService.remove(updateId);
    }
    async addImages(updateId, images) {
        return this.developmentUpdatesService.addImages(updateId, images);
    }
    async removeImage(updateId, imageUrl) {
        return this.developmentUpdatesService.removeImage(updateId, imageUrl);
    }
    async addAttachments(updateId, attachments) {
        return this.developmentUpdatesService.addAttachments(updateId, attachments);
    }
    async getRecentUpdates(projectId, days) {
        return this.developmentUpdatesService.getRecentUpdates(projectId, days ? parseInt(days.toString()) : 7);
    }
    async getUpdatesWithImages(projectId) {
        return this.developmentUpdatesService.getUpdatesWithImages(projectId);
    }
    async getUpdatesByVisibility(projectId, visibility) {
        return this.developmentUpdatesService.getUpdatesByVisibility(projectId, visibility);
    }
    async getUpdatesTimeline(projectId) {
        return this.developmentUpdatesService.getUpdatesTimeline(projectId);
    }
    async getUpdateStatistics(projectId) {
        return this.developmentUpdatesService.getProjectUpdateStatistics(projectId);
    }
};
exports.DevelopmentUpdatesController = DevelopmentUpdatesController;
__decorate([
    (0, common_1.Post)(':id/development-updates'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_development_update_dto_1.CreateDevelopmentUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "createUpdate", null);
__decorate([
    (0, common_1.Get)(':id/development-updates'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getProjectUpdates", null);
__decorate([
    (0, common_1.Get)('development-updates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getUpdate", null);
__decorate([
    (0, common_1.Put)('development-updates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_development_update_dto_1.UpdateDevelopmentUpdateDto]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "updateUpdate", null);
__decorate([
    (0, common_1.Delete)('development-updates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "deleteUpdate", null);
__decorate([
    (0, common_1.Post)('development-updates/:id/images'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('images')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "addImages", null);
__decorate([
    (0, common_1.Delete)('development-updates/:id/images'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('imageUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "removeImage", null);
__decorate([
    (0, common_1.Post)('development-updates/:id/attachments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('attachments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "addAttachments", null);
__decorate([
    (0, common_1.Get)(':id/development-updates/recent'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getRecentUpdates", null);
__decorate([
    (0, common_1.Get)(':id/development-updates/with-images'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getUpdatesWithImages", null);
__decorate([
    (0, common_1.Get)(':id/development-updates/visibility/:visibility'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('visibility')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getUpdatesByVisibility", null);
__decorate([
    (0, common_1.Get)(':id/development-updates/timeline'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getUpdatesTimeline", null);
__decorate([
    (0, common_1.Get)(':id/development-updates/statistics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentUpdatesController.prototype, "getUpdateStatistics", null);
exports.DevelopmentUpdatesController = DevelopmentUpdatesController = __decorate([
    (0, common_1.Controller)('construction-projects'),
    __metadata("design:paramtypes", [development_updates_service_1.DevelopmentUpdatesService])
], DevelopmentUpdatesController);
//# sourceMappingURL=development-updates.controller.js.map