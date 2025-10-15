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
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const accounting_service_1 = require("./accounting.service");
let AccountingController = class AccountingController {
    constructor(accountingService) {
        this.accountingService = accountingService;
    }
    createAccount(data) {
        return this.accountingService.createAccount(data);
    }
    getAllAccounts() {
        return this.accountingService.getAllAccounts();
    }
    getAccountById(id) {
        return this.accountingService.getAccountById(id);
    }
    updateAccount(id, data) {
        return this.accountingService.updateAccount(id, data);
    }
    createJournalEntry(data) {
        return this.accountingService.createJournalEntry(data);
    }
    getJournalEntryById(id) {
        return this.accountingService.getJournalEntryById(id);
    }
    getJournalEntryLines(id) {
        return this.accountingService.getJournalEntryLines(id);
    }
    getAccountLedger(id, startDate, endDate) {
        return this.accountingService.getAccountLedger(id, new Date(startDate), new Date(endDate));
    }
    getWeeklyLedger(week, year) {
        return this.accountingService.getWeeklyLedger(week, year);
    }
    getCashBook(startDate, endDate) {
        return this.accountingService.getCashBook(new Date(startDate), new Date(endDate));
    }
    getBankBook(bankAccountId, startDate, endDate) {
        return this.accountingService.getBankBook(bankAccountId, new Date(startDate), new Date(endDate));
    }
    async importJournalEntriesFromExcel(file) {
        return this.accountingService.importJournalEntriesFromExcel(file.buffer);
    }
    async exportLedgerToExcel(accountId, startDate, endDate, res) {
        const buffer = await this.accountingService.exportLedgerToExcel(accountId, new Date(startDate), new Date(endDate));
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=ledger-${accountId}.xlsx`,
        });
        res.send(buffer);
    }
    async exportTrialBalanceToExcel(date, res) {
        const buffer = await this.accountingService.exportTrialBalanceToExcel(new Date(date));
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=trial-balance-${date}.xlsx`,
        });
        res.send(buffer);
    }
    exportForITR(financialYear) {
        return this.accountingService.exportForITR(financialYear);
    }
    createBankAccount(data) {
        return this.accountingService.createBankAccount(data);
    }
    getAllBankAccounts() {
        return this.accountingService.getAllBankAccounts();
    }
    getBankAccountById(id) {
        return this.accountingService.getBankAccountById(id);
    }
    uploadBankStatement(data, file) {
        return this.accountingService.uploadBankStatement(data, file);
    }
    getUnreconciledTransactions(bankAccountId) {
        return this.accountingService.getUnreconciledTransactions(bankAccountId);
    }
    reconcileTransaction(statementId, journalEntryId) {
        return this.accountingService.reconcileTransaction(statementId, journalEntryId);
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAllAccounts", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAccountById", null);
__decorate([
    (0, common_1.Put)('accounts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Post)('journal-entries'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createJournalEntry", null);
__decorate([
    (0, common_1.Get)('journal-entries/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getJournalEntryById", null);
__decorate([
    (0, common_1.Get)('journal-entries/:id/lines'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getJournalEntryLines", null);
__decorate([
    (0, common_1.Get)('ledgers/account/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAccountLedger", null);
__decorate([
    (0, common_1.Get)('ledgers/weekly'),
    __param(0, (0, common_1.Query)('week')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getWeeklyLedger", null);
__decorate([
    (0, common_1.Get)('ledgers/cash-book'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getCashBook", null);
__decorate([
    (0, common_1.Get)('ledgers/bank-book/:bankAccountId'),
    __param(0, (0, common_1.Param)('bankAccountId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getBankBook", null);
__decorate([
    (0, common_1.Post)('journal-entries/import-excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "importJournalEntriesFromExcel", null);
__decorate([
    (0, common_1.Get)('exports/ledger/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "exportLedgerToExcel", null);
__decorate([
    (0, common_1.Get)('exports/trial-balance'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "exportTrialBalanceToExcel", null);
__decorate([
    (0, common_1.Get)('exports/itr'),
    __param(0, (0, common_1.Query)('financialYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "exportForITR", null);
__decorate([
    (0, common_1.Post)('bank-accounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createBankAccount", null);
__decorate([
    (0, common_1.Get)('bank-accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAllBankAccounts", null);
__decorate([
    (0, common_1.Get)('bank-accounts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getBankAccountById", null);
__decorate([
    (0, common_1.Post)('bank-statements/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "uploadBankStatement", null);
__decorate([
    (0, common_1.Get)('bank-statements/unreconciled/:bankAccountId'),
    __param(0, (0, common_1.Param)('bankAccountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getUnreconciledTransactions", null);
__decorate([
    (0, common_1.Post)('bank-statements/:statementId/reconcile'),
    __param(0, (0, common_1.Param)('statementId')),
    __param(1, (0, common_1.Body)('journalEntryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "reconcileTransaction", null);
exports.AccountingController = AccountingController = __decorate([
    (0, common_1.Controller)('accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map