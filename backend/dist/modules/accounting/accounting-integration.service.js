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
    constructor(accountsRepo, jeRepo, jelRepo) {
        this.accountsRepo = accountsRepo;
        this.jeRepo = jeRepo;
        this.jelRepo = jelRepo;
        this.logger = new common_1.Logger(AccountingIntegrationService_1.name);
    }
    async findCashOrBankAccount() {
        const byName = await this.accountsRepo.findOne({
            where: [
                { accountType: account_entity_1.AccountType.ASSET, isActive: true, accountName: (0, typeorm_2.ILike)('%bank%') },
                { accountType: account_entity_1.AccountType.ASSET, isActive: true, accountName: (0, typeorm_2.ILike)('%cash%') },
            ],
            order: { accountCode: 'ASC' },
        });
        if (byName)
            return byName;
        return this.accountsRepo.findOne({
            where: { accountType: account_entity_1.AccountType.ASSET, isActive: true },
            order: { accountCode: 'ASC' },
        });
    }
    async findSalesRevenueAccount() {
        const byName = await this.accountsRepo.findOne({
            where: [
                { accountType: account_entity_1.AccountType.INCOME, isActive: true, accountName: (0, typeorm_2.ILike)('%sales%') },
                { accountType: account_entity_1.AccountType.INCOME, isActive: true, accountName: (0, typeorm_2.ILike)('%revenue%') },
                { accountType: account_entity_1.AccountType.INCOME, isActive: true, accountName: (0, typeorm_2.ILike)('%income%') },
            ],
            order: { accountCode: 'ASC' },
        });
        if (byName)
            return byName;
        return this.accountsRepo.findOne({
            where: { accountType: account_entity_1.AccountType.INCOME, isActive: true },
            order: { accountCode: 'ASC' },
        });
    }
    async findSalaryExpenseAccount() {
        const byName = await this.accountsRepo.findOne({
            where: [
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%salary%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%payroll%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%wages%') },
            ],
            order: { accountCode: 'ASC' },
        });
        if (byName)
            return byName;
        return this.accountsRepo.findOne({
            where: { accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
            order: { accountCode: 'ASC' },
        });
    }
    async findExpenseAccount(accountId) {
        if (accountId) {
            const acc = await this.accountsRepo.findOne({ where: { id: accountId, isActive: true } });
            if (acc)
                return acc;
        }
        return this.accountsRepo.findOne({
            where: { accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
            order: { accountCode: 'ASC' },
        });
    }
    async generateEntryNumber() {
        const year = new Date().getFullYear();
        const count = await this.jeRepo.count();
        return `JE${year}${String(count + 1).padStart(5, '0')}`;
    }
    async createAutoJE(opts) {
        const amount = Math.round(Number(opts.amount) * 100) / 100;
        if (!amount || amount <= 0)
            return null;
        try {
            const entryNumber = await this.generateEntryNumber();
            const je = this.jeRepo.create({
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
            });
            const savedJE = await this.jeRepo.save(je);
            const debitLine = this.jelRepo.create({
                journalEntryId: savedJE.id,
                accountId: opts.debitAccountId,
                debitAmount: amount,
                creditAmount: 0,
                description: opts.description,
            });
            const creditLine = this.jelRepo.create({
                journalEntryId: savedJE.id,
                accountId: opts.creditAccountId,
                debitAmount: 0,
                creditAmount: amount,
                description: opts.description,
            });
            await this.jelRepo.save([debitLine, creditLine]);
            await this.updateBalance(opts.debitAccountId, amount, 0);
            await this.updateBalance(opts.creditAccountId, 0, amount);
            this.logger.log(`Auto JE created: ${entryNumber} | ${opts.referenceType} ${opts.referenceId} | ₹${amount}`);
            return savedJE;
        }
        catch (err) {
            this.logger.error(`Failed to create auto JE for ${opts.referenceType} ${opts.referenceId}: ${err.message}`);
            return null;
        }
    }
    async updateBalance(accountId, debit, credit) {
        const account = await this.accountsRepo.findOne({ where: { id: accountId } });
        if (!account)
            return;
        const isDebitType = account.accountType === account_entity_1.AccountType.ASSET || account.accountType === account_entity_1.AccountType.EXPENSE;
        const current = Math.round(Number(account.currentBalance) * 100) / 100;
        account.currentBalance = isDebitType
            ? Math.round((current + debit - credit) * 100) / 100
            : Math.round((current + credit - debit) * 100) / 100;
        await this.accountsRepo.save(account);
    }
    async onPaymentCompleted(payment) {
        const [bankAccount, revenueAccount] = await Promise.all([
            this.findCashOrBankAccount(),
            this.findSalesRevenueAccount(),
        ]);
        if (!bankAccount || !revenueAccount) {
            this.logger.warn(`Auto JE skipped for payment ${payment.paymentCode}: missing Bank or Revenue account in Chart of Accounts`);
            return null;
        }
        return this.createAutoJE({
            date: payment.paymentDate instanceof Date ? payment.paymentDate : new Date(payment.paymentDate),
            description: `Payment received — ${payment.paymentCode} via ${payment.paymentMethod || 'N/A'}`,
            referenceType: 'PAYMENT',
            referenceId: payment.id,
            debitAccountId: bankAccount.id,
            creditAccountId: revenueAccount.id,
            amount: payment.amount,
            createdBy: payment.createdBy,
        });
    }
    async onExpensePaid(expense) {
        const [expenseAccount, bankAccount] = await Promise.all([
            this.findExpenseAccount(expense.accountId),
            this.findCashOrBankAccount(),
        ]);
        if (!expenseAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for expense ${expense.expenseCode}: missing Expense or Bank account`);
            return null;
        }
        return this.createAutoJE({
            date: expense.expenseDate instanceof Date ? expense.expenseDate : new Date(expense.expenseDate),
            description: `Expense paid — ${expense.expenseCode}: ${expense.description}`,
            referenceType: 'EXPENSE',
            referenceId: expense.id,
            debitAccountId: expenseAccount.id,
            creditAccountId: bankAccount.id,
            amount: expense.amount,
            createdBy: expense.createdBy,
        });
    }
    async findConstructionExpenseAccount() {
        const byName = await this.accountsRepo.findOne({
            where: [
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%construction%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%work in progress%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%wip%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%contractor%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%civil%') },
            ],
            order: { accountCode: 'ASC' },
        });
        if (byName)
            return byName;
        return this.accountsRepo.findOne({
            where: { accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
            order: { accountCode: 'ASC' },
        });
    }
    async findMaterialPurchaseAccount() {
        const byName = await this.accountsRepo.findOne({
            where: [
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%material%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%purchase%') },
                { accountType: account_entity_1.AccountType.EXPENSE, isActive: true, accountName: (0, typeorm_2.ILike)('%procurement%') },
            ],
            order: { accountCode: 'ASC' },
        });
        if (byName)
            return byName;
        return this.findConstructionExpenseAccount();
    }
    async onRABillPaid(bill) {
        const [constructionAccount, bankAccount] = await Promise.all([
            this.findConstructionExpenseAccount(),
            this.findCashOrBankAccount(),
        ]);
        if (!constructionAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for RA Bill ${bill.raBillNumber}: missing Construction Expense or Bank account in Chart of Accounts`);
            return null;
        }
        const description = [
            `RA Bill paid — ${bill.raBillNumber}`,
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
        });
    }
    async onVendorPaymentRecorded(payment) {
        const [materialAccount, bankAccount] = await Promise.all([
            this.findMaterialPurchaseAccount(),
            this.findCashOrBankAccount(),
        ]);
        if (!materialAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for vendor payment ${payment.id}: missing Material Expense or Bank account in Chart of Accounts`);
            return null;
        }
        const description = [
            `Vendor payment recorded`,
            payment.vendorName ? `— ${payment.vendorName}` : '',
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
        });
    }
    async onSalaryPaid(salary) {
        const [salaryAccount, bankAccount] = await Promise.all([
            this.findSalaryExpenseAccount(),
            this.findCashOrBankAccount(),
        ]);
        if (!salaryAccount || !bankAccount) {
            this.logger.warn(`Auto JE skipped for salary ${salary.id}: missing Salary Expense or Bank account`);
            return null;
        }
        const monthStr = new Date(salary.paymentMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        return this.createAutoJE({
            date: salary.paymentDate instanceof Date ? salary.paymentDate : new Date(salary.paymentDate),
            description: `Salary paid — ${salary.employeeName} for ${monthStr}`,
            referenceType: 'SALARY',
            referenceId: salary.id,
            debitAccountId: salaryAccount.id,
            creditAccountId: bankAccount.id,
            amount: salary.netSalary,
            createdBy: salary.createdBy,
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
        typeorm_2.Repository])
], AccountingIntegrationService);
//# sourceMappingURL=accounting-integration.service.js.map