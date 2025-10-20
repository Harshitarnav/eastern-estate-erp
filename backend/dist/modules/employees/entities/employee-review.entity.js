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
exports.EmployeeReview = exports.ReviewStatus = exports.ReviewType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var ReviewType;
(function (ReviewType) {
    ReviewType["MONTHLY"] = "MONTHLY";
    ReviewType["QUARTERLY"] = "QUARTERLY";
    ReviewType["HALF_YEARLY"] = "HALF_YEARLY";
    ReviewType["ANNUAL"] = "ANNUAL";
    ReviewType["PROBATION"] = "PROBATION";
    ReviewType["PROJECT_BASED"] = "PROJECT_BASED";
})(ReviewType || (exports.ReviewType = ReviewType = {}));
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["SCHEDULED"] = "SCHEDULED";
    ReviewStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ReviewStatus["COMPLETED"] = "COMPLETED";
    ReviewStatus["CANCELLED"] = "CANCELLED";
})(ReviewStatus || (exports.ReviewStatus = ReviewStatus = {}));
let EmployeeReview = class EmployeeReview {
};
exports.EmployeeReview = EmployeeReview;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], EmployeeReview.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeReview.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReviewType,
    }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "reviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "reviewPeriodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "reviewPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReviewStatus,
        default: ReviewStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewerDesignation", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "technicalSkillsRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "communicationRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "teamworkRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "leadershipRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "problemSolvingRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "initiativeRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "punctualityRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "qualityOfWorkRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "productivityRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "attendanceRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "overallRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "achievements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "strengths", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "areasOfImprovement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "goals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "trainingNeeds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "developmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "reviewerComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "employeeComments", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "targetAchievement", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "actualAchievement", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "kpiAchievementPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "recommendedForPromotion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "recommendedForIncrement", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "recommendedIncrementPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "recommendedForBonus", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeReview.prototype, "recommendedBonusAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "recommendedForTraining", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "trainingRecommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "actionItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "nextReviewDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "employeeAcknowledged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "employeeAcknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "managerApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "managerApprovedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "managerApprovedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], EmployeeReview.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeReview.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeReview.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeReview.prototype, "updatedBy", void 0);
exports.EmployeeReview = EmployeeReview = __decorate([
    (0, typeorm_1.Entity)('employee_reviews'),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['reviewType']),
    (0, typeorm_1.Index)(['reviewStatus']),
    (0, typeorm_1.Index)(['reviewDate'])
], EmployeeReview);
//# sourceMappingURL=employee-review.entity.js.map