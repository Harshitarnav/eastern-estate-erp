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
            query.andWhere('account.propertyId = :propertyId', {
                propertyId: filters.propertyId,
            });
        }
        if (scopePropertyIds?.length) {
            query.andWhere('(account.propertyId IS NULL OR account.propertyId IN (:...scopePropertyIds))', { scopePropertyIds });
        }
        query.orderBy('account.accountCode', 'ASC');
        return await query.getMany();
    }
    async findOne(id) {
        const account = await this.accountsRepository.findOne({
            where: { id },
            relations: ['parentAccount', 'childAccounts'],
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
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
    async getBalanceSheet(propertyId) {
        const scopeWhere = (type) => propertyId
            ? { accountType: type, isActive: true, propertyId }
            : { accountType: type, isActive: true };
        const assets = await this.accountsRepository.find({
            where: scopeWhere(account_entity_1.AccountType.ASSET),
            order: { accountCode: 'ASC' },
        });
        const liabilities = await this.accountsRepository.find({
            where: scopeWhere(account_entity_1.AccountType.LIABILITY),
            order: { accountCode: 'ASC' },
        });
        const equity = await this.accountsRepository.find({
            where: scopeWhere(account_entity_1.AccountType.EQUITY),
            order: { accountCode: 'ASC' },
        });
        const totalAssets = assets.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
        const totalLiabilities = liabilities.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
        const totalEquity = equity.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
        return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity,
        };
    }
    async getProfitAndLoss(startDate, endDate, propertyId) {
        const scopeWhere = (type) => propertyId
            ? { accountType: type, isActive: true, propertyId }
            : { accountType: type, isActive: true };
        const income = await this.accountsRepository.find({
            where: scopeWhere(account_entity_1.AccountType.INCOME),
            order: { accountCode: 'ASC' },
        });
        const expenses = await this.accountsRepository.find({
            where: scopeWhere(account_entity_1.AccountType.EXPENSE),
            order: { accountCode: 'ASC' },
        });
        const totalIncome = income.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
        const netProfit = totalIncome - totalExpenses;
        return {
            income,
            expenses,
            totalIncome,
            totalExpenses,
            netProfit,
        };
    }
    async getTrialBalance(propertyId) {
        const where = { isActive: true };
        if (propertyId)
            where.propertyId = propertyId;
        const allAccounts = await this.accountsRepository.find({
            where,
            order: { accountCode: 'ASC' },
        });
        const trialBalanceRows = allAccounts.map((account) => {
            const balance = Number(account.currentBalance);
            const isDebitNormal = [account_entity_1.AccountType.ASSET, account_entity_1.AccountType.EXPENSE].includes(account.accountType);
            return {
                accountCode: account.accountCode,
                accountName: account.accountName,
                accountType: account.accountType,
                debitBalance: isDebitNormal ? (balance > 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
                creditBalance: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance > 0 ? balance : 0),
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