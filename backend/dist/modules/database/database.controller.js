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
exports.DatabaseController = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("./database.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let DatabaseController = class DatabaseController {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async getTables() {
        const tables = await this.databaseService.getTables();
        return { data: tables };
    }
    async getTablesOverview() {
        const tables = await this.databaseService.getAllTablesInfo();
        return { data: tables };
    }
    async getStats() {
        const stats = await this.databaseService.getDatabaseStats();
        return { data: stats };
    }
    async getRelationships() {
        const relationships = await this.databaseService.getTableRelationships();
        return { data: relationships };
    }
    async getTableInfo(tableName) {
        const info = await this.databaseService.getTableInfo(tableName);
        return { data: info };
    }
    async getTableData(tableName, page = '1', limit = '10', search, sortBy, sortOrder = 'DESC') {
        const data = await this.databaseService.getTableData(tableName, parseInt(page), parseInt(limit), search, sortBy, sortOrder);
        return {
            data: data.data,
            meta: {
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: Math.ceil(data.total / data.limit),
            },
        };
    }
    async executeQuery(sql) {
        try {
            const result = await this.databaseService.executeQuery(sql);
            return {
                success: true,
                data: result,
                rowCount: result.length,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async updateRecord(tableName, primaryKey, data) {
        try {
            const result = await this.databaseService.updateRecord(tableName, primaryKey, data);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async createRecord(tableName, data) {
        try {
            const result = await this.databaseService.createRecord(tableName, data);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async deleteRecord(tableName, primaryKey) {
        try {
            const result = await this.databaseService.deleteRecord(tableName, primaryKey);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async getPrimaryKeys(tableName) {
        try {
            const primaryKeys = await this.databaseService.getPrimaryKeyColumns(tableName);
            return { data: primaryKeys };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
};
exports.DatabaseController = DatabaseController;
__decorate([
    (0, common_1.Get)('tables'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getTables", null);
__decorate([
    (0, common_1.Get)('tables/overview'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getTablesOverview", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('relationships'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getRelationships", null);
__decorate([
    (0, common_1.Get)('tables/:tableName'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('tableName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getTableInfo", null);
__decorate([
    (0, common_1.Get)('tables/:tableName/data'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getTableData", null);
__decorate([
    (0, common_1.Post)('query'),
    (0, roles_decorator_1.Roles)('super_admin'),
    __param(0, (0, common_1.Body)('sql')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "executeQuery", null);
__decorate([
    (0, common_1.Put)('tables/:tableName/records'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Body)('primaryKey')),
    __param(2, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Post)('tables/:tableName/records'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Delete)('tables/:tableName/records'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('tableName')),
    __param(1, (0, common_1.Body)('primaryKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "deleteRecord", null);
__decorate([
    (0, common_1.Get)('tables/:tableName/primary-keys'),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    __param(0, (0, common_1.Param)('tableName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DatabaseController.prototype, "getPrimaryKeys", null);
exports.DatabaseController = DatabaseController = __decorate([
    (0, common_1.Controller)('database'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DatabaseController);
//# sourceMappingURL=database.controller.js.map