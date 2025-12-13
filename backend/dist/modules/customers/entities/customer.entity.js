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
exports.Customer = exports.PropertyPreference = exports.CustomerRequirementType = exports.KYCStatus = exports.CustomerType = void 0;
const typeorm_1 = require("typeorm");
var CustomerType;
(function (CustomerType) {
    CustomerType["INDIVIDUAL"] = "INDIVIDUAL";
    CustomerType["CORPORATE"] = "CORPORATE";
    CustomerType["NRI"] = "NRI";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["IN_PROGRESS"] = "IN_PROGRESS";
    KYCStatus["VERIFIED"] = "VERIFIED";
    KYCStatus["REJECTED"] = "REJECTED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
var CustomerRequirementType;
(function (CustomerRequirementType) {
    CustomerRequirementType["END_USER"] = "END_USER";
    CustomerRequirementType["INVESTOR"] = "INVESTOR";
    CustomerRequirementType["BOTH"] = "BOTH";
})(CustomerRequirementType || (exports.CustomerRequirementType = CustomerRequirementType = {}));
var PropertyPreference;
(function (PropertyPreference) {
    PropertyPreference["FLAT"] = "FLAT";
    PropertyPreference["DUPLEX"] = "DUPLEX";
    PropertyPreference["PENTHOUSE"] = "PENTHOUSE";
    PropertyPreference["VILLA"] = "VILLA";
    PropertyPreference["PLOT"] = "PLOT";
    PropertyPreference["COMMERCIAL"] = "COMMERCIAL";
    PropertyPreference["ANY"] = "ANY";
})(PropertyPreference || (exports.PropertyPreference = PropertyPreference = {}));
let Customer = class Customer {
    get firstName() {
        return this.fullName?.split(' ')[0] || this.legacyFirstName || '';
    }
    get lastName() {
        const parts = this.fullName?.split(' ') || [];
        return parts.slice(1).join(' ') || this.legacyLastName || '';
    }
    get phone() {
        return this.phoneNumber || this.legacyPhone;
    }
    get company() {
        return this.companyName;
    }
    get address() {
        return this.addressLine1;
    }
    get type() {
        return this.customerType;
    }
    get totalSpent() {
        return this.totalPurchases;
    }
    get lastBookingDate() {
        return this.metadata?.lastBookingDate || null;
    }
    set lastBookingDate(value) {
        if (!this.metadata) {
            this.metadata = {};
        }
        this.metadata.lastBookingDate = value;
    }
    get isVIP() {
        return this.metadata?.isVIP || false;
    }
    get designation() {
        return this.metadata?.designation || null;
    }
    get annualIncome() {
        return this.metadata?.annualIncome || null;
    }
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_code', length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "customerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "legacyFirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "legacyLastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "legacyPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alternate_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "alternatePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Customer.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "occupation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line2', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'India' }),
    __metadata("design:type", String)
], Customer.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pan_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "panNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aadhar_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "aadharNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_type', length: 50, default: 'INDIVIDUAL' }),
    __metadata("design:type", String)
], Customer.prototype, "customerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_source', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "leadSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_sales_person', length: 255, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "assignedSalesPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'outstanding_balance', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "outstandingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_bookings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "totalBookings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_purchases', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "totalPurchases", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kyc_status', length: 50, default: 'PENDING' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "kycStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kyc_documents', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "kycDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Customer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requirement_type', type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "requirementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_preference', type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "propertyPreference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tentative_purchase_timeframe', length: 100, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "tentativePurchaseTimeframe", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers'),
    (0, typeorm_1.Index)(['email']),
    (0, typeorm_1.Index)(['phoneNumber']),
    (0, typeorm_1.Index)(['isActive'])
], Customer);
//# sourceMappingURL=customer.entity.js.map