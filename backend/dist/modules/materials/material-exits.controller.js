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
exports.MaterialExitsController = void 0;
const common_1 = require("@nestjs/common");
const material_exits_service_1 = require("./material-exits.service");
const create_material_exit_dto_1 = require("./dto/create-material-exit.dto");
const update_material_exit_dto_1 = require("./dto/update-material-exit.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let MaterialExitsController = class MaterialExitsController {
    constructor(exitsService) {
        this.exitsService = exitsService;
    }
    create(createDto) {
        return this.exitsService.create(createDto);
    }
    findAll(materialId, projectId) {
        const filters = {};
        if (materialId)
            filters.materialId = materialId;
        if (projectId)
            filters.projectId = projectId;
        return this.exitsService.findAll(filters);
    }
    findOne(id) {
        return this.exitsService.findOne(id);
    }
    update(id, updateDto) {
        return this.exitsService.update(id, updateDto);
    }
    remove(id) {
        return this.exitsService.remove(id);
    }
};
exports.MaterialExitsController = MaterialExitsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_material_exit_dto_1.CreateMaterialExitDto]),
    __metadata("design:returntype", void 0)
], MaterialExitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('materialId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaterialExitsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialExitsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_material_exit_dto_1.UpdateMaterialExitDto]),
    __metadata("design:returntype", void 0)
], MaterialExitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialExitsController.prototype, "remove", null);
exports.MaterialExitsController = MaterialExitsController = __decorate([
    (0, common_1.Controller)('material-exits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [material_exits_service_1.MaterialExitsService])
], MaterialExitsController);
//# sourceMappingURL=material-exits.controller.js.map