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
var ConstructionProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_project_entity_1 = require("./entities/construction-project.entity");
const construction_tower_progress_entity_1 = require("./entities/construction-tower-progress.entity");
const construction_flat_progress_entity_1 = require("./entities/construction-flat-progress.entity");
let ConstructionProjectsService = ConstructionProjectsService_1 = class ConstructionProjectsService {
    constructor(constructionProjectRepository, towerProgressRepository, flatProgressRepository) {
        this.constructionProjectRepository = constructionProjectRepository;
        this.towerProgressRepository = towerProgressRepository;
        this.flatProgressRepository = flatProgressRepository;
        this.logger = new common_1.Logger(ConstructionProjectsService_1.name);
    }
    async recomputeOverallProgress(projectId) {
        try {
            const towerAvg = await this.towerProgressRepository
                .createQueryBuilder('tp')
                .where('tp.construction_project_id = :projectId', { projectId })
                .select('AVG(tp.overall_progress)', 'avg')
                .addSelect('COUNT(*)', 'cnt')
                .getRawOne();
            let avg = null;
            if (towerAvg && Number(towerAvg.cnt) > 0 && towerAvg.avg !== null) {
                avg = Number(towerAvg.avg);
            }
            else {
                const flatAvg = await this.flatProgressRepository
                    .createQueryBuilder('fp')
                    .where('fp.construction_project_id = :projectId', { projectId })
                    .select('AVG(fp.overall_progress)', 'avg')
                    .addSelect('COUNT(*)', 'cnt')
                    .getRawOne();
                if (flatAvg && Number(flatAvg.cnt) > 0 && flatAvg.avg !== null) {
                    avg = Number(flatAvg.avg);
                }
            }
            if (avg === null)
                return null;
            const rounded = Math.round(avg * 100) / 100;
            await this.constructionProjectRepository.update({ id: projectId }, { overallProgress: rounded });
            return rounded;
        }
        catch (err) {
            this.logger.warn(`recomputeOverallProgress failed for project ${projectId}: ${err?.message}`);
            return null;
        }
    }
    async create(createDto) {
        const project = this.constructionProjectRepository.create({
            ...createDto,
            propertyId: createDto.propertyId ?? null,
            startDate: createDto.startDate ? new Date(createDto.startDate) : null,
            expectedCompletionDate: createDto.expectedCompletionDate
                ? new Date(createDto.expectedCompletionDate)
                : null,
        });
        return await this.constructionProjectRepository.save(project);
    }
    async findAll(propertyId, accessiblePropertyIds) {
        const where = {};
        if (propertyId) {
            where.propertyId = propertyId;
        }
        else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
            where.propertyId = (0, typeorm_2.In)(accessiblePropertyIds);
        }
        return await this.constructionProjectRepository.find({
            where,
            relations: ['property', 'projectManager'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const project = await this.constructionProjectRepository.findOne({
            where: { id },
            relations: ['property', 'projectManager'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Construction Project with ID ${id} not found`);
        }
        return project;
    }
    async update(id, updateDto) {
        const project = await this.findOne(id);
        Object.assign(project, updateDto);
        if (updateDto.propertyId !== undefined) {
            project.propertyId = updateDto.propertyId ?? null;
        }
        if (updateDto.startDate) {
            project.startDate = new Date(updateDto.startDate);
        }
        if (updateDto.expectedCompletionDate) {
            project.expectedCompletionDate = new Date(updateDto.expectedCompletionDate);
        }
        return await this.constructionProjectRepository.save(project);
    }
    async remove(id) {
        const project = await this.findOne(id);
        await this.constructionProjectRepository.remove(project);
    }
    async getByProperty(propertyId) {
        return await this.constructionProjectRepository.find({
            where: { propertyId },
            relations: ['projectManager'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.ConstructionProjectsService = ConstructionProjectsService;
exports.ConstructionProjectsService = ConstructionProjectsService = ConstructionProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __param(1, (0, typeorm_1.InjectRepository)(construction_tower_progress_entity_1.ConstructionTowerProgress)),
    __param(2, (0, typeorm_1.InjectRepository)(construction_flat_progress_entity_1.ConstructionFlatProgress)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConstructionProjectsService);
//# sourceMappingURL=construction-projects.service.js.map