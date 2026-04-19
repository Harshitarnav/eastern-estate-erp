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
var AccountsBootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("./entities/account.entity");
let AccountsBootstrapService = AccountsBootstrapService_1 = class AccountsBootstrapService {
    constructor(accountsRepo) {
        this.accountsRepo = accountsRepo;
        this.logger = new common_1.Logger(AccountsBootstrapService_1.name);
    }
    async onModuleInit() {
        try {
            await this.ensureDefaults();
        }
        catch (err) {
            this.logger.error(`Failed to ensure default Chart of Accounts: ${err?.message ?? err}`);
        }
    }
    async ensureDefaults() {
        const required = [
            {
                label: 'Bank / Cash (ASSET)',
                code: '1001',
                name: 'Bank Account',
                type: account_entity_1.AccountType.ASSET,
                category: 'Current Assets',
                namePatterns: ['%bank%', '%cash%'],
            },
            {
                label: 'Sales Revenue (INCOME)',
                code: '4001',
                name: 'Sales Revenue',
                type: account_entity_1.AccountType.INCOME,
                category: 'Revenue',
                namePatterns: ['%sales%', '%revenue%', '%income%'],
            },
        ];
        const created = [];
        const present = [];
        for (const def of required) {
            const existing = await this.findMatching(def.type, def.namePatterns);
            if (existing) {
                present.push(`${def.label} → ${existing.accountCode} ${existing.accountName}`);
                continue;
            }
            const freshCode = await this.pickFreeCode(def.code);
            const account = this.accountsRepo.create({
                accountCode: freshCode,
                accountName: def.name,
                accountType: def.type,
                accountCategory: def.category,
                isActive: true,
                openingBalance: 0,
                currentBalance: 0,
                propertyId: null,
                description: 'Auto-created default required by the accounting integration ' +
                    '(payment / expense / vendor-bill JE posting). Safe to rename, ' +
                    'but do not delete or deactivate unless another account of the ' +
                    'same type exists.',
            });
            await this.accountsRepo.save(account);
            created.push(`${def.label} → ${freshCode} ${def.name}`);
        }
        if (created.length > 0) {
            this.logger.log(`Seeded default Chart of Accounts entries: ${created.join(' | ')}`);
        }
        if (present.length > 0) {
            this.logger.log(`Default Chart of Accounts entries already present: ${present.join(' | ')}`);
        }
    }
    async findMatching(type, patterns) {
        for (const pattern of patterns) {
            const match = await this.accountsRepo.findOne({
                where: {
                    accountType: type,
                    isActive: true,
                    accountName: (0, typeorm_2.ILike)(pattern),
                },
                order: { accountCode: 'ASC' },
            });
            if (match)
                return match;
        }
        const any = await this.accountsRepo.findOne({
            where: { accountType: type, isActive: true },
            order: { accountCode: 'ASC' },
        });
        return any ?? null;
    }
    async pickFreeCode(preferred) {
        const base = preferred.replace(/\d+$/, '');
        const startNumMatch = preferred.match(/\d+$/);
        let n = startNumMatch ? parseInt(startNumMatch[0], 10) : 1;
        const width = startNumMatch?.[0].length ?? 4;
        for (let i = 0; i < 50; i += 1) {
            const candidate = `${base}${String(n + i).padStart(width, '0')}`;
            const taken = await this.accountsRepo.findOne({
                where: { accountCode: candidate, propertyId: (0, typeorm_2.IsNull)() },
            });
            if (!taken)
                return candidate;
        }
        return `${preferred}-${Date.now().toString().slice(-5)}`;
    }
};
exports.AccountsBootstrapService = AccountsBootstrapService;
exports.AccountsBootstrapService = AccountsBootstrapService = AccountsBootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AccountsBootstrapService);
//# sourceMappingURL=accounts.bootstrap.service.js.map