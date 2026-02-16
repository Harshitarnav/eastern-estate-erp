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
exports.FlatPaymentPlan = exports.FlatPaymentPlanStatus = void 0;
const typeorm_1 = require("typeorm");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const payment_plan_template_entity_1 = require("./payment-plan-template.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var FlatPaymentPlanStatus;
(function (FlatPaymentPlanStatus) {
    FlatPaymentPlanStatus["ACTIVE"] = "ACTIVE";
    FlatPaymentPlanStatus["COMPLETED"] = "COMPLETED";
    FlatPaymentPlanStatus["CANCELLED"] = "CANCELLED";
})(FlatPaymentPlanStatus || (exports.FlatPaymentPlanStatus = FlatPaymentPlanStatus = {}));
let FlatPaymentPlan = class FlatPaymentPlan {
};
exports.FlatPaymentPlan = FlatPaymentPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'flat_id', type: 'uuid' }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "flatId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => flat_entity_1.Flat, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'flat_id' }),
    __metadata("design:type", flat_entity_1.Flat)
], FlatPaymentPlan.prototype, "flat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid' }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], FlatPaymentPlan.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], FlatPaymentPlan.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_plan_template_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "paymentPlanTemplateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_plan_template_entity_1.PaymentPlanTemplate, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_plan_template_id' }),
    __metadata("design:type", payment_plan_template_entity_1.PaymentPlanTemplate)
], FlatPaymentPlan.prototype, "paymentPlanTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], FlatPaymentPlan.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FlatPaymentPlan.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_amount', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], FlatPaymentPlan.prototype, "balanceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], FlatPaymentPlan.prototype, "milestones", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FlatPaymentPlanStatus,
        default: FlatPaymentPlanStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FlatPaymentPlan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FlatPaymentPlan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'created_by' }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], FlatPaymentPlan.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'updated_by' }),
    __metadata("design:type", String)
], FlatPaymentPlan.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", user_entity_1.User)
], FlatPaymentPlan.prototype, "updater", void 0);
exports.FlatPaymentPlan = FlatPaymentPlan = __decorate([
    (0, typeorm_1.Entity)('flat_payment_plans'),
    (0, typeorm_1.Index)(['flatId']),
    (0, typeorm_1.Index)(['bookingId']),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['status'])
], FlatPaymentPlan);
//# sourceMappingURL=flat-payment-plan.entity.js.map