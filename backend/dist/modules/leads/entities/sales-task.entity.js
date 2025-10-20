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
exports.SalesTask = exports.TaskStatus = exports.TaskPriority = exports.TaskType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const lead_entity_1 = require("./lead.entity");
var TaskType;
(function (TaskType) {
    TaskType["FOLLOWUP_CALL"] = "FOLLOWUP_CALL";
    TaskType["SITE_VISIT"] = "SITE_VISIT";
    TaskType["MEETING"] = "MEETING";
    TaskType["DOCUMENTATION"] = "DOCUMENTATION";
    TaskType["PROPERTY_TOUR"] = "PROPERTY_TOUR";
    TaskType["CLIENT_MEETING"] = "CLIENT_MEETING";
    TaskType["INTERNAL_MEETING"] = "INTERNAL_MEETING";
    TaskType["EMAIL_FOLLOWUP"] = "EMAIL_FOLLOWUP";
    TaskType["NEGOTIATION"] = "NEGOTIATION";
    TaskType["OTHER"] = "OTHER";
})(TaskType || (exports.TaskType = TaskType = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
    TaskStatus["OVERDUE"] = "OVERDUE";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
let SalesTask = class SalesTask {
};
exports.SalesTask = SalesTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SalesTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], SalesTask.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TaskType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTask.prototype, "taskType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTask.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTask.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", user_entity_1.User)
], SalesTask.prototype, "assignedToUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_by' }),
    __metadata("design:type", user_entity_1.User)
], SalesTask.prototype, "assignedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], SalesTask.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "dueTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 60 }),
    __metadata("design:type", Number)
], SalesTask.prototype, "estimatedDurationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SalesTask.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SalesTask.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], SalesTask.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "locationDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], SalesTask.prototype, "attendees", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "meetingLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SalesTask.prototype, "sendReminder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1440 }),
    __metadata("design:type", Number)
], SalesTask.prototype, "reminderBeforeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesTask.prototype, "reminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SalesTask.prototype, "reminderSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], SalesTask.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SalesTask.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "recurrencePattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "parentTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SalesTask.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SalesTask.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SalesTask.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SalesTask.prototype, "createdBy", void 0);
exports.SalesTask = SalesTask = __decorate([
    (0, typeorm_1.Entity)('sales_tasks'),
    (0, typeorm_1.Index)(['assignedTo', 'dueDate']),
    (0, typeorm_1.Index)(['assignedTo', 'status']),
    (0, typeorm_1.Index)(['dueDate', 'status']),
    (0, typeorm_1.Index)(['taskType', 'status'])
], SalesTask);
//# sourceMappingURL=sales-task.entity.js.map