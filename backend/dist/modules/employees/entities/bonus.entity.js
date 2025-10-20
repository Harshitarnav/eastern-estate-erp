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
exports.Bonus = exports.BonusStatus = exports.BonusType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var BonusType;
(function (BonusType) {
    BonusType["PERFORMANCE"] = "PERFORMANCE";
    BonusType["FESTIVAL"] = "FESTIVAL";
    BonusType["ANNUAL"] = "ANNUAL";
    BonusType["PROJECT_COMPLETION"] = "PROJECT_COMPLETION";
    BonusType["RETENTION"] = "RETENTION";
    BonusType["REFERRAL"] = "REFERRAL";
    BonusType["SPOT_AWARD"] = "SPOT_AWARD";
    BonusType["SALES_INCENTIVE"] = "SALES_INCENTIVE";
    BonusType["OTHER"] = "OTHER";
})(BonusType || (exports.BonusType = BonusType = {}));
var BonusStatus;
(function (BonusStatus) {
    BonusStatus["PENDING"] = "PENDING";
    BonusStatus["APPROVED"] = "APPROVED";
    BonusStatus["REJECTED"] = "REJECTED";
    BonusStatus["PAID"] = "PAID";
    BonusStatus["CANCELLED"] = "CANCELLED";
})(BonusStatus || (exports.BonusStatus = BonusStatus = {}));
let Bonus = class Bonus {
};
exports.Bonus = Bonus;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Bonus.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Bonus.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], Bonus.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BonusType,
    }),
    __metadata("design:type", String)
], Bonus.prototype, "bonusType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Bonus.prototype, "bonusTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "bonusDescription", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Bonus.prototype, "bonusAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Bonus.prototype, "bonusDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Bonus.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Bonus.prototype, "performanceRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Bonus.prototype, "targetAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Bonus.prototype, "achievedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Bonus.prototype, "achievementPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BonusStatus,
        default: BonusStatus.PENDING,
    }),
    __metadata("design:type", String)
], Bonus.prototype, "bonusStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "approvedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Bonus.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "approvalRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "rejectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Bonus.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "paymentMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "paymentRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Bonus.prototype, "taxDeduction", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Bonus.prototype, "netBonusAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Bonus.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Bonus.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Bonus.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Bonus.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Bonus.prototype, "updatedBy", void 0);
exports.Bonus = Bonus = __decorate([
    (0, typeorm_1.Entity)('bonuses'),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['bonusType']),
    (0, typeorm_1.Index)(['bonusStatus']),
    (0, typeorm_1.Index)(['bonusDate'])
], Bonus);
//# sourceMappingURL=bonus.entity.js.map