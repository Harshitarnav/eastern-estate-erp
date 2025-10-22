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
exports.ConstructionProgressLog = exports.ProgressType = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
const tower_entity_1 = require("../../towers/entities/tower.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var ProgressType;
(function (ProgressType) {
    ProgressType["STRUCTURE"] = "STRUCTURE";
    ProgressType["INTERIOR"] = "INTERIOR";
    ProgressType["FINISHING"] = "FINISHING";
    ProgressType["QUALITY_CHECK"] = "QUALITY_CHECK";
})(ProgressType || (exports.ProgressType = ProgressType = {}));
let ConstructionProgressLog = class ConstructionProgressLog {
};
exports.ConstructionProgressLog = ConstructionProgressLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], ConstructionProgressLog.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tower_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "towerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tower_entity_1.Tower, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tower_id' }),
    __metadata("design:type", tower_entity_1.Tower)
], ConstructionProgressLog.prototype, "tower", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'log_date', type: 'date' }),
    __metadata("design:type", Date)
], ConstructionProgressLog.prototype, "logDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'progress_type',
        type: 'enum',
        enum: ProgressType,
    }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "progressType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text' }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ConstructionProgressLog.prototype, "progressPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photos', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Object)
], ConstructionProgressLog.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weather_condition', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "weatherCondition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ConstructionProgressLog.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logged_by', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionProgressLog.prototype, "loggedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'logged_by' }),
    __metadata("design:type", user_entity_1.User)
], ConstructionProgressLog.prototype, "logger", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionProgressLog.prototype, "createdAt", void 0);
exports.ConstructionProgressLog = ConstructionProgressLog = __decorate([
    (0, typeorm_1.Entity)('construction_progress_logs')
], ConstructionProgressLog);
//# sourceMappingURL=construction-progress-log.entity.js.map