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
exports.BankAccount = void 0;
const typeorm_1 = require("typeorm");
let BankAccount = class BankAccount {
};
exports.BankAccount = BankAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BankAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_number', unique: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name' }),
    __metadata("design:type", String)
], BankAccount.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name' }),
    __metadata("design:type", String)
], BankAccount.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'branch_name' }),
    __metadata("design:type", String)
], BankAccount.prototype, "branchName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ifsc_code' }),
    __metadata("design:type", String)
], BankAccount.prototype, "ifscCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_type' }),
    __metadata("design:type", String)
], BankAccount.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        name: 'opening_balance',
        default: 0,
    }),
    __metadata("design:type", Number)
], BankAccount.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        name: 'current_balance',
        default: 0,
    }),
    __metadata("design:type", Number)
], BankAccount.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], BankAccount.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BankAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BankAccount.prototype, "updatedAt", void 0);
exports.BankAccount = BankAccount = __decorate([
    (0, typeorm_1.Entity)('bank_accounts')
], BankAccount);
//# sourceMappingURL=bank-account.entity.js.map