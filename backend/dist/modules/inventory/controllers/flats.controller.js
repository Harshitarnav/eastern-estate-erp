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
exports.FlatsController = void 0;
const common_1 = require("@nestjs/common");
const flats_service_1 = require("../services/flats.service");
const create_flat_dto_1 = require("../dto/create-flat.dto");
const update_flat_dto_1 = require("../dto/update-flat.dto");
const update_flat_status_dto_1 = require("../dto/update-flat-status.dto");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../../auth/decorators/roles.decorator");
let FlatsController = class FlatsController {
    constructor(flatsService) {
        this.flatsService = flatsService;
    }
    create(createFlatDto, req) {
        return this.flatsService.create(createFlatDto, req.user.id);
    }
    createBulk(body, req) {
        return this.flatsService.createBulk(body.flats, req.user.id);
    }
    findAll(query) {
        return this.flatsService.findAll(query);
    }
    findOne(id) {
        return this.flatsService.findOne(id);
    }
    update(id, updateFlatDto, req) {
        return this.flatsService.update(id, updateFlatDto, req.user.id);
    }
    updateStatus(id, updateStatusDto, req) {
        return this.flatsService.updateStatus(id, updateStatusDto.status, req.user.id);
    }
    updateBulkStatus(body, req) {
        return this.flatsService.updateBulkStatus(body.ids, body.status, req.user.id);
    }
    remove(id) {
        return this.flatsService.remove(id);
    }
};
exports.FlatsController = FlatsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'accountant'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flat_dto_1.CreateFlatDto, Object]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'accountant'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'accountant'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_flat_dto_1.UpdateFlatDto, Object]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'accountant', 'sales_manager'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_flat_status_dto_1.UpdateFlatStatusDto, Object]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('bulk/status'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin', 'accountant'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "updateBulkStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlatsController.prototype, "remove", null);
exports.FlatsController = FlatsController = __decorate([
    (0, common_1.Controller)('flats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [flats_service_1.FlatsService])
], FlatsController);
//# sourceMappingURL=flats.controller.js.map