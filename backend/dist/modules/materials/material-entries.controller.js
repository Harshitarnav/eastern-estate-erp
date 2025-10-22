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
exports.MaterialEntriesController = void 0;
const common_1 = require("@nestjs/common");
const material_entries_service_1 = require("./material-entries.service");
const create_material_entry_dto_1 = require("./dto/create-material-entry.dto");
const update_material_entry_dto_1 = require("./dto/update-material-entry.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let MaterialEntriesController = class MaterialEntriesController {
    constructor(entriesService) {
        this.entriesService = entriesService;
    }
    create(createDto) {
        return this.entriesService.create(createDto);
    }
    findAll(materialId, vendorId) {
        const filters = {};
        if (materialId)
            filters.materialId = materialId;
        if (vendorId)
            filters.vendorId = vendorId;
        return this.entriesService.findAll(filters);
    }
    findOne(id) {
        return this.entriesService.findOne(id);
    }
    update(id, updateDto) {
        return this.entriesService.update(id, updateDto);
    }
    remove(id) {
        return this.entriesService.remove(id);
    }
};
exports.MaterialEntriesController = MaterialEntriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_material_entry_dto_1.CreateMaterialEntryDto]),
    __metadata("design:returntype", void 0)
], MaterialEntriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('materialId')),
    __param(1, (0, common_1.Query)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaterialEntriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialEntriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_material_entry_dto_1.UpdateMaterialEntryDto]),
    __metadata("design:returntype", void 0)
], MaterialEntriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialEntriesController.prototype, "remove", null);
exports.MaterialEntriesController = MaterialEntriesController = __decorate([
    (0, common_1.Controller)('material-entries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [material_entries_service_1.MaterialEntriesService])
], MaterialEntriesController);
//# sourceMappingURL=material-entries.controller.js.map