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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.AccountType = void 0;
const typeorm_1 = require("typeorm");
var AccountType;
(function (AccountType) {
    AccountType["ASSET"] = "ASSET";
    AccountType["LIABILITY"] = "LIABILITY";
    AccountType["EQUITY"] = "EQUITY";
    AccountType["INCOME"] = "INCOME";
    AccountType["EXPENSE"] = "EXPENSE";
})(AccountType || (exports.AccountType = AccountType = {}));
let Account = class Account {
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_code', unique: true, length: 50 }),
    __metadata("design:type", String)
], Account.prototype, "accountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', length: 200 }),
    __metadata("design:type", String)
], Account.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_type',
        type: 'enum',
        enum: AccountType,
    }),
    __metadata("design:type", String)
], Account.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_category', length: 100 }),
    __metadata("design:type", String)
], Account.prototype, "accountCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_account_id', nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "parentAccountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Account, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_account_id' }),
    __metadata("design:type", Account)
], Account.prototype, "parentAccount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Account, (account) => account.parentAccount),
    __metadata("design:type", Array)
], Account.prototype, "childAccounts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Account.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { name: 'opening_balance', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { name: 'current_balance', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Account.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Account.prototype, "updatedAt", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)('accounts')
], Account);
//# sourceMappingURL=account.entity.js.map