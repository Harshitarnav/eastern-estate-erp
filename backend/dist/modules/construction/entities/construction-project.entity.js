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
exports.ConstructionProject = exports.InspectionStatus = exports.ProjectStatus = exports.ProjectPhase = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
const tower_entity_1 = require("../../towers/entities/tower.entity");
var ProjectPhase;
(function (ProjectPhase) {
    ProjectPhase["PLANNING"] = "PLANNING";
    ProjectPhase["SITE_PREPARATION"] = "SITE_PREPARATION";
    ProjectPhase["FOUNDATION"] = "FOUNDATION";
    ProjectPhase["STRUCTURE"] = "STRUCTURE";
    ProjectPhase["MASONRY"] = "MASONRY";
    ProjectPhase["ROOFING"] = "ROOFING";
    ProjectPhase["PLUMBING"] = "PLUMBING";
    ProjectPhase["ELECTRICAL"] = "ELECTRICAL";
    ProjectPhase["PLASTERING"] = "PLASTERING";
    ProjectPhase["FLOORING"] = "FLOORING";
    ProjectPhase["PAINTING"] = "PAINTING";
    ProjectPhase["FINISHING"] = "FINISHING";
    ProjectPhase["LANDSCAPING"] = "LANDSCAPING";
    ProjectPhase["HANDOVER"] = "HANDOVER";
    ProjectPhase["COMPLETED"] = "COMPLETED";
})(ProjectPhase || (exports.ProjectPhase = ProjectPhase = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["NOT_STARTED"] = "NOT_STARTED";
    ProjectStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProjectStatus["ON_HOLD"] = "ON_HOLD";
    ProjectStatus["DELAYED"] = "DELAYED";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["PENDING"] = "PENDING";
    InspectionStatus["PASSED"] = "PASSED";
    InspectionStatus["FAILED"] = "FAILED";
    InspectionStatus["CONDITIONAL"] = "CONDITIONAL";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
let ConstructionProject = class ConstructionProject {
};
exports.ConstructionProject = ConstructionProject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], ConstructionProject.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "towerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tower_entity_1.Tower, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tower_id' }),
    __metadata("design:type", tower_entity_1.Tower)
], ConstructionProject.prototype, "tower", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectPhase,
        default: ProjectPhase.PLANNING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectPhase", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.NOT_STARTED,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectStatus", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "overallProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "planningProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "sitePrepProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "foundationProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "structureProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "masonryProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "roofingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "plumbingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "electricalProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "plasteringProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "flooringProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "paintingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "finishingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "landscapingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "plannedStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "plannedEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "actualStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "estimatedCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "delayDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "mainContractorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "mainContractorEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "mainContractorPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "mainContractorAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "subContractors", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "estimatedBudget", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "actualCost", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "materialCost", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "laborCost", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "overheadCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "milestones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "inspections", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "totalInspections", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "passedInspections", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "failedInspections", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "materialUsage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "workersCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "engineersCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "supervisorsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "siteEngineer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "safetyIncidents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "lastSafetyInspection", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ConstructionProject.prototype, "safetyCompliant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "permits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ConstructionProject.prototype, "allPermitsObtained", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "blueprints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "weatherDelayDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "weatherRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ConstructionProject.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "risksIdentified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "mitigationStrategies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], ConstructionProject.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "updatedBy", void 0);
exports.ConstructionProject = ConstructionProject = __decorate([
    (0, typeorm_1.Entity)('construction_projects'),
    (0, typeorm_1.Index)(['projectPhase']),
    (0, typeorm_1.Index)(['projectStatus']),
    (0, typeorm_1.Index)(['propertyId'])
], ConstructionProject);
//# sourceMappingURL=construction-project.entity.js.map