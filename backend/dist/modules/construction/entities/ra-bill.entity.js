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
exports.RABill = exports.RABillStatus = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const vendor_entity_1 = require("../../vendors/entities/vendor.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var RABillStatus;
(function (RABillStatus) {
    RABillStatus["DRAFT"] = "DRAFT";
    RABillStatus["SUBMITTED"] = "SUBMITTED";
    RABillStatus["CERTIFIED"] = "CERTIFIED";
    RABillStatus["APPROVED"] = "APPROVED";
    RABillStatus["PAID"] = "PAID";
    RABillStatus["REJECTED"] = "REJECTED";
})(RABillStatus || (exports.RABillStatus = RABillStatus = {}));
let RABill = class RABill {
};
exports.RABill = RABill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RABill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ra_bill_number', type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], RABill.prototype, "raBillNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }),
    __metadata("design:type", String)
], RABill.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], RABill.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], RABill.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], RABill.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], RABill.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bill_date', type: 'date' }),
    __metadata("design:type", Date)
], RABill.prototype, "billDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bill_period_start', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], RABill.prototype, "billPeriodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bill_period_end', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], RABill.prototype, "billPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_description', type: 'text' }),
    __metadata("design:type", String)
], RABill.prototype, "workDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gross_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "grossAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_bills_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "previousBillsAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_this_bill', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "netThisBill", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retention_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "retentionPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retention_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "retentionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'advance_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "advanceDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'other_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "otherDeductions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'other_deductions_description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "otherDeductionsDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_payable', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RABill.prototype, "netPayable", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: RABillStatus.DRAFT,
    }),
    __metadata("design:type", String)
], RABill.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certified_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "certifiedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'certified_by' }),
    __metadata("design:type", user_entity_1.User)
], RABill.prototype, "certifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'certified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RABill.prototype, "certifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", user_entity_1.User)
], RABill.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RABill.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RABill.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], RABill.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'journal_entry_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RABill.prototype, "journalEntryId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RABill.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], RABill.prototype, "updatedAt", void 0);
exports.RABill = RABill = __decorate([
    (0, typeorm_1.Entity)('ra_bills')
], RABill);
//# sourceMappingURL=ra-bill.entity.js.map