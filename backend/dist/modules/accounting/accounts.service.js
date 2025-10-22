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
let AccountsService = class AccountsService {
    constructor(accountsRepository) {
        this.accountsRepository = accountsRepository;
    }
    async create(createAccountDto) {
        const existingAccount = await this.accountsRepository.findOne({
            where: { accountCode: createAccountDto.accountCode },
        });
        if (existingAccount) {
            throw new common_1.BadRequestException(`Account with code ${createAccountDto.accountCode} already exists`);
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
    async findAll(filters) {
        const query = this.accountsRepository.createQueryBuilder('account');
        if (filters?.accountType) {
            query.andWhere('account.accountType = :accountType', {
                accountType: filters.accountType,
            });
        }
        if (filters?.isActive !== undefined) {
            query.andWhere('account.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }
        if (filters?.parentAccountId) {
            query.andWhere('account.parentAccountId = :parentAccountId', {
                parentAccountId: filters.parentAccountId,
            });
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
    async getAccountHierarchy() {
        const accounts = await this.accountsRepository.find({
            where: { isActive: true },
            relations: ['childAccounts'],
            order: { accountCode: 'ASC' },
        });
        return accounts.filter(account => !account.parentAccountId);
    }
    async getBalanceSheet() {
        const assets = await this.accountsRepository.find({
            where: { accountType: account_entity_1.AccountType.ASSET, isActive: true },
            order: { accountCode: 'ASC' },
        });
        const liabilities = await this.accountsRepository.find({
            where: { accountType: account_entity_1.AccountType.LIABILITY, isActive: true },
            order: { accountCode: 'ASC' },
        });
        const equity = await this.accountsRepository.find({
            where: { accountType: account_entity_1.AccountType.EQUITY, isActive: true },
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
    async getProfitAndLoss(startDate, endDate) {
        const income = await this.accountsRepository.find({
            where: { accountType: account_entity_1.AccountType.INCOME, isActive: true },
            order: { accountCode: 'ASC' },
        });
        const expenses = await this.accountsRepository.find({
            where: { accountType: account_entity_1.AccountType.EXPENSE, isActive: true },
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
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map