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
exports.BankStatement = void 0;
const typeorm_1 = require("typeorm");
const bank_account_entity_1 = require("./bank-account.entity");
let BankStatement = class BankStatement {
};
exports.BankStatement = BankStatement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BankStatement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_id' }),
    __metadata("design:type", String)
], BankStatement.prototype, "bankAccountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount),
    (0, typeorm_1.JoinColumn)({ name: 'bank_account_id' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], BankStatement.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'statement_date', type: 'date' }),
    __metadata("design:type", Date)
], BankStatement.prototype, "statementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_date', type: 'date' }),
    __metadata("design:type", Date)
], BankStatement.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id' }),
    __metadata("design:type", String)
], BankStatement.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BankStatement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', nullable: true }),
    __metadata("design:type", String)
], BankStatement.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        name: 'debit_amount',
        default: 0,
    }),
    __metadata("design:type", Number)
], BankStatement.prototype, "debitAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        name: 'credit_amount',
        default: 0,
    }),
    __metadata("design:type", Number)
], BankStatement.prototype, "creditAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], BankStatement.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_type', nullable: true }),
    __metadata("design:type", String)
], BankStatement.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_reconciled', default: false }),
    __metadata("design:type", Boolean)
], BankStatement.prototype, "isReconciled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciled_with_entry_id', nullable: true }),
    __metadata("design:type", String)
], BankStatement.prototype, "reconciledWithEntryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciled_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BankStatement.prototype, "reconciledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploaded_file', nullable: true }),
    __metadata("design:type", String)
], BankStatement.prototype, "uploadedFile", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BankStatement.prototype, "createdAt", void 0);
exports.BankStatement = BankStatement = __decorate([
    (0, typeorm_1.Entity)('bank_statements')
], BankStatement);
//# sourceMappingURL=bank-statement.entity.js.map