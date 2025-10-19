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
const flats_service_1 = require("./flats.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let FlatsController = class FlatsController {
    constructor(flatsService) {
        this.flatsService = flatsService;
    }
    async getGlobalStats() {
        return this.flatsService.getGlobalStats();
    }
    async create(createFlatDto) {
        return this.flatsService.create(createFlatDto);
    }
    async findAll(query) {
        return this.flatsService.findAll(query);
    }
    async findOne(id) {
        return this.flatsService.findOne(id);
    }
    async findByTower(towerId) {
        return this.flatsService.findByTower(towerId);
    }
    async findByProperty(propertyId) {
        return this.flatsService.findByProperty(propertyId);
    }
    async getTowerInventorySummary(towerId) {
        return this.flatsService.getTowerInventorySummary(towerId);
    }
    async getPropertyStats(propertyId) {
        return this.flatsService.getPropertyStats(propertyId);
    }
    async getTowerStats(towerId) {
        return this.flatsService.getTowerStats(towerId);
    }
    async update(id, updateFlatDto) {
        return this.flatsService.update(id, updateFlatDto);
    }
    async remove(id) {
        return this.flatsService.remove(id);
    }
};
exports.FlatsController = FlatsController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateFlatDto]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryFlatDto]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('tower/:towerId'),
    __param(0, (0, common_1.Param)('towerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "findByTower", null);
__decorate([
    (0, common_1.Get)('property/:propertyId'),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "findByProperty", null);
__decorate([
    (0, common_1.Get)('tower/:towerId/inventory/summary'),
    __param(0, (0, common_1.Param)('towerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "getTowerInventorySummary", null);
__decorate([
    (0, common_1.Get)('property/:propertyId/stats'),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "getPropertyStats", null);
__decorate([
    (0, common_1.Get)('tower/:towerId/stats'),
    __param(0, (0, common_1.Param)('towerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "getTowerStats", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateFlatDto]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatsController.prototype, "remove", null);
exports.FlatsController = FlatsController = __decorate([
    (0, common_1.Controller)('flats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [flats_service_1.FlatsService])
], FlatsController);
//# sourceMappingURL=flats.controller.js.map