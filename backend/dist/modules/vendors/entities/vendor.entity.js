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
exports.Vendor = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let Vendor = class Vendor {
    get availableCredit() {
        return Number(this.creditLimit) - Number(this.outstandingAmount);
    }
    get isCreditLimitExceeded() {
        return Number(this.outstandingAmount) > Number(this.creditLimit);
    }
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_code', unique: true, length: 50 }),
    __metadata("design:type", String)
], Vendor.prototype, "vendorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_name', length: 255 }),
    __metadata("design:type", String)
], Vendor.prototype, "vendorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_person', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', length: 20 }),
    __metadata("design:type", String)
], Vendor.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alternate_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "alternatePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gst_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "gstNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pan_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "panNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ifsc_code', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "ifscCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'materials_supplied', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Vendor.prototype, "materialsSupplied", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_terms', length: 255, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'outstanding_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "outstandingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Vendor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Vendor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Vendor.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", user_entity_1.User)
], Vendor.prototype, "updater", void 0);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)('vendors')
], Vendor);
//# sourceMappingURL=vendor.entity.js.map