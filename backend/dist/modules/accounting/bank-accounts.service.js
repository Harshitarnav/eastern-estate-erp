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
exports.BankAccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("./entities/bank-account.entity");
let BankAccountsService = class BankAccountsService {
    constructor(bankAccountsRepo) {
        this.bankAccountsRepo = bankAccountsRepo;
    }
    findAll() {
        return this.bankAccountsRepo.find({ order: { createdAt: 'ASC' } });
    }
    async findOne(id) {
        const account = await this.bankAccountsRepo.findOne({ where: { id } });
        if (!account)
            throw new common_1.NotFoundException(`Bank account ${id} not found`);
        return account;
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
        return this.bankAccountsRepo.save(account);
    }
    async update(id, dto) {
        const account = await this.findOne(id);
        Object.assign(account, dto);
        return this.bankAccountsRepo.save(account);
    }
    async deactivate(id) {
        const account = await this.findOne(id);
        account.isActive = false;
        return this.bankAccountsRepo.save(account);
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BankAccountsService);
//# sourceMappingURL=bank-accounts.service.js.map