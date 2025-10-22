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
exports.ProjectAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_project_assignment_entity_1 = require("./entities/construction-project-assignment.entity");
let ProjectAssignmentsService = class ProjectAssignmentsService {
    constructor(assignmentsRepo) {
        this.assignmentsRepo = assignmentsRepo;
    }
    async create(createDto, createdBy) {
        const existing = await this.assignmentsRepo.findOne({
            where: {
                constructionProjectId: createDto.constructionProjectId,
                employeeId: createDto.employeeId,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('This employee is already assigned to this project');
        }
        const assignment = this.assignmentsRepo.create({
            ...createDto,
            assignedDate: createDto.assignedDate || new Date().toISOString().split('T')[0],
            createdBy,
        });
        return this.assignmentsRepo.save(assignment);
    }
    async findByProject(projectId) {
        return this.assignmentsRepo.find({
            where: { constructionProjectId: projectId, isActive: true },
            relations: ['employee', 'employee.user'],
            order: { assignedDate: 'DESC' },
        });
    }
    async findByEmployee(employeeId) {
        return this.assignmentsRepo.find({
            where: { employeeId, isActive: true },
            relations: ['constructionProject', 'constructionProject.property'],
            order: { assignedDate: 'DESC' },
        });
    }
    async findOne(id) {
        const assignment = await this.assignmentsRepo.findOne({
            where: { id },
            relations: ['employee', 'constructionProject', 'constructionProject.property'],
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        return assignment;
    }
    async deactivate(id) {
        const assignment = await this.findOne(id);
        assignment.isActive = false;
        return this.assignmentsRepo.save(assignment);
    }
    async remove(id) {
        const assignment = await this.findOne(id);
        return this.assignmentsRepo.remove(assignment);
    }
    async getEmployeeProjects(employeeId) {
        const assignments = await this.assignmentsRepo.find({
            where: { employeeId, isActive: true },
            select: ['constructionProjectId'],
        });
        return assignments.map((a) => a.constructionProjectId);
    }
    async hasAccess(employeeId, projectId) {
        const assignment = await this.assignmentsRepo.findOne({
            where: {
                employeeId,
                constructionProjectId: projectId,
                isActive: true,
            },
        });
        return !!assignment;
    }
    async getEmployeeRole(employeeId, projectId) {
        const assignment = await this.assignmentsRepo.findOne({
            where: {
                employeeId,
                constructionProjectId: projectId,
                isActive: true,
            },
        });
        return assignment?.role || null;
    }
};
exports.ProjectAssignmentsService = ProjectAssignmentsService;
exports.ProjectAssignmentsService = ProjectAssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_project_assignment_entity_1.ConstructionProjectAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectAssignmentsService);
//# sourceMappingURL=project-assignments.service.js.map