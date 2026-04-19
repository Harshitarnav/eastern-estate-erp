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
var AccountingService_1;
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
let AccountingService = AccountingService_1 = class AccountingService {
    constructor(accountRepository, journalEntryRepository, journalEntryLineRepository, bankAccountRepository, bankStatementRepository, dataSource) {
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.journalEntryLineRepository = journalEntryLineRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.bankStatementRepository = bankStatementRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(AccountingService_1.name);
    }
    async createAccount(data) {
        if (data.propertyId === '')
            data.propertyId = null;
        const account = this.accountRepository.create(data);
        return this.accountRepository.save(account);
    }
    async seedCoaForProject(propertyId) {
        const STANDARD_ACCOUNTS = [
            { accountCode: '1001', accountName: 'Cash on Hand', accountType: 'ASSET', accountCategory: 'Cash', description: 'Petty cash and physical currency' },
            { accountCode: '1100', accountName: 'Bank Account', accountType: 'ASSET', accountCategory: 'Bank', description: 'Project bank account (70% escrow)' },
            { accountCode: '1200', accountName: 'Accounts Receivable', accountType: 'ASSET', accountCategory: 'Receivable', description: 'Amounts owed by customers' },
            { accountCode: '1300', accountName: 'Advance Payments', accountType: 'ASSET', accountCategory: 'Advance', description: 'Advances paid to contractors/vendors' },
            { accountCode: '2001', accountName: 'Accounts Payable', accountType: 'LIABILITY', accountCategory: 'Payable', description: 'Amounts owed to vendors/contractors' },
            { accountCode: '2100', accountName: 'Customer Advances', accountType: 'LIABILITY', accountCategory: 'Advance', description: 'Advance payments received from customers' },
            { accountCode: '2200', accountName: 'Tax Payable', accountType: 'LIABILITY', accountCategory: 'Tax', description: 'GST/TDS and other tax liabilities' },
            { accountCode: '3001', accountName: "Owner's Equity", accountType: 'EQUITY', accountCategory: 'Equity', description: "Owner's capital contribution" },
            { accountCode: '4001', accountName: 'Sales Revenue', accountType: 'INCOME', accountCategory: 'Revenue', description: 'Revenue from flat/unit sales' },
            { accountCode: '4100', accountName: 'Other Income', accountType: 'INCOME', accountCategory: 'Revenue', description: 'Miscellaneous project income' },
            { accountCode: '5001', accountName: 'Construction Expense', accountType: 'EXPENSE', accountCategory: 'Construction', description: 'Civil & construction work costs' },
            { accountCode: '5100', accountName: 'Material Purchase', accountType: 'EXPENSE', accountCategory: 'Materials', description: 'Raw materials and procurement' },
            { accountCode: '5200', accountName: 'Labour Wages', accountType: 'EXPENSE', accountCategory: 'Labour', description: 'Daily wage and contract labour' },
            { accountCode: '5300', accountName: 'Contractor Payments', accountType: 'EXPENSE', accountCategory: 'Contractor', description: 'Payments to sub-contractors and RA bills' },
            { accountCode: '5400', accountName: 'Salary Expense', accountType: 'EXPENSE', accountCategory: 'HR', description: 'Staff salaries attributed to this project' },
            { accountCode: '5500', accountName: 'Administrative Expense', accountType: 'EXPENSE', accountCategory: 'Admin', description: 'Office and administrative costs' },
            { accountCode: '5600', accountName: 'Bank Charges', accountType: 'EXPENSE', accountCategory: 'Finance', description: 'Bank fees and transaction charges' },
            { accountCode: '5700', accountName: 'Other Expenses', accountType: 'EXPENSE', accountCategory: 'Misc', description: 'Miscellaneous project expenses' },
        ];
        let created = 0;
        let skipped = 0;
        for (const template of STANDARD_ACCOUNTS) {
            const existing = await this.accountRepository
                .createQueryBuilder('a')
                .where('a.accountCode = :code', { code: template.accountCode })
                .andWhere('a.propertyId = :pid', { pid: propertyId })
                .getOne();
            if (existing) {
                skipped++;
                continue;
            }
            const account = this.accountRepository.create({
                accountCode: template.accountCode,
                accountName: template.accountName,
                accountType: template.accountType,
                accountCategory: template.accountCategory,
                description: template.description,
                propertyId,
                isActive: true,
                openingBalance: 0,
                currentBalance: 0,
            });
            await this.accountRepository.save(account);
            created++;
        }
        return { created, skipped };
    }
    async getAllAccounts(propertyId) {
        const where = {};
        if (propertyId)
            where.propertyId = propertyId;
        return this.accountRepository.find({
            where: Object.keys(where).length ? where : undefined,
            relations: ['parentAccount', 'childAccounts', 'property'],
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
    async generateEntryNumber() {
        const year = new Date().getFullYear();
        const prefix = `JE${year}`;
        const result = await this.journalEntryRepository
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
    async createJournalEntry(data) {
        const { lines, ...entryData } = data;
        if (!entryData.entryNumber) {
            entryData.entryNumber = await this.generateEntryNumber();
        }
        const entry = this.journalEntryRepository.create(entryData);
        const savedEntry = await this.journalEntryRepository.save(entry);
        const entryResult = Array.isArray(savedEntry) ? savedEntry[0] : savedEntry;
        if (lines && lines.length > 0) {
            const entryLines = lines.map((line) => {
                return this.journalEntryLineRepository.create({
                    ...line,
                    journalEntryId: entryResult.id,
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
            relations: ['lines', 'lines.account'],
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
    async getAccountLedger(accountId, startDate, endDate, propertyId) {
        const account = await this.getAccountById(accountId);
        const query = this.journalEntryLineRepository
            .createQueryBuilder('line')
            .leftJoinAndSelect('line.journalEntry', 'entry')
            .where('line.accountId = :accountId', { accountId })
            .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('entry.status = :status', { status: journal_entry_entity_1.JournalEntryStatus.POSTED });
        if (propertyId) {
            query.andWhere('(entry.propertyId IS NULL OR entry.propertyId = :propertyId)', {
                propertyId,
            });
        }
        const entries = await query
            .orderBy('entry.entryDate', 'ASC')
            .addOrderBy('line.id', 'ASC')
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
                narration: line.description || line.journalEntry.description,
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
            relations: ['lines', 'lines.account'],
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
    async getCashBook(startDate, endDate, propertyId) {
        const commonCashCodes = ['1001', '1100', '1110', '1010', '101', 'CASH'];
        let cashAccount = null;
        if (propertyId) {
            for (const code of commonCashCodes) {
                cashAccount = await this.accountRepository.findOne({
                    where: { accountCode: code, propertyId },
                });
                if (cashAccount)
                    break;
            }
            if (!cashAccount) {
                cashAccount = await this.accountRepository
                    .createQueryBuilder('account')
                    .where('LOWER(account.accountName) LIKE :name', { name: '%cash%' })
                    .andWhere('account.accountType = :type', { type: account_entity_1.AccountType.ASSET })
                    .andWhere('account.propertyId = :propertyId', { propertyId })
                    .orderBy('account.accountCode', 'ASC')
                    .getOne();
            }
        }
        if (!cashAccount) {
            for (const code of commonCashCodes) {
                cashAccount = await this.accountRepository.findOne({
                    where: { accountCode: code, propertyId: null },
                });
                if (cashAccount)
                    break;
            }
        }
        if (!cashAccount) {
            cashAccount = await this.accountRepository
                .createQueryBuilder('account')
                .where('LOWER(account.accountName) LIKE :name', { name: '%cash%' })
                .andWhere('account.accountType = :type', { type: account_entity_1.AccountType.ASSET })
                .orderBy('account.accountCode', 'ASC')
                .getOne();
        }
        if (!cashAccount) {
            throw new Error('Cash account not found. Please create an account named "Cash on Hand" ' +
                '(or code 1001/1110) under ASSET type in Chart of Accounts.');
        }
        const ledgerPropertyFilter = propertyId && cashAccount.propertyId === propertyId ? propertyId : undefined;
        return this.getAccountLedger(cashAccount.id, startDate, endDate, ledgerPropertyFilter);
    }
    async getBankBook(bankAccountId, startDate, endDate) {
        const bankAccount = await this.bankAccountRepository.findOne({
            where: { id: bankAccountId },
        });
        if (!bankAccount) {
            throw new Error('Bank account not found');
        }
        let account = await this.accountRepository.findOne({
            where: { accountName: bankAccount.accountName },
        });
        if (!account) {
            account = await this.accountRepository
                .createQueryBuilder('a')
                .where('LOWER(a.accountName) LIKE :name', {
                name: `%${bankAccount.accountName.toLowerCase()}%`,
            })
                .andWhere('a.accountType = :type', { type: account_entity_1.AccountType.ASSET })
                .orderBy('a.accountCode', 'ASC')
                .getOne();
        }
        if (!account) {
            account = await this.accountRepository
                .createQueryBuilder('a')
                .where('LOWER(a.accountName) LIKE :bank', {
                bank: `%${bankAccount.bankName.toLowerCase()}%`,
            })
                .andWhere('a.accountType = :type', { type: account_entity_1.AccountType.ASSET })
                .orderBy('a.accountCode', 'ASC')
                .getOne();
        }
        if (!account) {
            throw new Error(`No Chart of Accounts entry found for bank "${bankAccount.accountName}". ` +
                `Please create an ASSET account in Chart of Accounts with the name "${bankAccount.accountName}" ` +
                `or a name containing "${bankAccount.bankName}".`);
        }
        return this.getAccountLedger(account.id, startDate, endDate);
    }
    async importJournalEntriesFromExcel(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const imported = [];
        const errors = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const debitCode = String(row['Debit Account'] || '').trim();
                const creditCode = String(row['Credit Account'] || '').trim();
                const [debitAccount, creditAccount] = await Promise.all([
                    this.accountRepository.findOne({ where: { accountCode: debitCode } }),
                    this.accountRepository.findOne({ where: { accountCode: creditCode } }),
                ]);
                if (!debitAccount) {
                    throw new Error(`Debit account code "${debitCode}" not found in Chart of Accounts`);
                }
                if (!creditAccount) {
                    throw new Error(`Credit account code "${creditCode}" not found in Chart of Accounts`);
                }
                const entry = await this.createJournalEntry({
                    entryNumber: row['Entry Number'],
                    entryDate: new Date(row['Date']),
                    description: row['Narration'],
                    financialYear: row['Financial Year'],
                    period: row['Period'],
                    lines: [
                        {
                            accountId: debitAccount.id,
                            accountCode: debitCode,
                            debitAmount: parseFloat(row['Debit Amount']) || 0,
                            creditAmount: 0,
                            description: row['Description'],
                        },
                        {
                            accountId: creditAccount.id,
                            accountCode: creditCode,
                            debitAmount: 0,
                            creditAmount: parseFloat(row['Credit Amount']) || 0,
                            description: row['Description'],
                        },
                    ],
                });
                imported.push(entry);
            }
            catch (error) {
                this.logger.error(`Row ${i + 2}: ${error.message}`);
                errors.push({ row: i + 2, error: error.message });
            }
        }
        return {
            total: data.length,
            imported: imported.length,
            failed: errors.length,
            errors,
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
    async getPropertyWisePL(startDate, endDate, allowedPropertyIds) {
        const revenueRows = await this.dataSource.query(`
      SELECT
        p.id         AS property_id,
        p.name       AS property_name,
        COALESCE(SUM(pay.amount), 0) AS revenue
      FROM properties p
      LEFT JOIN bookings b  ON b.property_id = p.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
        AND pay.payment_status = 'COMPLETED'
        AND pay.payment_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
    `, [startDate, endDate]);
        const expenseRows = await this.dataSource.query(`
      SELECT
        p.id         AS property_id,
        p.name       AS property_name,
        COALESCE(SUM(e.amount), 0) AS expenses
      FROM properties p
      LEFT JOIN expenses e ON e.property_id = p.id
        AND e.status = 'PAID'
        AND e.expense_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY expenses DESC
    `, [startDate, endDate]);
        const map = {};
        for (const row of revenueRows) {
            map[row.property_id] = {
                propertyId: row.property_id,
                propertyName: row.property_name,
                revenue: Number(row.revenue),
                expenses: 0,
                netProfit: 0,
                margin: 0,
            };
        }
        for (const row of expenseRows) {
            if (!map[row.property_id]) {
                map[row.property_id] = {
                    propertyId: row.property_id,
                    propertyName: row.property_name,
                    revenue: 0,
                    expenses: 0,
                    netProfit: 0,
                    margin: 0,
                };
            }
            map[row.property_id].expenses = Number(row.expenses);
        }
        let properties = Object.values(map).map(p => {
            p.netProfit = Math.round((p.revenue - p.expenses) * 100) / 100;
            p.margin = p.revenue > 0 ? Math.round((p.netProfit / p.revenue) * 10000) / 100 : 0;
            return p;
        });
        if (allowedPropertyIds?.length) {
            const allow = new Set(allowedPropertyIds);
            properties = properties.filter((p) => allow.has(p.propertyId));
        }
        const totals = properties.reduce((acc, p) => ({
            revenue: acc.revenue + p.revenue,
            expenses: acc.expenses + p.expenses,
            netProfit: acc.netProfit + p.netProfit,
        }), { revenue: 0, expenses: 0, netProfit: 0 });
        return {
            period: { startDate, endDate },
            properties,
            totals: {
                ...totals,
                margin: totals.revenue > 0
                    ? Math.round((totals.netProfit / totals.revenue) * 10000) / 100
                    : 0,
            },
        };
    }
    async getProjectFundFlow(startDate, endDate, focusPropertyId, allowedPropertyIds) {
        const matrix = await this.dataSource.query(`
      WITH rev AS (
        SELECT b.property_id AS pid, COALESCE(SUM(pay.amount), 0)::numeric AS revenue
        FROM payments pay
        INNER JOIN bookings b ON b.id = pay.booking_id
        WHERE pay.payment_status = 'COMPLETED'
          AND pay.payment_date BETWEEN $1 AND $2
        GROUP BY b.property_id
      ),
      exp AS (
        SELECT e.property_id AS pid, COALESCE(SUM(e.amount), 0)::numeric AS amt
        FROM expenses e
        WHERE e.status = 'PAID'
          AND e.expense_date BETWEEN $1 AND $2
          AND e.property_id IS NOT NULL
        GROUP BY e.property_id
      ),
      vp AS (
        SELECT v.property_id AS pid, COALESCE(SUM(v.amount), 0)::numeric AS amt
        FROM vendor_payments v
        WHERE v.payment_date BETWEEN $1 AND $2
          AND v.property_id IS NOT NULL
        GROUP BY v.property_id
      ),
      sal AS (
        SELECT s.property_id AS pid, COALESCE(SUM(s.net_salary), 0)::numeric AS amt
        FROM salary_payments s
        WHERE s.payment_status = 'PAID'
          AND s.payment_date BETWEEN $1 AND $2
          AND s.property_id IS NOT NULL
        GROUP BY s.property_id
      )
      SELECT
        p.id AS "propertyId",
        p.name AS "propertyName",
        COALESCE(rev.revenue, 0)::float AS revenue,
        COALESCE(exp.amt, 0)::float AS "expensesTagged",
        COALESCE(vp.amt, 0)::float AS "vendorPaymentsTagged",
        COALESCE(sal.amt, 0)::float AS "salariesTagged",
        (COALESCE(exp.amt, 0) + COALESCE(vp.amt, 0) + COALESCE(sal.amt, 0))::float AS "totalOutflowsTagged",
        (COALESCE(rev.revenue, 0) - (COALESCE(exp.amt, 0) + COALESCE(vp.amt, 0) + COALESCE(sal.amt, 0)))::float AS "netTagged"
      FROM properties p
      LEFT JOIN rev ON rev.pid = p.id
      LEFT JOIN exp ON exp.pid = p.id
      LEFT JOIN vp ON vp.pid = p.id
      LEFT JOIN sal ON sal.pid = p.id
      ORDER BY p.name
      `, [startDate, endDate]);
        if (allowedPropertyIds?.length) {
            const allow = new Set(allowedPropertyIds);
            for (let i = matrix.length - 1; i >= 0; i--) {
                if (!allow.has(matrix[i].propertyId)) {
                    matrix.splice(i, 1);
                }
            }
        }
        if (focusPropertyId && allowedPropertyIds?.length && !allowedPropertyIds.includes(focusPropertyId)) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        const unallocated = await this.dataSource.query(`
      SELECT
        (SELECT COALESCE(SUM(amount), 0)::float FROM expenses
         WHERE status = 'PAID' AND expense_date BETWEEN $1 AND $2 AND property_id IS NULL) AS "expenses",
        (SELECT COALESCE(SUM(amount), 0)::float FROM vendor_payments
         WHERE payment_date BETWEEN $1 AND $2 AND property_id IS NULL) AS "vendorPayments",
        (SELECT COALESCE(SUM(net_salary), 0)::float FROM salary_payments
         WHERE payment_status = 'PAID' AND payment_date BETWEEN $1 AND $2 AND property_id IS NULL) AS "salaries"
      `, [startDate, endDate]);
        const u = unallocated[0] || {};
        const scopedFundFlow = !!(allowedPropertyIds && allowedPropertyIds.length > 0);
        const unallocatedExpenses = scopedFundFlow ? 0 : Number(u.expenses || 0);
        const unallocatedVendor = scopedFundFlow ? 0 : Number(u.vendorPayments || 0);
        const unallocatedSalaries = scopedFundFlow ? 0 : Number(u.salaries || 0);
        const unallocatedTotal = Math.round((unallocatedExpenses + unallocatedVendor + unallocatedSalaries) * 100) / 100;
        const projectsWithOutflows = matrix.filter((r) => Number(r.totalOutflowsTagged) > 0).length;
        let focusProperty = null;
        let inflows = [];
        let outflows = {
            expenses: [],
            vendorPayments: [],
            salaries: [],
        };
        if (focusPropertyId) {
            const propRow = await this.dataSource.query(`SELECT id, name FROM properties WHERE id = $1 LIMIT 1`, [focusPropertyId]);
            if (propRow.length) {
                focusProperty = { id: propRow[0].id, name: propRow[0].name };
            }
            inflows = await this.dataSource.query(`
        SELECT
          pay.id,
          pay.payment_number AS "paymentNumber",
          pay.amount::float AS amount,
          pay.payment_date AS "paymentDate",
          pay.payment_mode AS "paymentMode",
          b.id AS "bookingId"
        FROM payments pay
        INNER JOIN bookings b ON b.id = pay.booking_id
        WHERE b.property_id = $3
          AND pay.payment_status = 'COMPLETED'
          AND pay.payment_date BETWEEN $1 AND $2
        ORDER BY pay.payment_date DESC
        `, [startDate, endDate, focusPropertyId]);
            outflows.expenses = await this.dataSource.query(`
        SELECT e.id, e.expense_code AS "expenseCode", e.expense_category AS "expenseCategory",
               e.amount::float AS amount, e.expense_date AS "expenseDate", e.description
        FROM expenses e
        WHERE e.property_id = $3 AND e.status = 'PAID'
          AND e.expense_date BETWEEN $1 AND $2
        ORDER BY e.expense_date DESC
        `, [startDate, endDate, focusPropertyId]);
            outflows.vendorPayments = await this.dataSource.query(`
        SELECT vp.id, vp.amount::float AS amount, vp.payment_date AS "paymentDate",
               vp.payment_mode AS "paymentMode", vp.transaction_reference AS "transactionReference",
               v.vendor_name AS "vendorName"
        FROM vendor_payments vp
        LEFT JOIN vendors v ON v.id = vp.vendor_id
        WHERE vp.property_id = $3 AND vp.payment_date BETWEEN $1 AND $2
        ORDER BY vp.payment_date DESC
        `, [startDate, endDate, focusPropertyId]);
            outflows.salaries = await this.dataSource.query(`
        SELECT sp.id, sp.net_salary::float AS "netSalary", sp.payment_date AS "paymentDate",
               sp.payment_mode AS "paymentMode", e.full_name AS "employeeName"
        FROM salary_payments sp
        LEFT JOIN employees e ON e.id = sp.employee_id
        WHERE sp.property_id = $3 AND sp.payment_status = 'PAID'
          AND sp.payment_date BETWEEN $1 AND $2
        ORDER BY sp.payment_date DESC
        `, [startDate, endDate, focusPropertyId]);
        }
        const focusRow = focusPropertyId
            ? matrix.find((r) => r.propertyId === focusPropertyId)
            : null;
        return {
            period: { startDate, endDate },
            explanation: 'Revenue = completed customer payments on bookings for that project. ' +
                'Outflows = expenses, vendor payments, and salaries **tagged** to that project. ' +
                'Cross-project view shows how much was booked under each project vs how much spend was attributed to each - not automatic bank-to-project tracing.',
            focusProperty,
            focusSummary: focusRow || null,
            projectsWithOutflows,
            matrix,
            unallocatedOutflows: {
                expenses: unallocatedExpenses,
                vendorPayments: unallocatedVendor,
                salaries: unallocatedSalaries,
                total: unallocatedTotal,
            },
            inflows,
            outflows,
            inflowTotal: Math.round(inflows.reduce((s, x) => s + Number(x.amount || 0), 0) * 100) / 100,
            outflowTotal: focusPropertyId && focusRow
                ? Math.round(Number(focusRow.totalOutflowsTagged || 0) * 100) / 100
                : null,
        };
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
    async getARAgingReport(asOf, propertyId) {
        const asOfDate = asOf || new Date();
        const propertyClause = propertyId ? 'AND b.property_id = $2' : '';
        const params = [asOfDate];
        if (propertyId)
            params.push(propertyId);
        const rows = await this.dataSource.query(`
      SELECT
        c.id                             AS customer_id,
        c.full_name                      AS customer_name,
        c.phone_number                   AS customer_phone,
        b.booking_number,
        p.name                           AS property_name,
        ps.id                            AS schedule_id,
        ps.installment_number            AS schedule_number,
        ps.due_date,
        (ps.amount - ps.paid_amount)     AS outstanding,
        ps.amount                        AS installment_amount,
        ($1::date - ps.due_date::date)   AS days_overdue
      FROM payment_schedules ps
      JOIN bookings b  ON b.id = ps.booking_id
      JOIN customers c ON c.id = b.customer_id
      JOIN properties p ON p.id = b.property_id
      WHERE ps.status IN ('PENDING','OVERDUE','PARTIAL')
        AND ps.due_date <= $1
        AND (ps.amount - ps.paid_amount) > 0
        ${propertyClause}
      ORDER BY c.full_name, ps.due_date
    `, params);
        const customerMap = {};
        for (const row of rows) {
            const id = row.customer_id;
            if (!customerMap[id]) {
                customerMap[id] = {
                    customerId: id,
                    customerName: row.customer_name,
                    customerPhone: row.customer_phone,
                    bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90plus: 0,
                    total: 0,
                    bookings: [],
                };
            }
            const days = Number(row.days_overdue) || 0;
            const amt = Number(row.outstanding) || 0;
            if (days <= 30)
                customerMap[id].bucket0_30 += amt;
            else if (days <= 60)
                customerMap[id].bucket31_60 += amt;
            else if (days <= 90)
                customerMap[id].bucket61_90 += amt;
            else
                customerMap[id].bucket90plus += amt;
            customerMap[id].total += amt;
            if (!customerMap[id].bookings.includes(row.booking_number)) {
                customerMap[id].bookings.push(row.booking_number);
            }
        }
        const customers = Object.values(customerMap).sort((a, b) => b.bucket90plus - a.bucket90plus);
        const totals = customers.reduce((acc, c) => ({
            bucket0_30: acc.bucket0_30 + c.bucket0_30,
            bucket31_60: acc.bucket31_60 + c.bucket31_60,
            bucket61_90: acc.bucket61_90 + c.bucket61_90,
            bucket90plus: acc.bucket90plus + c.bucket90plus,
            total: acc.total + c.total,
        }), { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90plus: 0, total: 0 });
        return { asOf: asOfDate, customers, totals };
    }
    async getAPAgingReport(asOf) {
        const asOfDate = asOf || new Date();
        const vendorRows = await this.dataSource.query(`
      SELECT
        v.id               AS vendor_id,
        v.vendor_name,
        v.vendor_code,
        v.contact_person   AS contact_name,
        v.phone_number     AS phone,
        v.outstanding_amount,
        COALESCE(
          MAX(po.expected_delivery_date),
          NOW()::date
        )                  AS latest_due_date,
        ($1::date - COALESCE(MAX(po.expected_delivery_date), NOW()::date)::date) AS days_overdue
      FROM vendors v
      LEFT JOIN purchase_orders po ON po.vendor_id = v.id
        AND po.status NOT IN ('RECEIVED','CANCELLED')
      WHERE v.outstanding_amount > 0
      GROUP BY v.id, v.vendor_name, v.vendor_code, v.contact_person, v.phone_number, v.outstanding_amount
      ORDER BY v.outstanding_amount DESC
    `, [asOfDate]);
        const vendors = vendorRows.map((row) => {
            const days = Number(row.days_overdue) || 0;
            const amt = Number(row.outstanding_amount) || 0;
            return {
                vendorId: row.vendor_id,
                vendorName: row.vendor_name,
                vendorCode: row.vendor_code,
                vendorCategory: null,
                contactName: row.contact_name,
                phone: row.phone,
                outstandingAmount: amt,
                daysOverdue: days,
                bucket: days <= 0 ? 'current' : days <= 30 ? '0_30' : days <= 60 ? '31_60' : days <= 90 ? '61_90' : '90plus',
                bucket0_30: days > 0 && days <= 30 ? amt : 0,
                bucket31_60: days > 30 && days <= 60 ? amt : 0,
                bucket61_90: days > 60 && days <= 90 ? amt : 0,
                bucket90plus: days > 90 ? amt : 0,
                current: days <= 0 ? amt : 0,
            };
        });
        const totals = vendors.reduce((acc, v) => ({
            current: acc.current + v.current,
            bucket0_30: acc.bucket0_30 + v.bucket0_30,
            bucket31_60: acc.bucket31_60 + v.bucket31_60,
            bucket61_90: acc.bucket61_90 + v.bucket61_90,
            bucket90plus: acc.bucket90plus + v.bucket90plus,
            total: acc.total + v.outstandingAmount,
        }), { current: 0, bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90plus: 0, total: 0 });
        return { asOf: asOfDate, vendors, totals };
    }
    async getCashFlowStatement(startDate, endDate, propertyId) {
        const propertyClause = propertyId
            ? 'AND (je.property_id = $3 OR a.property_id = $3)'
            : '';
        const cfParams = [startDate, endDate];
        if (propertyId)
            cfParams.push(propertyId);
        const lines = await this.dataSource.query(`
      SELECT
        jel.id,
        jel.debit_amount  AS "debitAmount",
        jel.credit_amount AS "creditAmount",
        jel.description,
        a.account_type    AS "accountType",
        a.account_name    AS "accountName",
        a.account_code    AS "accountCode",
        je.entry_date     AS "entryDate",
        je.description    AS "narration",
        je.reference_type AS "referenceType"
      FROM journal_entry_lines jel
      JOIN accounts a        ON a.id = jel.account_id
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE je.status = 'POSTED'
        AND je.entry_date BETWEEN $1 AND $2
        ${propertyClause}
      ORDER BY je.entry_date
    `, cfParams);
        const operating = [];
        const investing = [];
        const financing = [];
        for (const line of lines) {
            const name = (line.accountName || '').toLowerCase();
            const ref = (line.referenceType || '').toLowerCase();
            const type = line.accountType;
            const net = Number(line.debitAmount) - Number(line.creditAmount);
            const entry = {
                date: line.entryDate,
                description: line.description || line.narration,
                accountName: line.accountName,
                debit: Number(line.debitAmount),
                credit: Number(line.creditAmount),
                net,
            };
            if (name.includes('property') || name.includes('land') || name.includes('equipment') || name.includes('machinery') || name.includes('building') || ref === 'property') {
                investing.push(entry);
            }
            else if (name.includes('loan') || name.includes('capital') || name.includes('equity') || name.includes('borrowing') || type === 'EQUITY') {
                financing.push(entry);
            }
            else if (type === 'INCOME' || type === 'EXPENSE' || (type === 'ASSET' && !name.includes('bank') && !name.includes('cash'))) {
                operating.push(entry);
            }
        }
        const sum = (arr, key) => arr.reduce((s, e) => s + e[key], 0);
        const cashAccounts = await this.dataSource.query(`
      SELECT
        COALESCE(SUM(a.opening_balance), 0) +
        COALESCE((
          SELECT SUM(
            CASE
              WHEN a2.account_type = 'ASSET' THEN jel2.debit_amount - jel2.credit_amount
              ELSE jel2.credit_amount - jel2.debit_amount
            END
          )
          FROM journal_entry_lines jel2
          JOIN accounts a2            ON a2.id  = jel2.account_id
          JOIN journal_entries je2    ON je2.id = jel2.journal_entry_id
          WHERE je2.status = 'POSTED'
            AND je2.entry_date < $1
            AND a2.account_type = 'ASSET'
            AND (LOWER(a2.account_name) LIKE '%cash%' OR LOWER(a2.account_name) LIKE '%bank%')
        ), 0) AS opening
      FROM accounts a
      WHERE a.account_type = 'ASSET'
        AND (LOWER(a.account_name) LIKE '%cash%' OR LOWER(a.account_name) LIKE '%bank%')
    `, [startDate]);
        const openingBalance = Number(cashAccounts[0]?.opening) || 0;
        const netOperating = sum(operating, 'net');
        const netInvesting = -sum(investing, 'net');
        const netFinancing = sum(financing, 'net');
        const netChange = netOperating + netInvesting + netFinancing;
        return {
            period: { startDate, endDate },
            openingBalance,
            closingBalance: openingBalance + netChange,
            netChange,
            operating: {
                items: operating,
                total: netOperating,
            },
            investing: {
                items: investing,
                total: netInvesting,
            },
            financing: {
                items: financing,
                total: netFinancing,
            },
        };
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
exports.AccountingService = AccountingService = AccountingService_1 = __decorate([
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
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map