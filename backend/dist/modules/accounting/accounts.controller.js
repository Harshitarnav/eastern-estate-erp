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
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const accounts_service_1 = require("./accounts.service");
const accounting_service_1 = require("./accounting.service");
const create_account_dto_1 = require("./dto/create-account.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const account_entity_1 = require("./entities/account.entity");
const accounting_scope_util_1 = require("./utils/accounting-scope.util");
let AccountsController = class AccountsController {
    constructor(accountsService, accountingService) {
        this.accountsService = accountsService;
        this.accountingService = accountingService;
    }
    create(createAccountDto) {
        return this.accountsService.create(createAccountDto);
    }
    seedCoaForProject(propertyId) {
        return this.accountingService.seedCoaForProject(propertyId);
    }
    bulkImport(body, req) {
        const targetPid = body.propertyId || null;
        if (targetPid && !req.isGlobalAdmin) {
            const ids = req.accessiblePropertyIds || [];
            if (!ids.includes(targetPid)) {
                throw new common_1.ForbiddenException('You do not have access to this project');
            }
        }
        return this.accountsService.bulkImport(body.rows, targetPid);
    }
    findAll(req, accountType, isActive, propertyId, projectOnlyCoa) {
        const scopeIds = (0, accounting_scope_util_1.accessiblePropertyIdsOrThrow)(req);
        return this.accountsService.findAll({
            accountType,
            isActive: isActive ? isActive === 'true' : undefined,
            propertyId,
            projectOnlyCoa: projectOnlyCoa === 'true',
        }, scopeIds);
    }
    getHierarchy(req) {
        const scopeIds = (0, accounting_scope_util_1.accessiblePropertyIdsOrThrow)(req);
        return this.accountsService.getAccountHierarchy(scopeIds);
    }
    getBalanceSheet(propertyId, req) {
        const resolved = (0, accounting_scope_util_1.resolveAccountingReportScope)(req, propertyId);
        return this.accountsService.getBalanceSheet(resolved);
    }
    getProfitAndLoss(req, propertyId, startDate, endDate) {
        const resolved = (0, accounting_scope_util_1.resolveAccountingReportScope)(req, propertyId);
        return this.accountsService.getProfitAndLoss(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, resolved);
    }
    getTrialBalance(propertyId, req) {
        const resolved = (0, accounting_scope_util_1.resolveAccountingReportScope)(req, propertyId);
        return this.accountsService.getTrialBalance(resolved);
    }
    getPropertyWisePL(propertyId, req) {
        (0, accounting_scope_util_1.resolveAccountingPropertyScope)(req, propertyId);
        return this.accountsService.getPropertyWisePL(propertyId);
    }
    async findByCode(code, req) {
        const acc = await this.accountsService.findByCode(code);
        (0, accounting_scope_util_1.assertAccountReadable)(acc, req);
        return acc;
    }
    async findOne(id, propertyId, req) {
        if (propertyId && !req.isGlobalAdmin) {
            const ids = req.accessiblePropertyIds || [];
            if (!ids.includes(propertyId)) {
                throw new common_1.ForbiddenException('You do not have access to this project');
            }
        }
        const acc = await this.accountsService.findOne(id, propertyId);
        (0, accounting_scope_util_1.assertAccountReadable)(acc, req);
        return acc;
    }
    async update(id, updateAccountDto, req) {
        const acc = await this.accountsService.findOne(id);
        (0, accounting_scope_util_1.assertAccountReadable)(acc, req);
        return this.accountsService.update(id, updateAccountDto);
    }
    async remove(id, req) {
        const acc = await this.accountsService.findOne(id);
        (0, accounting_scope_util_1.assertAccountReadable)(acc, req);
        return this.accountsService.remove(id);
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('seed-for-project/:propertyId'),
    __param(0, (0, common_1.Param)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "seedCoaForProject", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('accountType')),
    __param(2, (0, common_1.Query)('isActive')),
    __param(3, (0, common_1.Query)('propertyId')),
    __param(4, (0, common_1.Query)('projectOnlyCoa')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('hierarchy'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getHierarchy", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('propertyId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getProfitAndLoss", null);
__decorate([
    (0, common_1.Get)('trial-balance'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('property-pl'),
    __param(0, (0, common_1.Query)('propertyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountsController.prototype, "getPropertyWisePL", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('propertyId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_account_dto_1.UpdateAccountDto, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "remove", null);
exports.AccountsController = AccountsController = __decorate([
    (0, common_1.Controller)('accounting/accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [accounts_service_1.AccountsService,
        accounting_service_1.AccountingService])
], AccountsController);
//# sourceMappingURL=accounts.controller.js.map