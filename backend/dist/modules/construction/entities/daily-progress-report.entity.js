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
exports.DailyProgressReport = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
let DailyProgressReport = class DailyProgressReport {
    get totalWorkers() {
        return this.workersPresent + this.workersAbsent;
    }
    get attendancePercentage() {
        const total = this.totalWorkers;
        if (total === 0)
            return 0;
        return (this.workersPresent / total) * 100;
    }
    get isRecent() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(this.reportDate) >= sevenDaysAgo;
    }
    get hasPhotos() {
        return Array.isArray(this.photos) && this.photos.length > 0;
    }
    get photoCount() {
        return Array.isArray(this.photos) ? this.photos.length : 0;
    }
};
exports.DailyProgressReport = DailyProgressReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DailyProgressReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], DailyProgressReport.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], DailyProgressReport.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_date', type: 'date' }),
    __metadata("design:type", Date)
], DailyProgressReport.prototype, "reportDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_by', type: 'uuid' }),
    __metadata("design:type", String)
], DailyProgressReport.prototype, "reportedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'reported_by' }),
    __metadata("design:type", employee_entity_1.Employee)
], DailyProgressReport.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_completed', type: 'text' }),
    __metadata("design:type", String)
], DailyProgressReport.prototype, "workCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_planned_for_next_day', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyProgressReport.prototype, "workPlannedForNextDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyProgressReport.prototype, "progressPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workers_present', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], DailyProgressReport.prototype, "workersPresent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workers_absent', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], DailyProgressReport.prototype, "workersAbsent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weather_conditions', length: 100, nullable: true }),
    __metadata("design:type", String)
], DailyProgressReport.prototype, "weatherConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], DailyProgressReport.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DailyProgressReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DailyProgressReport.prototype, "updatedAt", void 0);
exports.DailyProgressReport = DailyProgressReport = __decorate([
    (0, typeorm_1.Entity)('daily_progress_reports'),
    (0, typeorm_1.Unique)(['constructionProjectId', 'reportDate'])
], DailyProgressReport);
//# sourceMappingURL=daily-progress-report.entity.js.map