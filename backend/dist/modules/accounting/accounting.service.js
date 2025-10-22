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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("./entities/account.entity");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
const journal_entry_line_entity_1 = require("./entities/journal-entry-line.entity");
const bank_account_entity_1 = require("./entities/bank-account.entity");
const bank_statement_entity_1 = require("./entities/bank-statement.entity");
const XLSX = require("xlsx");
let AccountingService = class AccountingService {
    constructor(accountRepository, journalEntryRepository, journalEntryLineRepository, bankAccountRepository, bankStatementRepository) {
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.journalEntryLineRepository = journalEntryLineRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.bankStatementRepository = bankStatementRepository;
    }
    async createAccount(data) {
        const account = this.accountRepository.create(data);
        return this.accountRepository.save(account);
    }
    async getAllAccounts() {
        return this.accountRepository.find({
            relations: ['parentAccount', 'childAccounts'],
            order: { accountCode: 'ASC' },
        });
    }
    async getAccountById(id) {
        return this.accountRepository.findOne({
            where: { id },
            relations: ['parentAccount', 'childAccounts'],
        });
    }
    async updateAccount(id, data) {
        await this.accountRepository.update(id, data);
        return this.getAccountById(id);
    }
    async createJournalEntry(data) {
        const { lines, ...entryData } = data;
        const entry = this.journalEntryRepository.create(entryData);
        const savedEntry = await this.journalEntryRepository.save(entry);
        const entryResult = Array.isArray(savedEntry) ? savedEntry[0] : savedEntry;
        if (lines && lines.length > 0) {
            const entryLines = lines.map((line, index) => {
                return this.journalEntryLineRepository.create({
                    ...line,
                    journalEntryId: entryResult.id,
                    line_number: index + 1,
                });
            });
            await this.journalEntryLineRepository.save(entryLines);
            await this.updateAccountBalances(lines);
        }
        return this.getJournalEntryById(entryResult.id);
    }
    async getJournalEntryById(id) {
        return this.journalEntryRepository.findOne({
            where: { id },
            relations: ['property'],
        });
    }
    async getJournalEntryLines(entryId) {
        return this.journalEntryLineRepository.find({
            where: { journalEntryId: entryId },
            relations: ['account'],
            order: { id: 'ASC' },
        });
    }
    async updateAccountBalances(lines) {
        for (const line of lines) {
            const account = await this.accountRepository.findOne({
                where: { id: line.accountId },
            });
            if (account) {
                const debit = parseFloat(line.debitAmount) || 0;
                const credit = parseFloat(line.creditAmount) || 0;
                if (account.accountType === account_entity_1.AccountType.ASSET || account.accountType === account_entity_1.AccountType.EXPENSE) {
                    account.currentBalance = parseFloat(account.currentBalance) + debit - credit;
                }
                else {
                    account.currentBalance = parseFloat(account.currentBalance) + credit - debit;
                }
                await this.accountRepository.save(account);
            }
        }
    }
    async getAccountLedger(accountId, startDate, endDate) {
        const account = await this.getAccountById(accountId);
        const entries = await this.journalEntryLineRepository
            .createQueryBuilder('line')
            .leftJoinAndSelect('line.journalEntry', 'entry')
            .where('line.accountId = :accountId', { accountId })
            .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('entry.status = :status', { status: journal_entry_entity_1.JournalEntryStatus.POSTED })
            .orderBy('entry.entryDate', 'ASC')
            .addOrderBy('line.line_number', 'ASC')
            .getMany();
        let runningBalance = account.openingBalance;
        const ledgerEntries = entries.map((line) => {
            const debit = parseFloat(line.debitAmount) || 0;
            const credit = parseFloat(line.creditAmount) || 0;
            if (account.accountType === account_entity_1.AccountType.ASSET || account.accountType === account_entity_1.AccountType.EXPENSE) {
                runningBalance = runningBalance + debit - credit;
            }
            else {
                runningBalance = runningBalance + credit - debit;
            }
            return {
                date: line.journalEntry.entryDate,
                entryNumber: line.journalEntry.entryNumber,
                narration: line.description || line.journalEntry.narration,
                debit,
                credit,
                balance: runningBalance,
            };
        });
        return {
            account,
            openingBalance: account.openingBalance,
            closingBalance: runningBalance,
            entries: ledgerEntries,
        };
    }
    async getWeeklyLedger(week, year) {
        const startDate = this.getDateOfWeek(week, year);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const entries = await this.journalEntryRepository.find({
            where: {
                entryDate: (0, typeorm_2.Between)(startDate, endDate),
                status: journal_entry_entity_1.JournalEntryStatus.POSTED,
            },
            relations: ['property'],
            order: { entryDate: 'ASC' },
        });
        const summary = {
            week,
            year,
            startDate,
            endDate,
            totalEntries: entries.length,
            totalDebit: entries.reduce((sum, e) => sum + parseFloat(e.totalDebit), 0),
            totalCredit: entries.reduce((sum, e) => sum + parseFloat(e.totalCredit), 0),
            entries,
        };
        return summary;
    }
    async getCashBook(startDate, endDate) {
        const cashAccount = await this.accountRepository.findOne({
            where: { accountCode: '1001' },
        });
        if (!cashAccount) {
            throw new Error('Cash account not found');
        }
        return this.getAccountLedger(cashAccount.id, startDate, endDate);
    }
    async getBankBook(bankAccountId, startDate, endDate) {
        const bankAccount = await this.bankAccountRepository.findOne({
            where: { id: bankAccountId },
        });
        if (!bankAccount) {
            throw new Error('Bank account not found');
        }
        const account = await this.accountRepository.findOne({
            where: { accountName: bankAccount.accountName },
        });
        if (!account) {
            throw new Error('Bank account ledger not found');
        }
        return this.getAccountLedger(account.id, startDate, endDate);
    }
    async importJournalEntriesFromExcel(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const imported = [];
        for (const row of data) {
            try {
                const entry = await this.createJournalEntry({
                    entryNumber: row['Entry Number'],
                    entryDate: new Date(row['Date']),
                    narration: row['Narration'],
                    financialYear: row['Financial Year'],
                    period: row['Period'],
                    lines: [
                        {
                            accountCode: row['Debit Account'],
                            debitAmount: parseFloat(row['Debit Amount']) || 0,
                            creditAmount: 0,
                            description: row['Description'],
                        },
                        {
                            accountCode: row['Credit Account'],
                            debitAmount: 0,
                            creditAmount: parseFloat(row['Credit Amount']) || 0,
                            description: row['Description'],
                        },
                    ],
                });
                imported.push(entry);
            }
            catch (error) {
                console.error('Error importing row:', row, error);
            }
        }
        return {
            total: data.length,
            imported: imported.length,
            failed: data.length - imported.length,
            entries: imported,
        };
    }
    async exportLedgerToExcel(accountId, startDate, endDate) {
        const ledger = await this.getAccountLedger(accountId, startDate, endDate);
        const data = ledger.entries.map((entry) => ({
            Date: entry.date,
            'Entry Number': entry.entryNumber,
            Narration: entry.narration,
            Debit: entry.debit,
            Credit: entry.credit,
            Balance: entry.balance,
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async exportTrialBalanceToExcel(date) {
        const accounts = await this.accountRepository.find({
            where: { isActive: true },
            order: { accountCode: 'ASC' },
        });
        const data = accounts.map((account) => ({
            'Account Code': account.accountCode,
            'Account Name': account.accountName,
            'Account Type': account.accountType,
            Debit: account.currentBalance >= 0 ? account.currentBalance : 0,
            Credit: account.currentBalance < 0 ? Math.abs(account.currentBalance) : 0,
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial Balance');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async exportForITR(financialYear) {
        const incomeAccounts = await this.accountRepository.find({
            where: { accountType: account_entity_1.AccountType.INCOME },
        });
        const expenseAccounts = await this.accountRepository.find({
            where: { accountType: account_entity_1.AccountType.EXPENSE },
        });
        const totalIncome = incomeAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance), 0);
        const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance), 0);
        return {
            financial_year: financialYear,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            net_profit: totalIncome - totalExpenses,
            income_heads: incomeAccounts.map((acc) => ({
                head: acc.accountName,
                amount: acc.currentBalance,
            })),
            expense_heads: expenseAccounts.map((acc) => ({
                head: acc.accountName,
                amount: acc.currentBalance,
            })),
        };
    }
    async uploadBankStatement(data, file) {
        const statements = [];
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            for (const row of rows) {
                const statement = this.bankStatementRepository.create({
                    bankAccountId: data.bankAccountId,
                    statementDate: new Date(row['Date']),
                    transactionDate: new Date(row['Transaction Date'] || row['Date']),
                    transactionId: row['Transaction ID'] || row['Ref No'],
                    description: row['Description'] || row['Narration'],
                    referenceNumber: row['Reference Number'] || row['Cheque No'],
                    debitAmount: parseFloat(row['Debit'] || row['Withdrawal']) || 0,
                    creditAmount: parseFloat(row['Credit'] || row['Deposit']) || 0,
                    balance: parseFloat(row['Balance']) || 0,
                    uploadedFile: file.originalname,
                });
                statements.push(statement);
            }
        }
        const saved = await this.bankStatementRepository.save(statements);
        return {
            total: saved.length,
            bankAccountId: data.bankAccountId,
            fileName: file.originalname,
            statements: saved,
        };
    }
    async getUnreconciledTransactions(bankAccountId) {
        return this.bankStatementRepository.find({
            where: {
                bankAccountId,
                isReconciled: false,
            },
            order: { transactionDate: 'DESC' },
        });
    }
    async reconcileTransaction(statementId, journalEntryId) {
        await this.bankStatementRepository.update(statementId, {
            isReconciled: true,
            reconciledWithEntryId: journalEntryId,
            reconciledDate: new Date(),
        });
        return this.bankStatementRepository.findOne({ where: { id: statementId } });
    }
    getDateOfWeek(week, year) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }
    async createBankAccount(data) {
        const bankAccount = this.bankAccountRepository.create(data);
        return this.bankAccountRepository.save(bankAccount);
    }
    async getAllBankAccounts() {
        return this.bankAccountRepository.find({
            where: { isActive: true },
            order: { accountName: 'ASC' },
        });
    }
    async getBankAccountById(id) {
        return this.bankAccountRepository.findOne({ where: { id } });
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(1, (0, typeorm_1.InjectRepository)(journal_entry_entity_1.JournalEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(journal_entry_line_entity_1.JournalEntryLine)),
    __param(3, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(4, (0, typeorm_1.InjectRepository)(bank_statement_entity_1.BankStatement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map