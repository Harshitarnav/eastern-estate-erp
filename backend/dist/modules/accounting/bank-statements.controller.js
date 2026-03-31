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
exports.BankStatementsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const bank_statements_service_1 = require("./bank-statements.service");
const multer_1 = require("multer");
let BankStatementsController = class BankStatementsController {
    constructor(service) {
        this.service = service;
    }
    findAll(bankAccountId) {
        return this.service.findAll(bankAccountId);
    }
    findUnreconciled(bankAccountId) {
        return this.service.findUnreconciled(bankAccountId);
    }
    async upload(file, bankAccountId) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded. Ensure the form field is named "file".');
        if (!bankAccountId)
            throw new common_1.BadRequestException('bankAccountId is required');
        if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
            throw new common_1.BadRequestException('Only Excel files (.xlsx / .xls) are accepted');
        }
        return this.service.uploadStatement(bankAccountId, file.buffer, file.originalname);
    }
    reconcile(id, journalEntryId) {
        if (!journalEntryId)
            throw new common_1.BadRequestException('journalEntryId is required');
        return this.service.reconcile(id, journalEntryId);
    }
    unreconcile(id) {
        return this.service.unreconcile(id);
    }
};
exports.BankStatementsController = BankStatementsController;
__decorate([
    (0, common_1.Get)(':bankAccountId'),
    __param(0, (0, common_1.Param)('bankAccountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankStatementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unreconciled/:bankAccountId'),
    __param(0, (0, common_1.Param)('bankAccountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankStatementsController.prototype, "findUnreconciled", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('bankAccountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BankStatementsController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)(':id/reconcile'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('journalEntryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BankStatementsController.prototype, "reconcile", null);
__decorate([
    (0, common_1.Post)(':id/unreconcile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankStatementsController.prototype, "unreconcile", null);
exports.BankStatementsController = BankStatementsController = __decorate([
    (0, common_1.Controller)('accounting/bank-statements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bank_statements_service_1.BankStatementsService])
], BankStatementsController);
//# sourceMappingURL=bank-statements.controller.js.map