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
exports.Payment = exports.PaymentStatus = exports.PaymentMethod = exports.PaymentType = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
var PaymentType;
(function (PaymentType) {
    PaymentType["BOOKING"] = "BOOKING";
    PaymentType["SALARY"] = "SALARY";
    PaymentType["VENDOR"] = "VENDOR";
    PaymentType["EXPENSE"] = "EXPENSE";
    PaymentType["OTHER"] = "OTHER";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CHEQUE"] = "CHEQUE";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_number', unique: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], Payment.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Payment.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Payment.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_type' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_mode' }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_date', type: 'date' }),
    __metadata("design:type", Date)
], Payment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cheque_number', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "chequeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cheque_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "chequeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utr_number', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "upiId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', default: 'PENDING' }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_number', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "receiptNumber", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=payment.entity.js.map