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
exports.TowersController = void 0;
const common_1 = require("@nestjs/common");
const towers_service_1 = require("../services/towers.service");
const create_tower_dto_1 = require("../dto/create-tower.dto");
const update_tower_dto_1 = require("../dto/update-tower.dto");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../../auth/decorators/roles.decorator");
let TowersController = class TowersController {
    constructor(towersService) {
        this.towersService = towersService;
    }
    create(createTowerDto, req) {
        return this.towersService.create(createTowerDto, req.user.id);
    }
    findAll(query) {
        return this.towersService.findAll(query);
    }
    findOne(id) {
        return this.towersService.findOne(id);
    }
    update(id, updateTowerDto, req) {
        return this.towersService.update(id, updateTowerDto, req.user.id);
    }
    remove(id) {
        return this.towersService.remove(id);
    }
};
exports.TowersController = TowersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tower_dto_1.CreateTowerDto, Object]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tower_dto_1.UpdateTowerDto, Object]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TowersController.prototype, "remove", null);
exports.TowersController = TowersController = __decorate([
    (0, common_1.Controller)('towers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [towers_service_1.TowersService])
], TowersController);
//# sourceMappingURL=towers.controller.js.map