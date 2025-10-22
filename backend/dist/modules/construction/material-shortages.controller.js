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
exports.MaterialShortagesController = void 0;
const common_1 = require("@nestjs/common");
const material_shortages_service_1 = require("./material-shortages.service");
const create_material_shortage_dto_1 = require("./dto/create-material-shortage.dto");
const update_material_shortage_dto_1 = require("./dto/update-material-shortage.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let MaterialShortagesController = class MaterialShortagesController {
    constructor(shortagesService) {
        this.shortagesService = shortagesService;
    }
    create(createDto) {
        return this.shortagesService.create(createDto);
    }
    findAll(projectId, status, priority) {
        const filters = {};
        if (projectId)
            filters.projectId = projectId;
        if (status)
            filters.status = status;
        if (priority)
            filters.priority = priority;
        return this.shortagesService.findAll(filters);
    }
    getCriticalShortages(projectId) {
        return this.shortagesService.getCriticalShortages(projectId);
    }
    findOne(id) {
        return this.shortagesService.findOne(id);
    }
    update(id, updateDto) {
        return this.shortagesService.update(id, updateDto);
    }
    markAsResolved(id) {
        return this.shortagesService.markAsResolved(id);
    }
    remove(id) {
        return this.shortagesService.remove(id);
    }
};
exports.MaterialShortagesController = MaterialShortagesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_material_shortage_dto_1.CreateMaterialShortageDto]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('priority')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('project/:projectId/critical'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "getCriticalShortages", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_material_shortage_dto_1.UpdateMaterialShortageDto]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "markAsResolved", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialShortagesController.prototype, "remove", null);
exports.MaterialShortagesController = MaterialShortagesController = __decorate([
    (0, common_1.Controller)('material-shortages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [material_shortages_service_1.MaterialShortagesService])
], MaterialShortagesController);
//# sourceMappingURL=material-shortages.controller.js.map