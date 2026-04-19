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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("./entities/account.entity");
const journal_entry_line_entity_1 = require("./entities/journal-entry-line.entity");
const journal_entry_entity_1 = require("./entities/journal-entry.entity");
let AccountsService = class AccountsService {
    constructor(accountsRepository, journalEntryLinesRepository, dataSource) {
        this.accountsRepository = accountsRepository;
        this.journalEntryLinesRepository = journalEntryLinesRepository;
        this.dataSource = dataSource;
    }
    async create(createAccountDto) {
        const scopedPropertyId = createAccountDto.propertyId || null;
        const existingAccount = await this.accountsRepository.findOne({
            where: {
                accountCode: createAccountDto.accountCode,
                isActive: true,
                propertyId: scopedPropertyId,
            },
        });
        if (existingAccount) {
            const scope = scopedPropertyId ? 'this project' : 'the company-wide scope';
            throw new common_1.BadRequestException(`Account with code ${createAccountDto.accountCode} already exists in ${scope}`);
        }
        if (createAccountDto.parentAccountId) {
            const parentAccount = await this.accountsRepository.findOne({
                where: { id: createAccountDto.parentAccountId },
            });
            if (!parentAccount) {
                throw new common_1.NotFoundException(`Parent account not found`);
            }
        }
        const account = this.accountsRepository.create({
            ...createAccountDto,
            currentBalance: createAccountDto.openingBalance || 0,
        });
        return await this.accountsRepository.save(account);
    }
    async findAll(filters, scopePropertyIds) {
        const query = this.accountsRepository.createQueryBuilder('account')
            .leftJoinAndSelect('account.property', 'property');
        if (filters?.accountType) {
            query.andWhere('account.accountType = :accountType', {
                accountType: filters.accountType,
            });
        }
        const isActiveFilter = filters?.isActive !== undefined ? filters.isActive : true;
        query.andWhere('account.isActive = :isActive', { isActive: isActiveFilter });
        if (filters?.parentAccountId) {
            query.andWhere('account.parentAccountId = :parentAccountId', {
                parentAccountId: filters.parentAccountId,
            });
        }
        if (filters?.propertyId) {
            if (filters.projectOnlyCoa) {
                query.andWhere('account.propertyId = :propertyId', { propertyId: filters.propertyId });
            }
            else {
                query.andWhere('(account.propertyId IS NULL OR account.propertyId = :propertyId)', {
                    propertyId: filters.propertyId,
                });
            }
        }
        if (scopePropertyIds?.length) {
            query.andWhere('(account.propertyId IS NULL OR account.propertyId IN (:...scopePropertyIds))', { scopePropertyIds });
        }
        query.orderBy('account.accountCode', 'ASC');
        const rows = await query.getMany();
        if (filters?.propertyId) {
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const netMap = await this.journalNetMapForSingleProjectView(filters.propertyId, { to: end }, [
                account_entity_1.AccountType.ASSET,
                account_entity_1.AccountType.LIABILITY,
                account_entity_1.AccountType.EQUITY,
                account_entity_1.AccountType.INCOME,
                account_entity_1.AccountType.EXPENSE,
            ]);
            return rows.map((a) => {
                const jeNet = netMap.get(a.id) ?? 0;
                return Object.assign(Object.create(Object.getPrototypeOf(a)), a, {
                    currentBalance: Math.round(jeNet * 100) / 100,
                });
            });
        }
        return rows;
    }
    async findOne(id, overlayPropertyId) {
        const account = await this.accountsRepository.findOne({
            where: { id },
            relations: ['parentAccount', 'childAccounts'],
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
        }
        if (overlayPropertyId) {
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const netMap = await this.journalNetMapForSingleProjectView(overlayPropertyId, { to: end }, [
                account_entity_1.AccountType.ASSET,
                account_entity_1.AccountType.LIABILITY,
                account_entity_1.AccountType.EQUITY,
                account_entity_1.AccountType.INCOME,
                account_entity_1.AccountType.EXPENSE,
            ]);
            const jeNet = netMap.get(account.id) ?? 0;
            return Object.assign(Object.create(Object.getPrototypeOf(account)), account, {
                currentBalance: Math.round(jeNet * 100) / 100,
            });
        }
        return account;
    }
    async findByCode(accountCode) {
        const account = await this.accountsRepository.findOne({
            where: { accountCode },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account with code ${accountCode} not found`);
        }
        return account;
    }
    async update(id, updateAccountDto) {
        const account = await this.findOne(id);
        Object.assign(account, updateAccountDto);
        return await this.accountsRepository.save(account);
    }
    async bulkImport(rows, scopePropertyId) {
        if (!Array.isArray(rows) || !rows.length) {
            throw new common_1.BadRequestException('Provide at least one account row to import.');
        }
        const ALLOWED = new Set(Object.values(account_entity_1.AccountType));
        const scopedPropertyId = scopePropertyId || null;
        const existing = await this.accountsRepository
            .createQueryBuilder('a')
            .select(['a.accountCode'])
            .where('a.propertyId IS NOT DISTINCT FROM :pid', { pid: scopedPropertyId })
            .getMany();
        const existingCodes = new Set(existing.map((a) => a.accountCode));
        const seenInBatch = new Set();
        const errors = [];
        const toCreate = [];
        rows.forEach((row, idx) => {
            const humanRow = idx + 2;
            const code = String(row.accountCode || '').trim();
            const name = String(row.accountName || '').trim();
            const type = String(row.accountType || '').trim().toUpperCase();
            const category = String(row.accountCategory || '').trim();
            if (!code) {
                errors.push({ row: humanRow, code: '', message: 'Missing accountCode' });
                return;
            }
            if (!name) {
                errors.push({ row: humanRow, code, message: 'Missing accountName' });
                return;
            }
            if (!ALLOWED.has(type)) {
                errors.push({
                    row: humanRow,
                    code,
                    message: `Invalid accountType "${type}". Use one of ${[...ALLOWED].join(', ')}`,
                });
                return;
            }
            if (!category) {
                errors.push({ row: humanRow, code, message: 'Missing accountCategory' });
                return;
            }
            if (existingCodes.has(code) || seenInBatch.has(code)) {
                errors.push({ row: humanRow, code, message: 'Already exists - skipped' });
                return;
            }
            seenInBatch.add(code);
            toCreate.push({
                accountCode: code,
                accountName: name,
                accountType: type,
                accountCategory: category,
                description: row.description?.toString().trim() || null,
                openingBalance: Number(row.openingBalance) || 0,
                currentBalance: Number(row.openingBalance) || 0,
                propertyId: scopedPropertyId,
                isActive: true,
            });
        });
        if (!toCreate.length) {
            return { created: 0, skipped: rows.length, errors, createdIds: [] };
        }
        const saved = await this.accountsRepository.save(toCreate.map((r) => this.accountsRepository.create(r)));
        return {
            created: saved.length,
            skipped: rows.length - saved.length,
            errors,
            createdIds: saved.map((s) => s.id),
        };
    }
    async remove(id) {
        const account = await this.findOne(id);
        const childAccounts = await this.accountsRepository.count({
            where: { parentAccountId: id },
        });
        if (childAccounts > 0) {
            throw new common_1.BadRequestException('Cannot delete account with child accounts');
        }
        account.isActive = false;
        await this.accountsRepository.save(account);
    }
    async getAccountHierarchy(scopePropertyIds) {
        const qb = this.accountsRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.childAccounts', 'childAccounts')
            .where('account.isActive = :ia', { ia: true })
            .andWhere('account.parentAccountId IS NULL');
        if (scopePropertyIds?.length) {
            qb.andWhere('(account.propertyId IS NULL OR account.propertyId IN (:...scopePropertyIds))', { scopePropertyIds });
        }
        qb.orderBy('account.accountCode', 'ASC');
        return qb.getMany();
    }
    async findAccountsByTypeAndPropertyScope(accountType, propertyId) {
        const qb = this.accountsRepository
            .createQueryBuilder('account')
            .where('account.accountType = :type', { type: accountType })
            .andWhere('account.isActive = :ia', { ia: true });
        if (propertyId) {
            qb.andWhere('(account.propertyId IS NULL OR account.propertyId = :pid)', { pid: propertyId });
        }
        qb.orderBy('account.accountCode', 'ASC');
        return qb.getMany();
    }
    indiaFYStartDate(ref) {
        const y = ref.getFullYear();
        const m = ref.getMonth();
        const fyYear = m < 3 ? y - 1 : y;
        return new Date(fyYear, 3, 1);
    }
    async aggregateJournalNetByAccount(range, types, scope) {
        const params = [journal_entry_entity_1.JournalEntryStatus.POSTED];
        let cond = 'WHERE je.status = $1';
        let n = 2;
        if (scope.kind === 'single') {
            cond += ` AND je.property_id = $${n}`;
            params.push(scope.propertyId);
            n++;
        }
        else if (scope.restrictJournalPropertyIds?.length) {
            cond += ` AND (je.property_id IS NULL OR je.property_id = ANY($${n}::uuid[]))`;
            params.push(scope.restrictJournalPropertyIds);
            n++;
        }
        if (range.from) {
            cond += ` AND je.entry_date >= $${n}`;
            params.push(range.from);
            n++;
        }
        if (range.to) {
            cond += ` AND je.entry_date <= $${n}`;
            params.push(range.to);
            n++;
        }
        const typePlaceholders = types.map((_, i) => `$${n + i}`).join(', ');
        types.forEach((t) => params.push(t));
        const sql = `
      SELECT account.id AS id,
        SUM(
          CASE
            WHEN account.account_type IN ('ASSET', 'EXPENSE') THEN line.debit_amount - line.credit_amount
            ELSE line.credit_amount - line.debit_amount
          END
        )::float AS net
      FROM journal_entry_lines line
      INNER JOIN journal_entries je ON je.id = line.journal_entry_id
      INNER JOIN accounts account ON account.id = line.account_id
      ${cond}
        AND account.account_type IN (${typePlaceholders})
      GROUP BY account.id
    `;
        const rows = await this.dataSource.query(sql, params);
        const map = new Map();
        for (const r of rows) {
            map.set(r.id, Number(r.net) || 0);
        }
        return map;
    }
    async aggregateJournalNetForAccountsOwnedByProperty(range, types, propertyId) {
        const params = [journal_entry_entity_1.JournalEntryStatus.POSTED, propertyId];
        let cond = 'WHERE je.status = $1 AND account.property_id = $2';
        let n = 3;
        if (range.from) {
            cond += ` AND je.entry_date >= $${n}`;
            params.push(range.from);
            n++;
        }
        if (range.to) {
            cond += ` AND je.entry_date <= $${n}`;
            params.push(range.to);
            n++;
        }
        const typePlaceholders = types.map((_, i) => `$${n + i}`).join(', ');
        types.forEach((t) => params.push(t));
        const sql = `
      SELECT account.id AS id,
        SUM(
          CASE
            WHEN account.account_type IN ('ASSET', 'EXPENSE') THEN line.debit_amount - line.credit_amount
            ELSE line.credit_amount - line.debit_amount
          END
        )::float AS net
      FROM journal_entry_lines line
      INNER JOIN journal_entries je ON je.id = line.journal_entry_id
      INNER JOIN accounts account ON account.id = line.account_id
      ${cond}
        AND account.account_type IN (${typePlaceholders})
      GROUP BY account.id
    `;
        const rows = await this.dataSource.query(sql, params);
        const map = new Map();
        for (const r of rows) {
            map.set(r.id, Number(r.net) || 0);
        }
        return map;
    }
    async journalNetMapForSingleProjectView(propertyId, range, types) {
        const [strict, owned] = await Promise.all([
            this.aggregateJournalNetByAccount(range, types, { kind: 'single', propertyId }),
            this.aggregateJournalNetForAccountsOwnedByProperty(range, types, propertyId),
        ]);
        const merged = new Map(strict);
        for (const [id, v] of owned) {
            merged.set(id, v);
        }
        return merged;
    }
    async accountsWithScopedBalances(netById) {
        const ids = [...netById.keys()];
        if (!ids.length)
            return [];
        const found = await this.accountsRepository.find({
            where: { id: (0, typeorm_2.In)(ids), isActive: true },
            order: { accountCode: 'ASC' },
        });
        return found.map((a) => Object.assign(Object.create(Object.getPrototypeOf(a)), a, {
            currentBalance: netById.get(a.id) ?? 0,
        }));
    }
    async getBalanceSheet(scope) {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const netMap = scope.kind === 'single'
            ? await this.journalNetMapForSingleProjectView(scope.propertyId, { to: end }, [
                account_entity_1.AccountType.ASSET,
                account_entity_1.AccountType.LIABILITY,
                account_entity_1.AccountType.EQUITY,
            ])
            : await this.aggregateJournalNetByAccount({ to: end }, [account_entity_1.AccountType.ASSET, account_entity_1.AccountType.LIABILITY, account_entity_1.AccountType.EQUITY], scope);
        const withBal = await this.accountsWithScopedBalances(netMap);
        const assets = withBal.filter((a) => a.accountType === account_entity_1.AccountType.ASSET);
        const liabilities = withBal.filter((a) => a.accountType === account_entity_1.AccountType.LIABILITY);
        const equity = withBal.filter((a) => a.accountType === account_entity_1.AccountType.EQUITY);
        const totalAssets = assets.reduce((s, a) => s + Number(a.currentBalance), 0);
        const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.currentBalance), 0);
        const totalEquity = equity.reduce((s, a) => s + Number(a.currentBalance), 0);
        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity,
        };
    }
    async getProfitAndLoss(startDate, endDate, scope) {
        const rangeEnd = endDate ?? new Date();
        rangeEnd.setHours(23, 59, 59, 999);
        const rangeStart = startDate ?? this.indiaFYStartDate(rangeEnd);
        const netMap = scope.kind === 'single'
            ? await this.journalNetMapForSingleProjectView(scope.propertyId, { from: rangeStart, to: rangeEnd }, [
                account_entity_1.AccountType.INCOME,
                account_entity_1.AccountType.EXPENSE,
            ])
            : await this.aggregateJournalNetByAccount({ from: rangeStart, to: rangeEnd }, [account_entity_1.AccountType.INCOME, account_entity_1.AccountType.EXPENSE], scope);
        const withBal = await this.accountsWithScopedBalances(netMap);
        const income = withBal.filter((a) => a.accountType === account_entity_1.AccountType.INCOME);
        const expenses = withBal.filter((a) => a.accountType === account_entity_1.AccountType.EXPENSE);
        const totalIncome = income.reduce((s, a) => s + Number(a.currentBalance), 0);
        const totalExpenses = expenses.reduce((s, a) => s + Number(a.currentBalance), 0);
        const netProfit = totalIncome - totalExpenses;
        return { income, expenses, totalIncome, totalExpenses, netProfit };
    }
    async getTrialBalance(scope) {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const types = [
            account_entity_1.AccountType.ASSET,
            account_entity_1.AccountType.LIABILITY,
            account_entity_1.AccountType.EQUITY,
            account_entity_1.AccountType.INCOME,
            account_entity_1.AccountType.EXPENSE,
        ];
        const netMap = scope.kind === 'single'
            ? await this.journalNetMapForSingleProjectView(scope.propertyId, { to: end }, types)
            : await this.aggregateJournalNetByAccount({ to: end }, types, scope);
        const qb = this.accountsRepository.createQueryBuilder('account').where('account.isActive = :ia', { ia: true });
        if (scope.kind === 'single') {
            qb.andWhere('(account.propertyId IS NULL OR account.propertyId = :pid)', { pid: scope.propertyId });
        }
        else if (scope.restrictJournalPropertyIds?.length) {
            qb.andWhere('(account.propertyId IS NULL OR account.propertyId IN (:...pids))', {
                pids: scope.restrictJournalPropertyIds,
            });
        }
        qb.orderBy('account.accountCode', 'ASC');
        const allAccounts = await qb.getMany();
        const trialBalanceRows = allAccounts.map((account) => {
            const balance = Number(netMap.get(account.id) ?? 0);
            const isDebitNormal = [account_entity_1.AccountType.ASSET, account_entity_1.AccountType.EXPENSE].includes(account.accountType);
            return {
                accountCode: account.accountCode,
                accountName: account.accountName,
                accountType: account.accountType,
                debitBalance: isDebitNormal ? (balance > 0 ? balance : 0) : balance < 0 ? Math.abs(balance) : 0,
                creditBalance: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : balance > 0 ? balance : 0,
            };
        });
        const totalDebit = trialBalanceRows.reduce((sum, row) => sum + row.debitBalance, 0);
        const totalCredit = trialBalanceRows.reduce((sum, row) => sum + row.creditBalance, 0);
        return {
            accounts: trialBalanceRows,
            totalDebit,
            totalCredit,
            isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        };
    }
    async getPropertyWisePL(propertyId) {
        const incomeLines = await this.journalEntryLinesRepository
            .createQueryBuilder('line')
            .leftJoinAndSelect('line.account', 'account')
            .leftJoin('line.journalEntry', 'entry')
            .where('entry.referenceType = :refType', { refType: 'PROPERTY' })
            .andWhere('entry.referenceId = :propertyId', { propertyId })
            .andWhere('entry.status = :status', { status: journal_entry_entity_1.JournalEntryStatus.POSTED })
            .andWhere('account.accountType = :type', { type: account_entity_1.AccountType.INCOME })
            .getMany();
        const expenseLines = await this.journalEntryLinesRepository
            .createQueryBuilder('line')
            .leftJoinAndSelect('line.account', 'account')
            .leftJoin('line.journalEntry', 'entry')
            .where('entry.referenceType = :refType', { refType: 'PROPERTY' })
            .andWhere('entry.referenceId = :propertyId', { propertyId })
            .andWhere('entry.status = :status', { status: journal_entry_entity_1.JournalEntryStatus.POSTED })
            .andWhere('account.accountType = :type', { type: account_entity_1.AccountType.EXPENSE })
            .getMany();
        const aggregateByAccount = (lines) => {
            const map = new Map();
            for (const line of lines) {
                const key = line.accountId;
                const existing = map.get(key);
                const net = Number(line.creditAmount) - Number(line.debitAmount);
                if (existing) {
                    existing.amount += net;
                }
                else {
                    map.set(key, {
                        accountName: line.account?.accountName || key,
                        accountCode: line.account?.accountCode || '',
                        amount: net,
                    });
                }
            }
            return Array.from(map.values());
        };
        const income = aggregateByAccount(incomeLines);
        const expenses = aggregateByAccount(expenseLines).map(e => ({ ...e, amount: Math.abs(e.amount) }));
        const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        return {
            propertyId,
            income,
            expenses,
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
        };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(1, (0, typeorm_1.InjectRepository)(journal_entry_line_entity_1.JournalEntryLine)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map