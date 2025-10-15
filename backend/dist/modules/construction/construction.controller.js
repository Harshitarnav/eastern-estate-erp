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
exports.ConstructionController = void 0;
const common_1 = require("@nestjs/common");
const construction_service_1 = require("./construction.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let ConstructionController = class ConstructionController {
    constructor(constructionService) {
        this.constructionService = constructionService;
    }
    async create(createDto) {
        return this.constructionService.create(createDto);
    }
    async findAll(query) {
        return this.constructionService.findAll(query);
    }
    async getStatistics() {
        return this.constructionService.getStatistics();
    }
    async findOne(id) {
        return this.constructionService.findOne(id);
    }
    async update(id, updateDto) {
        return this.constructionService.update(id, updateDto);
    }
    async remove(id) {
        return this.constructionService.remove(id);
    }
    async updateProgress(id, body) {
        return this.constructionService.updateProgress(id, body.phase, body.progress);
    }
};
exports.ConstructionController = ConstructionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateConstructionProjectDto]),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryConstructionProjectDto]),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateConstructionProjectDto]),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/progress'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConstructionController.prototype, "updateProgress", null);
exports.ConstructionController = ConstructionController = __decorate([
    (0, common_1.Controller)('construction'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [construction_service_1.ConstructionService])
], ConstructionController);
//# sourceMappingURL=construction.controller.js.map