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
exports.PainPointsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pain_point_entity_1 = require("./entities/pain-point.entity");
let PainPointsService = class PainPointsService {
    constructor(painPointsRepository) {
        this.painPointsRepository = painPointsRepository;
    }
    async create(createDto) {
        const painPoint = this.painPointsRepository.create(createDto);
        return await this.painPointsRepository.save(painPoint);
    }
    async findAll(filters) {
        const query = this.painPointsRepository.createQueryBuilder('painPoint');
        if (filters?.projectId) {
            query.andWhere('painPoint.constructionProjectId = :projectId', { projectId: filters.projectId });
        }
        if (filters?.status) {
            query.andWhere('painPoint.status = :status', { status: filters.status });
        }
        if (filters?.severity) {
            query.andWhere('painPoint.severity = :severity', { severity: filters.severity });
        }
        return await query.orderBy('painPoint.reportedDate', 'DESC').getMany();
    }
    async findOne(id) {
        const painPoint = await this.painPointsRepository.findOne({ where: { id } });
        if (!painPoint) {
            throw new common_1.NotFoundException(`Pain point with ID ${id} not found`);
        }
        return painPoint;
    }
    async update(id, updateDto) {
        const painPoint = await this.findOne(id);
        Object.assign(painPoint, updateDto);
        return await this.painPointsRepository.save(painPoint);
    }
    async remove(id) {
        await this.painPointsRepository.delete(id);
    }
    async markAsResolved(id, resolutionNotes) {
        const painPoint = await this.findOne(id);
        painPoint.status = 'RESOLVED';
        painPoint.resolvedDate = new Date();
        painPoint.resolutionNotes = resolutionNotes;
        return await this.painPointsRepository.save(painPoint);
    }
    async getOpenIssues(projectId) {
        return await this.painPointsRepository
            .createQueryBuilder('painPoint')
            .where('painPoint.constructionProjectId = :projectId', { projectId })
            .andWhere('painPoint.status != :status', { status: 'RESOLVED' })
            .orderBy('painPoint.severity', 'DESC')
            .getMany();
    }
};
exports.PainPointsService = PainPointsService;
exports.PainPointsService = PainPointsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pain_point_entity_1.PainPoint)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PainPointsService);
//# sourceMappingURL=pain-points.service.js.map