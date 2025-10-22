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
exports.FlatProgressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_flat_progress_entity_1 = require("./entities/construction-flat-progress.entity");
const construction_tower_progress_entity_1 = require("./entities/construction-tower-progress.entity");
let FlatProgressService = class FlatProgressService {
    constructor(flatProgressRepo) {
        this.flatProgressRepo = flatProgressRepo;
    }
    async create(createDto) {
        const progress = this.flatProgressRepo.create(createDto);
        return this.flatProgressRepo.save(progress);
    }
    async findAll() {
        return this.flatProgressRepo.find({
            relations: ['constructionProject', 'flat'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByProject(projectId) {
        return this.flatProgressRepo.find({
            where: { constructionProjectId: projectId },
            relations: ['flat', 'flat.tower'],
            order: { phase: 'ASC' },
        });
    }
    async findByFlat(flatId) {
        return this.flatProgressRepo.find({
            where: { flatId },
            relations: ['constructionProject'],
            order: { phase: 'ASC' },
        });
    }
    async findByFlatAndPhase(flatId, phase) {
        if (phase) {
            return this.flatProgressRepo.findOne({
                where: { flatId, phase },
                relations: ['constructionProject', 'flat'],
            });
        }
        return this.findByFlat(flatId);
    }
    async findOne(id) {
        const progress = await this.flatProgressRepo.findOne({
            where: { id },
            relations: ['constructionProject', 'flat', 'flat.tower'],
        });
        if (!progress) {
            throw new common_1.NotFoundException('Flat progress record not found');
        }
        return progress;
    }
    async update(id, updateDto) {
        const progress = await this.findOne(id);
        Object.assign(progress, updateDto);
        return this.flatProgressRepo.save(progress);
    }
    async remove(id) {
        const progress = await this.findOne(id);
        return this.flatProgressRepo.remove(progress);
    }
    async calculateFlatOverallProgress(flatId, projectId) {
        const phases = await this.flatProgressRepo.find({
            where: { flatId, constructionProjectId: projectId },
        });
        if (phases.length === 0) {
            return 0;
        }
        const phaseWeight = 100 / 5;
        const totalProgress = phases.reduce((sum, phase) => sum + (phase.phaseProgress * phaseWeight / 100), 0);
        return Math.round(totalProgress * 100) / 100;
    }
    async updateFlatOverallProgress(flatId, projectId) {
        const overallProgress = await this.calculateFlatOverallProgress(flatId, projectId);
        await this.flatProgressRepo
            .createQueryBuilder()
            .update(construction_flat_progress_entity_1.ConstructionFlatProgress)
            .set({ overallProgress })
            .where('flatId = :flatId', { flatId })
            .andWhere('constructionProjectId = :projectId', { projectId })
            .execute();
        return overallProgress;
    }
    async getFlatProgressSummary(projectId) {
        const progressRecords = await this.flatProgressRepo
            .createQueryBuilder('fp')
            .leftJoinAndSelect('fp.flat', 'flat')
            .leftJoinAndSelect('flat.tower', 'tower')
            .where('fp.constructionProjectId = :projectId', { projectId })
            .select([
            'flat.id as flatId',
            'flat.flatNumber as flatNumber',
            'tower.name as towerName',
            'AVG(fp.overallProgress) as averageProgress',
            'COUNT(DISTINCT fp.phase) as phasesStarted',
            'COUNT(CASE WHEN fp.status = \'COMPLETED\' THEN 1 END) as phasesCompleted',
        ])
            .groupBy('flat.id')
            .addGroupBy('flat.flatNumber')
            .addGroupBy('tower.name')
            .getRawMany();
        return progressRecords;
    }
    async initializeFlatPhases(projectId, flatId) {
        const phases = [
            construction_tower_progress_entity_1.ConstructionPhase.FOUNDATION,
            construction_tower_progress_entity_1.ConstructionPhase.STRUCTURE,
            construction_tower_progress_entity_1.ConstructionPhase.MEP,
            construction_tower_progress_entity_1.ConstructionPhase.FINISHING,
            construction_tower_progress_entity_1.ConstructionPhase.HANDOVER,
        ];
        const progressRecords = phases.map((phase) => this.flatProgressRepo.create({
            constructionProjectId: projectId,
            flatId,
            phase,
            phaseProgress: 0,
            overallProgress: 0,
            status: 'NOT_STARTED',
        }));
        return this.flatProgressRepo.save(progressRecords);
    }
    async getProjectFlatsCompletionPercentage(projectId) {
        const result = await this.flatProgressRepo
            .createQueryBuilder('fp')
            .where('fp.constructionProjectId = :projectId', { projectId })
            .select('AVG(fp.overallProgress)', 'avgProgress')
            .getRawOne();
        return result?.avgProgress ? parseFloat(result.avgProgress) : 0;
    }
    async getFlatsReadyForHandover(projectId) {
        return this.flatProgressRepo
            .createQueryBuilder('fp')
            .leftJoinAndSelect('fp.flat', 'flat')
            .where('fp.constructionProjectId = :projectId', { projectId })
            .andWhere('fp.phase = :handoverPhase', { handoverPhase: construction_tower_progress_entity_1.ConstructionPhase.HANDOVER })
            .andWhere('fp.phaseProgress = 100')
            .andWhere('fp.status = :completed', { completed: 'COMPLETED' })
            .getMany();
    }
    async getFlatProgressByTower(projectId, towerId) {
        return this.flatProgressRepo
            .createQueryBuilder('fp')
            .leftJoinAndSelect('fp.flat', 'flat')
            .where('fp.constructionProjectId = :projectId', { projectId })
            .andWhere('flat.towerId = :towerId', { towerId })
            .orderBy('flat.flatNumber', 'ASC')
            .addOrderBy('fp.phase', 'ASC')
            .getMany();
    }
};
exports.FlatProgressService = FlatProgressService;
exports.FlatProgressService = FlatProgressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_flat_progress_entity_1.ConstructionFlatProgress)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FlatProgressService);
//# sourceMappingURL=flat-progress.service.js.map