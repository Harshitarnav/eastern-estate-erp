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
exports.PaymentRefund = exports.RefundStatus = void 0;
const typeorm_1 = require("typeorm");
const payment_entity_1 = require("./payment.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["PENDING"] = "PENDING";
    RefundStatus["APPROVED"] = "APPROVED";
    RefundStatus["PROCESSED"] = "PROCESSED";
    RefundStatus["REJECTED"] = "REJECTED";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
let PaymentRefund = class PaymentRefund {
};
exports.PaymentRefund = PaymentRefund;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentRefund.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentRefund.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", payment_entity_1.Payment)
], PaymentRefund.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], PaymentRefund.prototype, "refundAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "refundReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PaymentRefund.prototype, "refundDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentRefund.prototype, "refundMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RefundStatus,
        default: RefundStatus.PENDING,
    }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approvedBy' }),
    __metadata("design:type", user_entity_1.User)
], PaymentRefund.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentRefund.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'processedBy' }),
    __metadata("design:type", user_entity_1.User)
], PaymentRefund.prototype, "processor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentRefund.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "bankDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentRefund.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'createdBy' }),
    __metadata("design:type", user_entity_1.User)
], PaymentRefund.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentRefund.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentRefund.prototype, "updatedAt", void 0);
exports.PaymentRefund = PaymentRefund = __decorate([
    (0, typeorm_1.Entity)('payment_refunds')
], PaymentRefund);
//# sourceMappingURL=payment-refund.entity.js.map