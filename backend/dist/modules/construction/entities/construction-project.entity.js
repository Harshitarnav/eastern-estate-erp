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
exports.ConstructionProject = exports.ConstructionProjectStatus = exports.ConstructionProjectPhase = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
const tower_entity_1 = require("../../towers/entities/tower.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var ConstructionProjectPhase;
(function (ConstructionProjectPhase) {
    ConstructionProjectPhase["PLANNING"] = "PLANNING";
    ConstructionProjectPhase["EXCAVATION"] = "EXCAVATION";
    ConstructionProjectPhase["FOUNDATION"] = "FOUNDATION";
    ConstructionProjectPhase["STRUCTURE"] = "STRUCTURE";
    ConstructionProjectPhase["FINISHING"] = "FINISHING";
    ConstructionProjectPhase["COMPLETE"] = "COMPLETE";
})(ConstructionProjectPhase || (exports.ConstructionProjectPhase = ConstructionProjectPhase = {}));
var ConstructionProjectStatus;
(function (ConstructionProjectStatus) {
    ConstructionProjectStatus["ACTIVE"] = "ACTIVE";
    ConstructionProjectStatus["ON_HOLD"] = "ON_HOLD";
    ConstructionProjectStatus["DELAYED"] = "DELAYED";
    ConstructionProjectStatus["COMPLETED"] = "COMPLETED";
    ConstructionProjectStatus["CANCELLED"] = "CANCELLED";
})(ConstructionProjectStatus || (exports.ConstructionProjectStatus = ConstructionProjectStatus = {}));
let ConstructionProject = class ConstructionProject {
};
exports.ConstructionProject = ConstructionProject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], ConstructionProject.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tower_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "towerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tower_entity_1.Tower, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tower_id' }),
    __metadata("design:type", tower_entity_1.Tower)
], ConstructionProject.prototype, "tower", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_code', type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'project_phase',
        type: 'enum',
        enum: ConstructionProjectPhase,
        default: ConstructionProjectPhase.PLANNING,
    }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectPhase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_completion_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "expectedCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_completion_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "actualCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "overallProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'structure_progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "structureProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interior_progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "interiorProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'finishing_progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "finishingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'site_engineer_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "siteEngineerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'site_engineer_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], ConstructionProject.prototype, "siteEngineer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contractor_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "contractorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contractor_contact', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "contractorContact", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ConstructionProjectStatus,
        default: ConstructionProjectStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_allocated', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "budgetAllocated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_spent', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "budgetSpent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issues', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "issues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ConstructionProject.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], ConstructionProject.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", user_entity_1.User)
], ConstructionProject.prototype, "updater", void 0);
exports.ConstructionProject = ConstructionProject = __decorate([
    (0, typeorm_1.Entity)('construction_projects')
], ConstructionProject);
//# sourceMappingURL=construction-project.entity.js.map