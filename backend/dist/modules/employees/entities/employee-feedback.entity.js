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
exports.EmployeeFeedback = exports.FeedbackStatus = exports.FeedbackType = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["PEER_TO_PEER"] = "PEER_TO_PEER";
    FeedbackType["MANAGER_TO_EMPLOYEE"] = "MANAGER_TO_EMPLOYEE";
    FeedbackType["EMPLOYEE_TO_MANAGER"] = "EMPLOYEE_TO_MANAGER";
    FeedbackType["SUBORDINATE_TO_MANAGER"] = "SUBORDINATE_TO_MANAGER";
    FeedbackType["SELF_ASSESSMENT"] = "SELF_ASSESSMENT";
    FeedbackType["CLIENT_FEEDBACK"] = "CLIENT_FEEDBACK";
    FeedbackType["EXIT_FEEDBACK"] = "EXIT_FEEDBACK";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["DRAFT"] = "DRAFT";
    FeedbackStatus["SUBMITTED"] = "SUBMITTED";
    FeedbackStatus["REVIEWED"] = "REVIEWED";
    FeedbackStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
})(FeedbackStatus || (exports.FeedbackStatus = FeedbackStatus = {}));
let EmployeeFeedback = class EmployeeFeedback {
};
exports.EmployeeFeedback = EmployeeFeedback;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], EmployeeFeedback.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "providerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "providerDesignation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "providerRelationship", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FeedbackType,
    }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "feedbackType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "feedbackTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], EmployeeFeedback.prototype, "feedbackDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FeedbackStatus,
        default: FeedbackStatus.DRAFT,
    }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "feedbackStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "positiveAspects", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "areasForImprovement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "specificExamples", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "generalComments", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "technicalSkillsRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "communicationRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "teamworkRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "leadershipRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "problemSolvingRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "reliabilityRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "professionalismRating", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], EmployeeFeedback.prototype, "overallRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeFeedback.prototype, "isAnonymous", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeFeedback.prototype, "employeeAcknowledged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeFeedback.prototype, "employeeAcknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "employeeResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeFeedback.prototype, "managerReviewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "managerReviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EmployeeFeedback.prototype, "managerReviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "managerComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], EmployeeFeedback.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeFeedback.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeFeedback.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeFeedback.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeFeedback.prototype, "updatedBy", void 0);
exports.EmployeeFeedback = EmployeeFeedback = __decorate([
    (0, typeorm_1.Entity)('employee_feedback'),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['feedbackType']),
    (0, typeorm_1.Index)(['feedbackStatus']),
    (0, typeorm_1.Index)(['feedbackDate'])
], EmployeeFeedback);
//# sourceMappingURL=employee-feedback.entity.js.map