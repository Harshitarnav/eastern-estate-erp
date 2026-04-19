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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("./expenses.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const expense_entity_1 = require("./entities/expense.entity");
const accounting_scope_util_1 = require("./utils/accounting-scope.util");
let ExpensesController = class ExpensesController {
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    create(createExpenseDto, req) {
        return this.expensesService.create(createExpenseDto, req.user.userId);
    }
    bulkImport(body, req) {
        const targetPid = body.propertyId || null;
        if (targetPid && !req.isGlobalAdmin) {
            const ids = req.accessiblePropertyIds || [];
            if (!ids.includes(targetPid)) {
                throw new common_1.ForbiddenException('You do not have access to this project');
            }
        }
        return this.expensesService.bulkImport(body.rows, req.user?.userId, { propertyId: targetPid });
    }
    findAll(req, category, status, startDate, endDate, propertyId) {
        const scopeIds = (0, accounting_scope_util_1.accessiblePropertyIdsOrThrow)(req);
        return this.expensesService.findAll({
            expenseCategory: category,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            propertyId,
            accessiblePropertyIds: scopeIds || undefined,
        });
    }
    getSummary(req, startDate, endDate, propertyId) {
        const scopeIds = (0, accounting_scope_util_1.accessiblePropertyIdsOrThrow)(req);
        if (propertyId && scopeIds?.length && !scopeIds.includes(propertyId)) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        return this.expensesService.getExpensesSummary({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            accessiblePropertyIds: scopeIds || undefined,
            propertyId,
        });
    }
    async findOne(id, req) {
        const exp = await this.expensesService.findOne(id);
        (0, accounting_scope_util_1.assertExpenseReadable)(exp, req);
        return exp;
    }
    async update(id, updateExpenseDto, req) {
        const exp = await this.expensesService.findOne(id);
        (0, accounting_scope_util_1.assertExpenseReadable)(exp, req);
        return this.expensesService.update(id, updateExpenseDto);
    }
    async approve(id, approveDto, req) {
        const exp = await this.expensesService.findOne(id);
        (0, accounting_scope_util_1.assertExpenseReadable)(exp, req);
        return this.expensesService.approve(id, req.user.userId, approveDto);
    }
    async reject(id, rejectDto, req) {
        const exp = await this.expensesService.findOne(id);
        (0, accounting_scope_util_1.assertExpenseReadable)(exp, req);
        return this.expensesService.reject(id, req.user.userId, rejectDto);
    }
    async markAsPaid(id, req) {
        const exp = await this.expensesService.findOne(id);
        (0, accounting_scope_util_1.assertExpenseReadable)(exp, req);
        return this.expensesService.markAsPaid(id, req.user?.userId);
    }
    async remove(id, req) {
        const exp = await this.expensesService.findOne(id);
        (0, accounting_scope_util_1.assertExpenseReadable)(exp, req);
        return this.expensesService.remove(id);
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_expense_dto_1.UpdateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_expense_dto_1.ApproveExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_expense_dto_1.RejectExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "remove", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.Controller)('accounting/expenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map