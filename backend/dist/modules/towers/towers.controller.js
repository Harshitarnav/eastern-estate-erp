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
const swagger_1 = require("@nestjs/swagger");
const towers_service_1 = require("./towers.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_constant_1 = require("../../common/constants/roles.constant");
const platform_express_1 = require("@nestjs/platform-express");
let TowersController = class TowersController {
    constructor(towersService) {
        this.towersService = towersService;
    }
    async create(createTowerDto) {
        return this.towersService.create(createTowerDto);
    }
    async findAll(queryDto) {
        return this.towersService.findAll(queryDto);
    }
    async findOne(id) {
        return this.towersService.findOne(id);
    }
    async bulkImport(propertyId, file) {
        if (!propertyId) {
            throw new common_1.BadRequestException('propertyId is required');
        }
        if (!file) {
            throw new common_1.BadRequestException('CSV or XLSX file is required');
        }
        return this.towersService.bulkImport(propertyId, file.buffer);
    }
    async getInventoryOverview(id) {
        return this.towersService.getInventoryOverview(id);
    }
    async update(id, updateTowerDto) {
        return this.towersService.update(id, updateTowerDto);
    }
    async remove(id) {
        return this.towersService.remove(id);
    }
    async findByProperty(propertyId) {
        return this.towersService.findByProperty(propertyId);
    }
};
exports.TowersController = TowersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new tower',
        description: 'Creates a new tower within a property with complete details and validation',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Tower created successfully',
        type: dto_1.TowerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or business rule violation',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Property not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Tower number already exists in this property',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTowerDto]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all towers',
        description: 'Retrieves a paginated list of towers with comprehensive filtering options',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Towers retrieved successfully',
        type: dto_1.PaginatedTowerResponseDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryTowerDto]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tower by ID',
        description: 'Retrieves complete details of a specific tower',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tower UUID',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tower found',
        type: dto_1.TowerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tower not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk import towers',
        description: 'Upload a CSV/XLSX file to create multiple towers in a single operation.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Bulk tower import processed',
        type: dto_1.BulkImportTowersSummaryDto,
    }),
    __param(0, (0, common_1.Body)('propertyId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Get)(':id/inventory/overview'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tower inventory overview',
        description: 'Summarizes unit completeness, issues, and sales status for a single tower',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tower UUID',
        type: String,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "getInventoryOverview", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update tower',
        description: 'Updates tower information with validation. Supports partial updates.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tower UUID',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tower updated successfully',
        type: dto_1.TowerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tower not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Tower number conflict',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTowerDto]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_constant_1.UserRole.ADMIN, roles_constant_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete tower',
        description: 'Soft deletes a tower (deactivates). Historical data is preserved.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tower UUID',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tower deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tower not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('property/:propertyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get towers by property',
        description: 'Retrieves all towers within a specific property',
    }),
    (0, swagger_1.ApiParam)({
        name: 'propertyId',
        description: 'Property UUID',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Towers retrieved successfully',
        type: [dto_1.TowerResponseDto],
    }),
    __param(0, (0, common_1.Param)('propertyId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TowersController.prototype, "findByProperty", null);
exports.TowersController = TowersController = __decorate([
    (0, swagger_1.ApiTags)('Towers'),
    (0, common_1.Controller)('towers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [towers_service_1.TowersService])
], TowersController);
//# sourceMappingURL=towers.controller.js.map