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
exports.PaymentPlanTemplate = exports.PaymentPlanType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var PaymentPlanType;
(function (PaymentPlanType) {
    PaymentPlanType["CONSTRUCTION_LINKED"] = "CONSTRUCTION_LINKED";
    PaymentPlanType["TIME_LINKED"] = "TIME_LINKED";
    PaymentPlanType["DOWN_PAYMENT"] = "DOWN_PAYMENT";
})(PaymentPlanType || (exports.PaymentPlanType = PaymentPlanType = {}));
let PaymentPlanTemplate = class PaymentPlanTemplate {
};
exports.PaymentPlanTemplate = PaymentPlanTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentPlanTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PaymentPlanTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentPlanType,
    }),
    __metadata("design:type", String)
], PaymentPlanTemplate.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentPlanTemplate.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], PaymentPlanTemplate.prototype, "milestones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_percentage', type: 'decimal', precision: 5, scale: 2, default: 100 }),
    __metadata("design:type", Number)
], PaymentPlanTemplate.prototype, "totalPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], PaymentPlanTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], PaymentPlanTemplate.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PaymentPlanTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PaymentPlanTemplate.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'created_by' }),
    __metadata("design:type", String)
], PaymentPlanTemplate.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], PaymentPlanTemplate.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'updated_by' }),
    __metadata("design:type", String)
], PaymentPlanTemplate.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", user_entity_1.User)
], PaymentPlanTemplate.prototype, "updater", void 0);
exports.PaymentPlanTemplate = PaymentPlanTemplate = __decorate([
    (0, typeorm_1.Entity)('payment_plan_templates'),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['isActive'])
], PaymentPlanTemplate);
//# sourceMappingURL=payment-plan-template.entity.js.map