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
exports.SalesTarget = exports.TargetStatus = exports.TargetPeriod = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var TargetPeriod;
(function (TargetPeriod) {
    TargetPeriod["MONTHLY"] = "MONTHLY";
    TargetPeriod["QUARTERLY"] = "QUARTERLY";
    TargetPeriod["HALF_YEARLY"] = "HALF_YEARLY";
    TargetPeriod["YEARLY"] = "YEARLY";
})(TargetPeriod || (exports.TargetPeriod = TargetPeriod = {}));
var TargetStatus;
(function (TargetStatus) {
    TargetStatus["ACTIVE"] = "ACTIVE";
    TargetStatus["ACHIEVED"] = "ACHIEVED";
    TargetStatus["MISSED"] = "MISSED";
    TargetStatus["IN_PROGRESS"] = "IN_PROGRESS";
})(TargetStatus || (exports.TargetStatus = TargetStatus = {}));
let SalesTarget = class SalesTarget {
};
exports.SalesTarget = SalesTarget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SalesTarget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTarget.prototype, "salesPersonId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'sales_person_id' }),
    __metadata("design:type", user_entity_1.User)
], SalesTarget.prototype, "salesPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TargetPeriod,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTarget.prototype, "targetPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], SalesTarget.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], SalesTarget.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "targetLeads", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "targetSiteVisits", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "targetConversions", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "targetBookings", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "targetRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "selfTargetBookings", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "selfTargetRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTarget.prototype, "selfTargetNotes", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "achievedLeads", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "achievedSiteVisits", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "achievedConversions", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "achievedBookings", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "achievedRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "leadsAchievementPct", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "siteVisitsAchievementPct", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "conversionsAchievementPct", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "bookingsAchievementPct", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "revenueAchievementPct", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "overallAchievementPct", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "baseIncentive", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "earnedIncentive", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "bonusIncentive", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "totalIncentive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesTarget.prototype, "incentivePaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SalesTarget.prototype, "incentivePaidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTarget.prototype, "motivationalMessage", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], SalesTarget.prototype, "missedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TargetStatus,
        default: TargetStatus.IN_PROGRESS,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTarget.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTarget.prototype, "setBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTarget.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SalesTarget.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SalesTarget.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SalesTarget.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTarget.prototype, "updatedBy", void 0);
exports.SalesTarget = SalesTarget = __decorate([
    (0, typeorm_1.Entity)('sales_targets'),
    (0, typeorm_1.Index)(['salesPersonId', 'targetPeriod', 'startDate']),
    (0, typeorm_1.Index)(['targetPeriod', 'status'])
], SalesTarget);
//# sourceMappingURL=sales-target.entity.js.map