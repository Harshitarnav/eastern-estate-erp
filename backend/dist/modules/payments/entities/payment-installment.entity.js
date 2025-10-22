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
exports.PaymentInstallment = exports.InstallmentStatus = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const payment_entity_1 = require("./payment.entity");
var InstallmentStatus;
(function (InstallmentStatus) {
    InstallmentStatus["PENDING"] = "PENDING";
    InstallmentStatus["PAID"] = "PAID";
    InstallmentStatus["OVERDUE"] = "OVERDUE";
    InstallmentStatus["WAIVED"] = "WAIVED";
    InstallmentStatus["PARTIAL"] = "PARTIAL";
})(InstallmentStatus || (exports.InstallmentStatus = InstallmentStatus = {}));
let PaymentInstallment = class PaymentInstallment {
};
exports.PaymentInstallment = PaymentInstallment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentInstallment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentInstallment.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking),
    (0, typeorm_1.JoinColumn)({ name: 'bookingId' }),
    __metadata("design:type", booking_entity_1.Booking)
], PaymentInstallment.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PaymentInstallment.prototype, "installmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PaymentInstallment.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], PaymentInstallment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InstallmentStatus,
        default: InstallmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], PaymentInstallment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentInstallment.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'paymentId' }),
    __metadata("design:type", payment_entity_1.Payment)
], PaymentInstallment.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PaymentInstallment.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PaymentInstallment.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PaymentInstallment.prototype, "lateFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PaymentInstallment.prototype, "lateFeeWaived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentInstallment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentInstallment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentInstallment.prototype, "updatedAt", void 0);
exports.PaymentInstallment = PaymentInstallment = __decorate([
    (0, typeorm_1.Entity)('payment_installments')
], PaymentInstallment);
//# sourceMappingURL=payment-installment.entity.js.map