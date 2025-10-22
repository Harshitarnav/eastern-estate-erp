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
exports.PainPoint = exports.PainPointStatus = exports.PainPointSeverity = exports.PainPointType = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
var PainPointType;
(function (PainPointType) {
    PainPointType["MATERIAL_SHORTAGE"] = "MATERIAL_SHORTAGE";
    PainPointType["LABOR_SHORTAGE"] = "LABOR_SHORTAGE";
    PainPointType["EQUIPMENT_ISSUE"] = "EQUIPMENT_ISSUE";
    PainPointType["DESIGN_ISSUE"] = "DESIGN_ISSUE";
    PainPointType["WEATHER"] = "WEATHER";
    PainPointType["OTHER"] = "OTHER";
})(PainPointType || (exports.PainPointType = PainPointType = {}));
var PainPointSeverity;
(function (PainPointSeverity) {
    PainPointSeverity["LOW"] = "LOW";
    PainPointSeverity["MEDIUM"] = "MEDIUM";
    PainPointSeverity["HIGH"] = "HIGH";
    PainPointSeverity["CRITICAL"] = "CRITICAL";
})(PainPointSeverity || (exports.PainPointSeverity = PainPointSeverity = {}));
var PainPointStatus;
(function (PainPointStatus) {
    PainPointStatus["OPEN"] = "OPEN";
    PainPointStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PainPointStatus["RESOLVED"] = "RESOLVED";
    PainPointStatus["CLOSED"] = "CLOSED";
})(PainPointStatus || (exports.PainPointStatus = PainPointStatus = {}));
let PainPoint = class PainPoint {
    get isResolved() {
        return [PainPointStatus.RESOLVED, PainPointStatus.CLOSED].includes(this.status);
    }
    get isCritical() {
        return this.severity === PainPointSeverity.CRITICAL;
    }
    get isOpenTooLong() {
        if (this.isResolved)
            return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(this.reportedDate) < sevenDaysAgo;
    }
    get resolutionTimeInDays() {
        if (!this.resolvedDate)
            return null;
        const reported = new Date(this.reportedDate);
        const resolved = new Date(this.resolvedDate);
        const diffTime = Math.abs(resolved.getTime() - reported.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get daysSinceReported() {
        const reported = new Date(this.reportedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reported.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get formattedType() {
        return this.painPointType.replace(/_/g, ' ');
    }
};
exports.PainPoint = PainPoint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PainPoint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], PainPoint.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], PainPoint.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_by', type: 'uuid' }),
    __metadata("design:type", String)
], PainPoint.prototype, "reportedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'reported_by' }),
    __metadata("design:type", employee_entity_1.Employee)
], PainPoint.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'pain_point_type',
        type: 'enum',
        enum: PainPointType,
    }),
    __metadata("design:type", String)
], PainPoint.prototype, "painPointType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PainPoint.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PainPoint.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PainPointSeverity,
    }),
    __metadata("design:type", String)
], PainPoint.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PainPointStatus,
        default: PainPointStatus.OPEN,
    }),
    __metadata("design:type", String)
], PainPoint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PainPoint.prototype, "reportedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PainPoint.prototype, "resolvedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PainPoint.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PainPoint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PainPoint.prototype, "updatedAt", void 0);
exports.PainPoint = PainPoint = __decorate([
    (0, typeorm_1.Entity)('pain_points')
], PainPoint);
//# sourceMappingURL=pain-point.entity.js.map