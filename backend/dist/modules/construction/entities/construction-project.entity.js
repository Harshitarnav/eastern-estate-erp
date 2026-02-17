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
exports.ConstructionProject = void 0;
const typeorm_1 = require("typeorm");
const property_entity_1 = require("../../properties/entities/property.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let ConstructionProject = class ConstructionProject {
};
exports.ConstructionProject = ConstructionProject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], ConstructionProject.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_completion_date', type: 'date' }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "expectedCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ConstructionProject.prototype, "actualCompletionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: 'PLANNING'
    }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'overall_progress', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "overallProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_allocated', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "budgetAllocated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_spent', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ConstructionProject.prototype, "budgetSpent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_manager_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProject.prototype, "projectManagerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'project_manager_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], ConstructionProject.prototype, "projectManager", void 0);
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