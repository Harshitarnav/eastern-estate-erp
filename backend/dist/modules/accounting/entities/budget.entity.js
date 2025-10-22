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
exports.Budget = exports.BudgetStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const account_entity_1 = require("./account.entity");
var BudgetStatus;
(function (BudgetStatus) {
    BudgetStatus["DRAFT"] = "DRAFT";
    BudgetStatus["ACTIVE"] = "ACTIVE";
    BudgetStatus["CLOSED"] = "CLOSED";
    BudgetStatus["REVISED"] = "REVISED";
})(BudgetStatus || (exports.BudgetStatus = BudgetStatus = {}));
let Budget = class Budget {
};
exports.Budget = Budget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Budget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_name', length: 200 }),
    __metadata("design:type", String)
], Budget.prototype, "budgetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_code', unique: true, length: 50 }),
    __metadata("design:type", String)
], Budget.prototype, "budgetCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fiscal_year' }),
    __metadata("design:type", Number)
], Budget.prototype, "fiscalYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Budget.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], Budget.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", account_entity_1.Account)
], Budget.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { name: 'budgeted_amount', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Budget.prototype, "budgetedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { name: 'actual_amount', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "actualAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BudgetStatus,
        default: BudgetStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Budget.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Budget.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Budget.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Budget.prototype, "updatedAt", void 0);
exports.Budget = Budget = __decorate([
    (0, typeorm_1.Entity)('budgets')
], Budget);
//# sourceMappingURL=budget.entity.js.map