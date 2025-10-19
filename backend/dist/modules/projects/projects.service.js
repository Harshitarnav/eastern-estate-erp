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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const property_entity_1 = require("../properties/entities/property.entity");
let ProjectsService = class ProjectsService {
    constructor(projectsRepository, propertiesRepository) {
        this.projectsRepository = projectsRepository;
        this.propertiesRepository = propertiesRepository;
    }
    async create(createProjectDto, userId) {
        const existingProject = await this.projectsRepository.findOne({
            where: { projectCode: createProjectDto.projectCode },
        });
        if (existingProject) {
            throw new common_1.BadRequestException(`Project with code ${createProjectDto.projectCode} already exists`);
        }
        const normalizedPayload = this.normalizeProjectPayload(createProjectDto);
        const project = this.projectsRepository.create({
            ...normalizedPayload,
            isActive: normalizedPayload.isActive ?? true,
            createdBy: userId ?? null,
        });
        const savedProject = await this.projectsRepository.save(project);
        return this.mapToResponseDto(savedProject);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, isActive, excludeId, } = query;
        const queryBuilder = this.projectsRepository.createQueryBuilder('project');
        if (isActive !== undefined) {
            queryBuilder.andWhere('project.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        if (status) {
            queryBuilder.andWhere('project.status ILIKE :status', { status: `%${status}%` });
        }
        if (excludeId) {
            queryBuilder.andWhere('project.id != :excludeId', { excludeId });
        }
        if (search) {
            queryBuilder.andWhere(`(project.name ILIKE :search OR project.projectCode ILIKE :search OR project.city ILIKE :search OR project.state ILIKE :search)`, { search: `%${search}%` });
        }
        queryBuilder.orderBy('project.createdAt', 'DESC');
        const total = await queryBuilder.getCount();
        const projects = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const data = await Promise.all(projects.map((project) => this.mapToResponseDto(project)));
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const project = await this.projectsRepository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return this.mapToResponseDto(project);
    }
    async findByCode(code) {
        const project = await this.projectsRepository.findOne({ where: { projectCode: code } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with code ${code} not found`);
        }
        return this.mapToResponseDto(project);
    }
    async update(id, updateProjectDto, userId) {
        const project = await this.projectsRepository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        if (updateProjectDto.projectCode && updateProjectDto.projectCode !== project.projectCode) {
            const existingProject = await this.projectsRepository.findOne({
                where: { projectCode: updateProjectDto.projectCode },
            });
            if (existingProject) {
                throw new common_1.BadRequestException(`Project with code ${updateProjectDto.projectCode} already exists`);
            }
        }
        const normalizedPayload = this.normalizeProjectPayload(updateProjectDto);
        Object.assign(project, normalizedPayload);
        project.updatedBy = userId ?? project.updatedBy ?? null;
        const savedProject = await this.projectsRepository.save(project);
        return this.mapToResponseDto(savedProject);
    }
    async remove(id) {
        const project = await this.projectsRepository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        const linkedProperties = await this.propertiesRepository.count({
            where: { projectId: id, isActive: true },
        });
        if (linkedProperties > 0) {
            throw new common_1.BadRequestException('Project cannot be deleted while active properties exist under it');
        }
        project.isActive = false;
        await this.projectsRepository.save(project);
        return { message: 'Project deactivated successfully' };
    }
    async toggleActive(id) {
        const project = await this.projectsRepository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        project.isActive = !project.isActive;
        const savedProject = await this.projectsRepository.save(project);
        return this.mapToResponseDto(savedProject);
    }
    normalizeProjectPayload(payload) {
        const normalized = { ...payload };
        if (payload.startDate !== undefined) {
            normalized.startDate = payload.startDate ? new Date(payload.startDate) : null;
        }
        if (payload.endDate !== undefined) {
            normalized.endDate = payload.endDate ? new Date(payload.endDate) : null;
        }
        if (payload.isActive !== undefined) {
            normalized.isActive = Boolean(payload.isActive);
        }
        return normalized;
    }
    async mapToResponseDto(project) {
        const propertiesCount = await this.propertiesRepository.count({
            where: { projectId: project.id, isActive: true },
        });
        return {
            id: project.id,
            projectCode: project.projectCode,
            name: project.name,
            description: project.description ?? undefined,
            address: project.address ?? undefined,
            city: project.city ?? undefined,
            state: project.state ?? undefined,
            country: project.country ?? undefined,
            pincode: project.pincode ?? undefined,
            status: project.status ?? undefined,
            startDate: project.startDate ?? undefined,
            endDate: project.endDate ?? undefined,
            contactPerson: project.contactPerson ?? undefined,
            contactEmail: project.contactEmail ?? undefined,
            contactPhone: project.contactPhone ?? undefined,
            gstNumber: project.gstNumber ?? undefined,
            panNumber: project.panNumber ?? undefined,
            financeEntityName: project.financeEntityName ?? undefined,
            isActive: project.isActive,
            createdBy: project.createdBy ?? undefined,
            updatedBy: project.updatedBy ?? undefined,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            propertiesCount,
        };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map