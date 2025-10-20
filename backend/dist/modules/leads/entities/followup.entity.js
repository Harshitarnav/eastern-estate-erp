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
exports.FollowUp = exports.FollowUpOutcome = exports.FollowUpType = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("./lead.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var FollowUpType;
(function (FollowUpType) {
    FollowUpType["CALL"] = "CALL";
    FollowUpType["EMAIL"] = "EMAIL";
    FollowUpType["MEETING"] = "MEETING";
    FollowUpType["WHATSAPP"] = "WHATSAPP";
    FollowUpType["SMS"] = "SMS";
    FollowUpType["SITE_VISIT"] = "SITE_VISIT";
    FollowUpType["VIDEO_CALL"] = "VIDEO_CALL";
})(FollowUpType || (exports.FollowUpType = FollowUpType = {}));
var FollowUpOutcome;
(function (FollowUpOutcome) {
    FollowUpOutcome["INTERESTED"] = "INTERESTED";
    FollowUpOutcome["NOT_INTERESTED"] = "NOT_INTERESTED";
    FollowUpOutcome["CALLBACK_REQUESTED"] = "CALLBACK_REQUESTED";
    FollowUpOutcome["SITE_VISIT_SCHEDULED"] = "SITE_VISIT_SCHEDULED";
    FollowUpOutcome["DOCUMENTATION_REQUESTED"] = "DOCUMENTATION_REQUESTED";
    FollowUpOutcome["PRICE_NEGOTIATION"] = "PRICE_NEGOTIATION";
    FollowUpOutcome["NEEDS_TIME"] = "NEEDS_TIME";
    FollowUpOutcome["NOT_REACHABLE"] = "NOT_REACHABLE";
    FollowUpOutcome["WRONG_NUMBER"] = "WRONG_NUMBER";
    FollowUpOutcome["CONVERTED"] = "CONVERTED";
    FollowUpOutcome["LOST"] = "LOST";
})(FollowUpOutcome || (exports.FollowUpOutcome = FollowUpOutcome = {}));
let FollowUp = class FollowUp {
};
exports.FollowUp = FollowUp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FollowUp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], FollowUp.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], FollowUp.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], FollowUp.prototype, "followUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FollowUpType,
    }),
    __metadata("design:type", String)
], FollowUp.prototype, "followUpType", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], FollowUp.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], FollowUp.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'performed_by' }),
    __metadata("design:type", user_entity_1.User)
], FollowUp.prototype, "performedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FollowUpOutcome,
    }),
    __metadata("design:type", String)
], FollowUp.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], FollowUp.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "customerResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "actionsTaken", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "leadStatusBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "leadStatusAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], FollowUp.prototype, "nextFollowUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "nextFollowUpPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], FollowUp.prototype, "isSiteVisit", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "siteVisitProperty", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true, default: 0 }),
    __metadata("design:type", Number)
], FollowUp.prototype, "siteVisitRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "siteVisitFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 5 }),
    __metadata("design:type", Number)
], FollowUp.prototype, "interestLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 5 }),
    __metadata("design:type", Number)
], FollowUp.prototype, "budgetFit", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 5 }),
    __metadata("design:type", Number)
], FollowUp.prototype, "timelineFit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], FollowUp.prototype, "reminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], FollowUp.prototype, "reminderSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], FollowUp.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FollowUp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FollowUp.prototype, "updatedAt", void 0);
exports.FollowUp = FollowUp = __decorate([
    (0, typeorm_1.Entity)('followups'),
    (0, typeorm_1.Index)(['leadId', 'followUpDate']),
    (0, typeorm_1.Index)(['performedBy', 'followUpDate']),
    (0, typeorm_1.Index)(['nextFollowUpDate'])
], FollowUp);
//# sourceMappingURL=followup.entity.js.map