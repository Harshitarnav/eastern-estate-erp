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
exports.Expense = exports.ExpenseStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
const account_entity_1 = require("./account.entity");
const journal_entry_entity_1 = require("./journal-entry.entity");
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["PENDING"] = "PENDING";
    ExpenseStatus["APPROVED"] = "APPROVED";
    ExpenseStatus["PAID"] = "PAID";
    ExpenseStatus["REJECTED"] = "REJECTED";
    ExpenseStatus["CANCELLED"] = "CANCELLED";
})(ExpenseStatus || (exports.ExpenseStatus = ExpenseStatus = {}));
let Expense = class Expense {
};
exports.Expense = Expense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Expense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_code', unique: true, length: 50 }),
    __metadata("design:type", String)
], Expense.prototype, "expenseCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_category', length: 100 }),
    __metadata("design:type", String)
], Expense.prototype, "expenseCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_type', length: 100 }),
    __metadata("design:type", String)
], Expense.prototype, "expenseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_sub_category', length: 100, nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "expenseSubCategory", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Expense.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_date', type: 'date' }),
    __metadata("design:type", Date)
], Expense.prototype, "expenseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], Expense.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], Expense.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', length: 50, nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_reference', length: 200, nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', length: 50, default: 'PENDING' }),
    __metadata("design:type", String)
], Expense.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "receiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', length: 100, nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Expense.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExpenseStatus,
        default: ExpenseStatus.PENDING,
    }),
    __metadata("design:type", String)
], Expense.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", user_entity_1.User)
], Expense.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Expense.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", account_entity_1.Account)
], Expense.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'journal_entry_id', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "journalEntryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => journal_entry_entity_1.JournalEntry, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'journal_entry_id' }),
    __metadata("design:type", journal_entry_entity_1.JournalEntry)
], Expense.prototype, "journalEntry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Expense.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Expense.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Expense.prototype, "updatedAt", void 0);
exports.Expense = Expense = __decorate([
    (0, typeorm_1.Entity)('expenses')
], Expense);
//# sourceMappingURL=expense.entity.js.map