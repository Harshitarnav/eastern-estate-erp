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
    getPropertyWisePL(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        return this.accountingService.getPropertyWisePL(start, end);
    }
    getARAgingReport(asOf) {
        const date = asOf ? new Date(asOf) : new Date();
        return this.accountingService.getARAgingReport(date);
    }
    getAPAgingReport(asOf) {
        const date = asOf ? new Date(asOf) : new Date();
        return this.accountingService.getAPAgingReport(date);
    }
    getCashFlowStatement(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        return this.accountingService.getCashFlowStatement(start, end);
    }
    exportForITR(financialYear) {
        return this.accountingService.exportForITR(financialYear);
    }
};
exports.AccountingController = AccountingController;
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
    (0, common_1.Get)('reports/property-wise-pl'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getPropertyWisePL", null);
__decorate([
    (0, common_1.Get)('reports/ar-aging'),
    __param(0, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getARAgingReport", null);
__decorate([
    (0, common_1.Get)('reports/ap-aging'),
    __param(0, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAPAgingReport", null);
__decorate([
    (0, common_1.Get)('reports/cash-flow'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getCashFlowStatement", null);
__decorate([
    (0, common_1.Get)('exports/itr'),
    __param(0, (0, common_1.Query)('financialYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "exportForITR", null);
exports.AccountingController = AccountingController = __decorate([
    (0, common_1.Controller)('accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map