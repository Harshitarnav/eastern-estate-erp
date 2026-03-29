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
var BankAccountsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("./entities/bank-account.entity");
const account_entity_1 = require("./entities/account.entity");
let BankAccountsService = BankAccountsService_1 = class BankAccountsService {
    constructor(bankAccountsRepo, accountsRepo) {
        this.bankAccountsRepo = bankAccountsRepo;
        this.accountsRepo = accountsRepo;
        this.logger = new common_1.Logger(BankAccountsService_1.name);
    }
    async findAll() {
        const bankAccounts = await this.bankAccountsRepo.find({ order: { createdAt: 'ASC' } });
        return Promise.all(bankAccounts.map(async (ba) => {
            const coaAccount = await this.accountsRepo.findOne({
                where: { accountName: ba.accountName, accountType: account_entity_1.AccountType.ASSET },
                select: ['id', 'accountCode'],
            });
            return Object.assign(ba, { coaAccount: coaAccount ? { id: coaAccount.id, accountCode: coaAccount.accountCode } : null });
        }));
    }
    async findOne(id) {
        const account = await this.bankAccountsRepo.findOne({ where: { id } });
        if (!account)
            throw new common_1.NotFoundException(`Bank account ${id} not found`);
        return account;
    }
    async nextBankAccountCode() {
        const rows = await this.accountsRepo
            .createQueryBuilder('a')
            .select('a.accountCode', 'code')
            .where('a.accountCode ~ :pattern', { pattern: '^12[0-9]+$' })
            .getRawMany();
        let nextNum = 1200;
        for (const { code } of rows) {
            const parsed = parseInt(code, 10);
            if (!isNaN(parsed) && parsed >= nextNum)
                nextNum = parsed + 1;
        }
        return String(nextNum);
    }
    async ensureCOAAccount(bankAccount) {
        const existing = await this.accountsRepo
            .createQueryBuilder('a')
            .where('LOWER(a.accountName) = LOWER(:name)', { name: bankAccount.accountName })
            .andWhere('a.accountType = :type', { type: account_entity_1.AccountType.ASSET })
            .getOne();
        if (existing) {
            this.logger.log(`COA account already exists for "${bankAccount.accountName}" (code: ${existing.accountCode})`);
            return existing;
        }
        const code = await this.nextBankAccountCode();
        const coaAccount = this.accountsRepo.create({
            accountCode: code,
            accountName: bankAccount.accountName,
            accountType: account_entity_1.AccountType.ASSET,
            accountCategory: 'Bank',
            openingBalance: Number(bankAccount.openingBalance) || 0,
            currentBalance: Number(bankAccount.currentBalance) || 0,
            description: `Auto-created for bank account: ${bankAccount.bankName} (${bankAccount.accountNumber})`,
            isActive: true,
        });
        const saved = await this.accountsRepo.save(coaAccount);
        this.logger.log(`COA account created for "${bankAccount.accountName}" with code ${code}`);
        return saved;
    }
    async create(dto) {
        const ob = Number(dto.openingBalance) || 0;
        const account = this.bankAccountsRepo.create({
            accountName: dto.accountName,
            bankName: dto.bankName,
            accountNumber: dto.accountNumber,
            ifscCode: dto.ifscCode,
            branchName: dto.branchName,
            accountType: dto.accountType || 'Current',
            openingBalance: ob,
            currentBalance: ob,
            description: dto.description,
        });
        const saved = await this.bankAccountsRepo.save(account);
        let coaAccount = null;
        try {
            coaAccount = await this.ensureCOAAccount(saved);
        }
        catch (err) {
            this.logger.error(`Failed to create COA entry for "${saved.accountName}": ${err?.message}`);
        }
        return Object.assign(saved, { coaAccount: coaAccount ? { id: coaAccount.id, accountCode: coaAccount.accountCode } : null });
    }
    async update(id, dto) {
        const account = await this.findOne(id);
        const oldName = account.accountName;
        Object.assign(account, dto);
        const saved = await this.bankAccountsRepo.save(account);
        if (dto.accountName && dto.accountName !== oldName) {
            const coaAccount = await this.accountsRepo
                .createQueryBuilder('a')
                .where('LOWER(a.accountName) = LOWER(:name)', { name: oldName })
                .andWhere('a.accountType = :type', { type: account_entity_1.AccountType.ASSET })
                .getOne();
            if (coaAccount) {
                coaAccount.accountName = dto.accountName;
                await this.accountsRepo.save(coaAccount);
                this.logger.log(`COA account renamed from "${oldName}" to "${dto.accountName}" (code: ${coaAccount.accountCode})`);
            }
        }
        try {
            await this.ensureCOAAccount(saved);
        }
        catch (err) {
            this.logger.error(`Failed to ensure COA entry for "${saved.accountName}": ${err?.message}`);
        }
        return saved;
    }
    async deactivate(id) {
        const account = await this.findOne(id);
        account.isActive = false;
        return this.bankAccountsRepo.save(account);
    }
    async activate(id) {
        const account = await this.findOne(id);
        account.isActive = true;
        return this.bankAccountsRepo.save(account);
    }
    async delete(id) {
        const account = await this.findOne(id);
        await this.bankAccountsRepo.remove(account);
        return { message: 'Bank account deleted successfully' };
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = BankAccountsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BankAccountsService);
//# sourceMappingURL=bank-accounts.service.js.map