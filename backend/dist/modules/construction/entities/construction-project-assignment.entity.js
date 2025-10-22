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
exports.ConstructionProjectAssignment = exports.AssignmentRole = void 0;
const typeorm_1 = require("typeorm");
const construction_project_entity_1 = require("./construction-project.entity");
const employee_entity_1 = require("../../employees/entities/employee.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var AssignmentRole;
(function (AssignmentRole) {
    AssignmentRole["PROJECT_MANAGER"] = "PROJECT_MANAGER";
    AssignmentRole["SITE_ENGINEER"] = "SITE_ENGINEER";
    AssignmentRole["SUPERVISOR"] = "SUPERVISOR";
    AssignmentRole["FOREMAN"] = "FOREMAN";
    AssignmentRole["QUALITY_INSPECTOR"] = "QUALITY_INSPECTOR";
})(AssignmentRole || (exports.AssignmentRole = AssignmentRole = {}));
let ConstructionProjectAssignment = class ConstructionProjectAssignment {
};
exports.ConstructionProjectAssignment = ConstructionProjectAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConstructionProjectAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'construction_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionProjectAssignment.prototype, "constructionProjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construction_project_entity_1.ConstructionProject),
    (0, typeorm_1.JoinColumn)({ name: 'construction_project_id' }),
    __metadata("design:type", construction_project_entity_1.ConstructionProject)
], ConstructionProjectAssignment.prototype, "constructionProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], ConstructionProjectAssignment.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", employee_entity_1.Employee)
], ConstructionProjectAssignment.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        enum: AssignmentRole,
    }),
    __metadata("design:type", String)
], ConstructionProjectAssignment.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_date', type: 'date' }),
    __metadata("design:type", Date)
], ConstructionProjectAssignment.prototype, "assignedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ConstructionProjectAssignment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConstructionProjectAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ConstructionProjectAssignment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ConstructionProjectAssignment.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], ConstructionProjectAssignment.prototype, "creator", void 0);
exports.ConstructionProjectAssignment = ConstructionProjectAssignment = __decorate([
    (0, typeorm_1.Entity)('construction_project_assignments')
], ConstructionProjectAssignment);
//# sourceMappingURL=construction-project-assignment.entity.js.map