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
exports.TowerProgressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_tower_progress_entity_1 = require("./entities/construction-tower-progress.entity");
let TowerProgressService = class TowerProgressService {
    constructor(towerProgressRepo) {
        this.towerProgressRepo = towerProgressRepo;
    }
    async create(createDto) {
        const progress = this.towerProgressRepo.create(createDto);
        return this.towerProgressRepo.save(progress);
    }
    async findAll() {
        return this.towerProgressRepo.find({
            relations: ['constructionProject', 'tower'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByProject(projectId) {
        return this.towerProgressRepo.find({
            where: { constructionProjectId: projectId },
            relations: ['tower'],
            order: { phase: 'ASC' },
        });
    }
    async findByTower(towerId) {
        return this.towerProgressRepo.find({
            where: { towerId },
            relations: ['constructionProject'],
            order: { phase: 'ASC' },
        });
    }
    async findByTowerAndPhase(towerId, phase) {
        if (phase) {
            return this.towerProgressRepo.findOne({
                where: { towerId, phase },
                relations: ['constructionProject', 'tower'],
            });
        }
        return this.findByTower(towerId);
    }
    async findOne(id) {
        const progress = await this.towerProgressRepo.findOne({
            where: { id },
            relations: ['constructionProject', 'tower'],
        });
        if (!progress) {
            throw new common_1.NotFoundException('Tower progress record not found');
        }
        return progress;
    }
    async update(id, updateDto) {
        const progress = await this.findOne(id);
        Object.assign(progress, updateDto);
        return this.towerProgressRepo.save(progress);
    }
    async remove(id) {
        const progress = await this.findOne(id);
        return this.towerProgressRepo.remove(progress);
    }
    async calculateTowerOverallProgress(towerId, projectId) {
        const phases = await this.towerProgressRepo.find({
            where: { towerId, constructionProjectId: projectId },
        });
        if (phases.length === 0) {
            return 0;
        }
        const phaseWeight = 100 / 5;
        const totalProgress = phases.reduce((sum, phase) => sum + (phase.phaseProgress * phaseWeight / 100), 0);
        return Math.round(totalProgress * 100) / 100;
    }
    async updateTowerOverallProgress(towerId, projectId) {
        const overallProgress = await this.calculateTowerOverallProgress(towerId, projectId);
        await this.towerProgressRepo
            .createQueryBuilder()
            .update(construction_tower_progress_entity_1.ConstructionTowerProgress)
            .set({ overallProgress })
            .where('towerId = :towerId', { towerId })
            .andWhere('constructionProjectId = :projectId', { projectId })
            .execute();
        return overallProgress;
    }
    async getTowerProgressSummary(projectId) {
        const progressRecords = await this.towerProgressRepo
            .createQueryBuilder('tp')
            .leftJoinAndSelect('tp.tower', 'tower')
            .where('tp.constructionProjectId = :projectId', { projectId })
            .select([
            'tower.id as towerId',
            'tower.name as towerName',
            'AVG(tp.overallProgress) as averageProgress',
            'COUNT(DISTINCT tp.phase) as phasesStarted',
            'COUNT(CASE WHEN tp.status = \'COMPLETED\' THEN 1 END) as phasesCompleted',
        ])
            .groupBy('tower.id')
            .addGroupBy('tower.name')
            .getRawMany();
        return progressRecords;
    }
    async initializeTowerPhases(projectId, towerId) {
        const phases = [
            construction_tower_progress_entity_1.ConstructionPhase.FOUNDATION,
            construction_tower_progress_entity_1.ConstructionPhase.STRUCTURE,
            construction_tower_progress_entity_1.ConstructionPhase.MEP,
            construction_tower_progress_entity_1.ConstructionPhase.FINISHING,
            construction_tower_progress_entity_1.ConstructionPhase.HANDOVER,
        ];
        const progressRecords = phases.map((phase) => this.towerProgressRepo.create({
            constructionProjectId: projectId,
            towerId,
            phase,
            phaseProgress: 0,
            overallProgress: 0,
            status: 'NOT_STARTED',
        }));
        return this.towerProgressRepo.save(progressRecords);
    }
    async getProjectTowersCompletionPercentage(projectId) {
        const result = await this.towerProgressRepo
            .createQueryBuilder('tp')
            .where('tp.constructionProjectId = :projectId', { projectId })
            .select('AVG(tp.overallProgress)', 'avgProgress')
            .getRawOne();
        return result?.avgProgress ? parseFloat(result.avgProgress) : 0;
    }
};
exports.TowerProgressService = TowerProgressService;
exports.TowerProgressService = TowerProgressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_tower_progress_entity_1.ConstructionTowerProgress)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TowerProgressService);
//# sourceMappingURL=tower-progress.service.js.map