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
exports.VendorPayment = exports.PaymentMode = void 0;
const typeorm_1 = require("typeorm");
const vendor_entity_1 = require("./vendor.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var PaymentMode;
(function (PaymentMode) {
    PaymentMode["CASH"] = "CASH";
    PaymentMode["CHEQUE"] = "CHEQUE";
    PaymentMode["NEFT"] = "NEFT";
    PaymentMode["RTGS"] = "RTGS";
    PaymentMode["UPI"] = "UPI";
})(PaymentMode || (exports.PaymentMode = PaymentMode = {}));
let VendorPayment = class VendorPayment {
    get isLinkedToPO() {
        return !!this.purchaseOrderId;
    }
    get isRecent() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(this.paymentDate) >= thirtyDaysAgo;
    }
    get isDigitalPayment() {
        return [PaymentMode.NEFT, PaymentMode.RTGS, PaymentMode.UPI].includes(this.paymentMode);
    }
    get formattedPaymentMode() {
        return this.paymentMode.replace('_', ' ');
    }
};
exports.VendorPayment = VendorPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }),
    __metadata("design:type", String)
], VendorPayment.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], VendorPayment.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_order_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], VendorPayment.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date' }),
    __metadata("design:type", Date)
], VendorPayment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], VendorPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_mode',
        type: 'enum',
        enum: PaymentMode,
    }),
    __metadata("design:type", String)
], VendorPayment.prototype, "paymentMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_reference', length: 100, nullable: true }),
    __metadata("design:type", String)
], VendorPayment.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VendorPayment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], VendorPayment.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], VendorPayment.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorPayment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorPayment.prototype, "updatedAt", void 0);
exports.VendorPayment = VendorPayment = __decorate([
    (0, typeorm_1.Entity)('vendor_payments')
], VendorPayment);
//# sourceMappingURL=vendor-payment.entity.js.map