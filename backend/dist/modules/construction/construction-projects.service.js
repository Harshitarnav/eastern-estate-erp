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
exports.ConstructionProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_project_entity_1 = require("./entities/construction-project.entity");
let ConstructionProjectsService = class ConstructionProjectsService {
    constructor(constructionProjectRepository) {
        this.constructionProjectRepository = constructionProjectRepository;
    }
    async create(createDto) {
        const project = this.constructionProjectRepository.create({
            ...createDto,
            startDate: createDto.startDate ? new Date(createDto.startDate) : null,
            expectedCompletionDate: createDto.expectedCompletionDate
                ? new Date(createDto.expectedCompletionDate)
                : null,
        });
        return await this.constructionProjectRepository.save(project);
    }
    async findAll(propertyId) {
        const where = { isActive: true };
        if (propertyId) {
            where.propertyId = propertyId;
        }
        return await this.constructionProjectRepository.find({
            where,
            relations: ['property', 'tower', 'siteEngineer'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const project = await this.constructionProjectRepository.findOne({
            where: { id },
            relations: ['property', 'tower', 'siteEngineer'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Construction Project with ID ${id} not found`);
        }
        return project;
    }
    async update(id, updateDto) {
        const project = await this.findOne(id);
        Object.assign(project, updateDto);
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
        project.isActive = false;
        await this.constructionProjectRepository.save(project);
    }
    async getByProperty(propertyId) {
        return await this.constructionProjectRepository.find({
            where: { propertyId, isActive: true },
            relations: ['tower', 'siteEngineer'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.ConstructionProjectsService = ConstructionProjectsService;
exports.ConstructionProjectsService = ConstructionProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConstructionProjectsService);
//# sourceMappingURL=construction-projects.service.js.map