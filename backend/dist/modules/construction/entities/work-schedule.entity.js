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
exports.WorkSchedule = exports.WorkScheduleStatus = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
var WorkScheduleStatus;
(function (WorkScheduleStatus) {
    WorkScheduleStatus["NOT_STARTED"] = "NOT_STARTED";
    WorkScheduleStatus["IN_PROGRESS"] = "IN_PROGRESS";
    WorkScheduleStatus["COMPLETED"] = "COMPLETED";
    WorkScheduleStatus["DELAYED"] = "DELAYED";
    WorkScheduleStatus["CANCELLED"] = "CANCELLED";
})(WorkScheduleStatus || (exports.WorkScheduleStatus = WorkScheduleStatus = {}));
let WorkSchedule = class WorkSchedule {
    get isStarted() {
        return !!this.actualStartDate || this.status !== WorkScheduleStatus.NOT_STARTED;
    }
    get isCompleted() {
        return this.status === WorkScheduleStatus.COMPLETED;
    }
    get isDelayed() {
        if (this.isCompleted)
            return false;
        return new Date() > new Date(this.endDate);
    }
    get hasDependencies() {
        return Array.isArray(this.dependencies) && this.dependencies.length > 0;
    }
    get plannedDuration() {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get actualDuration() {
        if (!this.actualStartDate || !this.actualEndDate)
            return null;
        const start = new Date(this.actualStartDate);
        const end = new Date(this.actualEndDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get daysRemaining() {
        if (this.isCompleted)
            return 0;
        const now = new Date();
        const end = new Date(this.endDate);
        const diffTime = end.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get delayInDays() {
        if (!this.isDelayed)
            return 0;
        const now = this.actualEndDate ? new Date(this.actualEndDate) : new Date();
        const planned = new Date(this.endDate);
        const diffTime = Math.abs(now.getTime() - planned.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};
exports.WorkSchedule = WorkSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], WorkSchedule.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], WorkSchedule.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_name', length: 255 }),
    __metadata("design:type", String)
], WorkSchedule.prototype, "taskName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkSchedule.prototype, "taskDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', type: 'uuid' }),
    __metadata("design:type", String)
], WorkSchedule.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", employee_entity_1.Employee)
], WorkSchedule.prototype, "assignedEngineer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WorkScheduleStatus,
        default: WorkScheduleStatus.NOT_STARTED,
    }),
    __metadata("design:type", String)
], WorkSchedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], WorkSchedule.prototype, "dependencies", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], WorkSchedule.prototype, "progressPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "actualStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkSchedule.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "updatedAt", void 0);
exports.WorkSchedule = WorkSchedule = __decorate([
    (0, typeorm_1.Entity)('work_schedules')
], WorkSchedule);
//# sourceMappingURL=work-schedule.entity.js.map