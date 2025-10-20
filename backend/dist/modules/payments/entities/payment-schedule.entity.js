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
exports.PaymentSchedule = exports.ScheduleStatus = void 0;
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["PENDING"] = "PENDING";
    ScheduleStatus["PAID"] = "PAID";
    ScheduleStatus["OVERDUE"] = "OVERDUE";
    ScheduleStatus["WAIVED"] = "WAIVED";
    ScheduleStatus["PARTIAL"] = "PARTIAL";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));
let PaymentSchedule = class PaymentSchedule {
};
exports.PaymentSchedule = PaymentSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], PaymentSchedule.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "scheduleNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], PaymentSchedule.prototype, "installmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], PaymentSchedule.prototype, "totalInstallments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PaymentSchedule.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], PaymentSchedule.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "milestone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ScheduleStatus,
        default: ScheduleStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PaymentSchedule.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PaymentSchedule.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PaymentSchedule.prototype, "isOverdue", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], PaymentSchedule.prototype, "overdueDays", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PaymentSchedule.prototype, "penaltyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PaymentSchedule.prototype, "isWaived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "waiverReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PaymentSchedule.prototype, "waivedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "waivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PaymentSchedule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentSchedule.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentSchedule.prototype, "updatedBy", void 0);
exports.PaymentSchedule = PaymentSchedule = __decorate([
    (0, typeorm_1.Entity)('payment_schedules'),
    (0, typeorm_1.Index)(['bookingId']),
    (0, typeorm_1.Index)(['dueDate']),
    (0, typeorm_1.Index)(['status'])
], PaymentSchedule);
//# sourceMappingURL=payment-schedule.entity.js.map