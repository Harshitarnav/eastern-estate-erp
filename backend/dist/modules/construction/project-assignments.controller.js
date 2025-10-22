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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const project_assignments_service_1 = require("./project-assignments.service");
const create_project_assignment_dto_1 = require("./dto/create-project-assignment.dto");
let ProjectAssignmentsController = class ProjectAssignmentsController {
    constructor(projectAssignmentsService) {
        this.projectAssignmentsService = projectAssignmentsService;
    }
    async assignEngineer(projectId, createDto, req) {
        const userId = req.user?.sub || req.user?.id;
        return this.projectAssignmentsService.create({ ...createDto, constructionProjectId: projectId }, userId);
    }
    async getProjectAssignments(projectId) {
        return this.projectAssignmentsService.findByProject(projectId);
    }
    async getMyProjects(req) {
        const employeeId = req.user?.employeeId;
        if (!employeeId) {
            return [];
        }
        return this.projectAssignmentsService.findByEmployee(employeeId);
    }
    async getAssignment(assignmentId) {
        return this.projectAssignmentsService.findOne(assignmentId);
    }
    async deactivateAssignment(assignmentId) {
        return this.projectAssignmentsService.deactivate(assignmentId);
    }
    async removeAssignment(assignmentId) {
        return this.projectAssignmentsService.remove(assignmentId);
    }
    async checkAccess(projectId, employeeId) {
        const hasAccess = await this.projectAssignmentsService.hasAccess(employeeId, projectId);
        return { hasAccess };
    }
    async getEmployeeRole(projectId, employeeId) {
        const role = await this.projectAssignmentsService.getEmployeeRole(employeeId, projectId);
        return { role };
    }
};
exports.ProjectAssignmentsController = ProjectAssignmentsController;
__decorate([
    (0, common_1.Post)(':id/assignments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_project_assignment_dto_1.CreateProjectAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "assignEngineer", null);
__decorate([
    (0, common_1.Get)(':id/assignments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "getProjectAssignments", null);
__decorate([
    (0, common_1.Get)('my-projects'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "getMyProjects", null);
__decorate([
    (0, common_1.Get)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "getAssignment", null);
__decorate([
    (0, common_1.Patch)('assignments/:id/deactivate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "deactivateAssignment", null);
__decorate([
    (0, common_1.Delete)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "removeAssignment", null);
__decorate([
    (0, common_1.Get)(':projectId/check-access/:employeeId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "checkAccess", null);
__decorate([
    (0, common_1.Get)(':projectId/role/:employeeId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectAssignmentsController.prototype, "getEmployeeRole", null);
exports.ProjectAssignmentsController = ProjectAssignmentsController = __decorate([
    (0, common_1.Controller)('construction-projects'),
    __metadata("design:paramtypes", [project_assignments_service_1.ProjectAssignmentsService])
], ProjectAssignmentsController);
//# sourceMappingURL=project-assignments.controller.js.map