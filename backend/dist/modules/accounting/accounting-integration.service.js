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
var AccountingIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("./entities/account.entity");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
const journal_entry_line_entity_1 = require("./entities/journal-entry-line.entity");
let AccountingIntegrationService = AccountingIntegrationService_1 = class AccountingIntegrationService {
    constructor(accountsRepo, jeRepo, jelRepo, dataSource) {
        this.accountsRepo = accountsRepo;
        this.jeRepo = jeRepo;
        this.jelRepo = jelRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(AccountingIntegrationService_1.name);
    }
    async findCashOrBankAccount(propertyId) {
        const scopeFilters = this.buildScopeFilters(propertyId);
        for (const scope of scopeFilters) {
            const found = await this.accountsRepo.findOne({
                where: [
                    { ...scope, accountType: account_entity_1.AccountType.ASSET, isActive: true, accountName: (0, typeorm_2.ILike)('%bank%') },
                    { ...scope, accountType: account_entity_1.AccountType.ASSET, isActive: true, accountName: (0, typeorm_2.ILike)('%cash%') },
                ],
                order: { accountCode: 'ASC' },
            });
            if (found)
                return found;
            const fallback = await this.accountsRepo.findOne({
                where: { ...scope, accountType: account_entity_1.AccountType.ASSET, isActive: true },
                order: { accountCode: 'ASC' },
            });
            if (fallback)
                return fallback;
        }
        return null;
    }
    async findSalesRevenueAccount(propertyId) {
        const scopeFilters = this.buildScopeFilters(propertyId);
        for (const scope of scopeFilters) {
            const found = await this.accountsRepo.findOne({
                where: [
                    { ...scope, accountType: account_entity_1.AccountType.INCOME, isActive: true, accountName: (0, typeorm_2.ILike)('%sales%') },
                    { ...scope, accountType: account_entity_1.AccountType.INCOME, isActive: true, accountName: (0, typeorm_2.ILike)('%revenue%') },
                    { ...scope, accountType: account_entity_1.AccountType.INCOME, isActive: true, accountName: (0, typeorm_2.ILike)('%income%') },
                ],
                order: { accountCode: 'ASC' },
            });
            if (found)
                return found;
            const fallback = await this.accountsRepo.findOne({
                where: { ...scope, accountType: account_entity_1.AccountType.INCOME, isActive: true },
                order: { accountCode: 'ASC' },
            });
            if (fallback)
                return fallback;
        }
        return null;
    }
    async findSalaryExpenseAccount(propertyId) {
        const scopeFilters = this.buildScopeFilters(propertyId);
        for (const scope of scopeFilters) {
            const found = await this.accountsRepo.findOne({
                where: [
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%salary%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%payroll%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%wages%') },
                ],
                order: { accountCode: 'ASC' },
            });
            if (found)
                return found;
            const fallback = await this.accountsRepo.findOne({
                where: { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
                order: { accountCode: 'ASC' },
            });
            if (fallback)
                return fallback;
        }
        return null;
    }
    async findExpenseAccount(accountId, propertyId) {
        if (accountId) {
            const acc = await this.accountsRepo.findOne({ where: { id: accountId, isActive: true } });
            if (acc)
                return acc;
        }
        const scopeFilters = this.buildScopeFilters(propertyId);
        for (const scope of scopeFilters) {
            const found = await this.accountsRepo.findOne({
                where: { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
                order: { accountCode: 'ASC' },
            });
            if (found)
                return found;
        }
        return null;
    }
    buildScopeFilters(propertyId) {
        if (propertyId) {
            return [{ propertyId }, { propertyId: null }];
        }
        return [{}];
    }
    async generateEntryNumber() {
        const year = new Date().getFullYear();
        const prefix = `JE${year}`;
        const result = await this.jeRepo
            .createQueryBuilder('je')
            .select('MAX(je.entryNumber)', 'max')
            .where('je.entryNumber LIKE :prefix', { prefix: `${prefix}%` })
            .getRawOne();
        let nextNum = 1;
        if (result?.max) {
            const lastNum = parseInt(String(result.max).replace(prefix, ''), 10);
            if (!isNaN(lastNum))
                nextNum = lastNum + 1;
        }
        return `${prefix}${String(nextNum).padStart(5, '0')}`;
    }
    async createAutoJE(opts) {
        const amount = Math.round(Number(opts.amount) * 100) / 100;
        if (!amount || amount <= 0)
            return null;
        try {
            return await this.dataSource.transaction(async (manager) => {
                const entryNumber = await this.generateEntryNumber();
                const jeRepo = manager.getRepository(journal_entry_entity_1.JournalEntry);
                const jelRepo = manager.getRepository(journal_entry_line_entity_1.JournalEntryLine);
                const je = jeRepo.create({
                    entryNumber,
                    entryDate: opts.date,
                    description: opts.description,
                    referenceType: opts.referenceType,
                    referenceId: opts.referenceId,
                    status: journal_entry_entity_1.JournalEntryStatus.POSTED,
                    totalDebit: amount,
                    totalCredit: amount,
                    createdBy: opts.createdBy,
                    approvedBy: opts.createdBy,
                    approvedAt: new Date(),
                    propertyId: opts.propertyId ?? null,
                });
                const savedJE = (await jeRepo.save(je));
                const debitLine = jelRepo.create({
                    journalEntryId: savedJE.id,
                    accountId: opts.debitAccountId,
                    debitAmount: amount,
                    creditAmount: 0,
                    description: opts.description,
                });
                const creditLine = jelRepo.create({
                    journalEntryId: savedJE.id,
                    accountId: opts.creditAccountId,
                    debitAmount: 0,
                    creditAmount: amount,
                    description: opts.description,
                });
                await jelRepo.save([debitLine, creditLine]);
                await this.updateBalanceTx(manager, opts.debitAccountId, amount, 0);
                await this.updateBalanceTx(manager, opts.creditAccountId, 0, amount);
                this.logger.log(`Auto JE created: ${entryNumber} | ${opts.referenceType} ${opts.referenceId} | ₹${amount}`);
                return savedJE;
            });
        }
        catch (err) {
            this.logger.error(`Failed to create auto JE for ${opts.referenceType} ${opts.referenceId}: ${err?.message || err}`);
            return null;
        }
    }
    async updateBalanceTx(manager, accountId, debit, credit) {
        const accountsRepo = manager.getRepository(account_entity_1.Account);
        const account = await accountsRepo.findOne({ where: { id: accountId } });
        if (!account)
            return;
        const isDebitType = account.accountType === account_entity_1.AccountType.ASSET ||
            account.accountType === account_entity_1.AccountType.EXPENSE;
        const current = Math.round(Number(account.currentBalance) * 100) / 100;
        account.currentBalance = isDebitType
            ? Math.round((current + debit - credit) * 100) / 100
            : Math.round((current + credit - debit) * 100) / 100;
        await accountsRepo.save(account);
    }
    async onPaymentCompleted(payment) {
        const [bankAccount, revenueAccount] = await Promise.all([
            this.findCashOrBankAccount(payment.propertyId),
            this.findSalesRevenueAccount(payment.propertyId),
        ]);
        if (!bankAccount || !revenueAccount) {
            this.logger.warn(`Auto JE skipped for payment ${payment.paymentCode}: missing Bank or Revenue account in Chart of Accounts`);
            return null;
        }
        return this.createAutoJE({
            date: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate),
            description: `Payment received - ${payment.paymentCode} via ${payment.paymentMethod || 'N/A'}`,
            referenceType: 'PAYMENT',
            referenceId: payment.id,
            debitAccountId: bankAccount.id,
            creditAccountId: revenueAccount.id,
            amount: payment.amount,
            createdBy: payment.createdBy,
            propertyId: payment.propertyId,
        });
    }
    async onExpensePaid(expense) {
        const [expenseAccount, bankAccount] = await Promise.all([
            this.findExpenseAccount(expense.accountId, expense.propertyId),
            this.findCashOrBankAccount(expense.propertyId),
        ]);
        if (!expenseAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for expense ${expense.expenseCode}: missing Expense or Bank account`);
            return null;
        }
        return this.createAutoJE({
            date: expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate),
            description: `Expense paid - ${expense.expenseCode}: ${expense.description}`,
            referenceType: 'EXPENSE',
            referenceId: expense.id,
            debitAccountId: expenseAccount.id,
            creditAccountId: bankAccount.id,
            amount: expense.amount,
            createdBy: expense.createdBy,
            propertyId: expense.propertyId,
        });
    }
    async findConstructionExpenseAccount(propertyId) {
        const scopeFilters = this.buildScopeFilters(propertyId);
        for (const scope of scopeFilters) {
            const found = await this.accountsRepo.findOne({
                where: [
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%construction%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%work in progress%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%wip%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%contractor%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%civil%') },
                ],
                order: { accountCode: 'ASC' },
            });
            if (found)
                return found;
            const fallback = await this.accountsRepo.findOne({
                where: { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
                order: { accountCode: 'ASC' },
            });
            if (fallback)
                return fallback;
        }
        return null;
    }
    async findMaterialPurchaseAccount(propertyId) {
        const scopeFilters = this.buildScopeFilters(propertyId);
        for (const scope of scopeFilters) {
            const found = await this.accountsRepo.findOne({
                where: [
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%material%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%purchase%') },
                    { ...scope, accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%procurement%') },
                ],
                order: { accountCode: 'ASC' },
            });
            if (found)
                return found;
        }
        return this.findConstructionExpenseAccount(propertyId);
    }
    async onRABillPaid(bill) {
        const [constructionAccount, bankAccount] = await Promise.all([
            this.findConstructionExpenseAccount(bill.propertyId),
            this.findCashOrBankAccount(bill.propertyId),
        ]);
        if (!constructionAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for RA Bill ${bill.raBillNumber}: missing Construction Expense or Bank account in Chart of Accounts`);
            return null;
        }
        const description = [
            `RA Bill paid - ${bill.raBillNumber}`,
            bill.vendorName ? `| Vendor: ${bill.vendorName}` : '',
            bill.projectName ? `| Project: ${bill.projectName}` : '',
        ].filter(Boolean).join(' ');
        return this.createAutoJE({
            date: bill.paidAt instanceof Date ? bill.paidAt : new Date(bill.paidAt),
            description,
            referenceType: 'RA_BILL',
            referenceId: bill.id,
            debitAccountId: constructionAccount.id,
            creditAccountId: bankAccount.id,
            amount: bill.netPayable,
            createdBy: bill.createdBy,
            propertyId: bill.propertyId,
        });
    }
    async onVendorPaymentRecorded(payment) {
        const [materialAccount, bankAccount] = await Promise.all([
            this.findMaterialPurchaseAccount(payment.propertyId),
            this.findCashOrBankAccount(payment.propertyId),
        ]);
        if (!materialAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for vendor payment ${payment.id}: missing Material Expense or Bank account in Chart of Accounts`);
            return null;
        }
        const description = [
            `Vendor payment recorded`,
            payment.vendorName ? `- ${payment.vendorName}` : '',
            payment.transactionReference ? `| Ref: ${payment.transactionReference}` : '',
        ].filter(Boolean).join(' ');
        return this.createAutoJE({
            date: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate),
            description,
            referenceType: 'VENDOR_PAYMENT',
            referenceId: payment.id,
            debitAccountId: materialAccount.id,
            creditAccountId: bankAccount.id,
            amount: payment.amount,
            createdBy: payment.createdBy,
            propertyId: payment.propertyId,
        });
    }
    async onSalaryPaid(salary) {
        const [salaryAccount, bankAccount] = await Promise.all([
            this.findSalaryExpenseAccount(salary.propertyId),
            this.findCashOrBankAccount(salary.propertyId),
        ]);
        if (!salaryAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for salary ${salary.id}: missing Salary Expense or Bank account`);
            return null;
        }
        const monthStr = new Date(salary.paymentMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        return this.createAutoJE({
            date: salary.paymentDate instanceof Date ? salary.paymentDate : new Date(salary.paymentDate),
            description: `Salary paid - ${salary.employeeName} for ${monthStr}`,
            referenceType: 'SALARY',
            referenceId: salary.id,
            debitAccountId: salaryAccount.id,
            creditAccountId: bankAccount.id,
            amount: salary.netSalary,
            createdBy: salary.createdBy,
            propertyId: salary.propertyId,
        });
    }
};
exports.AccountingIntegrationService = AccountingIntegrationService;
exports.AccountingIntegrationService = AccountingIntegrationService = AccountingIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(1, (0, typeorm_1.InjectRepository)(journal_entry_entity_1.JournalEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(journal_entry_line_entity_1.JournalEntryLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AccountingIntegrationService);
//# sourceMappingURL=accounting-integration.service.js.map