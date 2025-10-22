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
exports.MaterialShortagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const material_shortage_entity_1 = require("./entities/material-shortage.entity");
let MaterialShortagesService = class MaterialShortagesService {
    constructor(shortagesRepository) {
        this.shortagesRepository = shortagesRepository;
    }
    async create(createDto) {
        const shortage = this.shortagesRepository.create(createDto);
        return await this.shortagesRepository.save(shortage);
    }
    async findAll(filters) {
        const query = this.shortagesRepository.createQueryBuilder('shortage');
        if (filters?.projectId) {
            query.andWhere('shortage.constructionProjectId = :projectId', { projectId: filters.projectId });
        }
        if (filters?.status) {
            query.andWhere('shortage.status = :status', { status: filters.status });
        }
        if (filters?.priority) {
            query.andWhere('shortage.priority = :priority', { priority: filters.priority });
        }
        return await query.orderBy('shortage.priority', 'DESC').addOrderBy('shortage.requiredByDate', 'ASC').getMany();
    }
    async findOne(id) {
        const shortage = await this.shortagesRepository.findOne({ where: { id } });
        if (!shortage) {
            throw new common_1.NotFoundException(`Material shortage with ID ${id} not found`);
        }
        return shortage;
    }
    async update(id, updateDto) {
        const shortage = await this.findOne(id);
        Object.assign(shortage, updateDto);
        return await this.shortagesRepository.save(shortage);
    }
    async remove(id) {
        await this.shortagesRepository.delete(id);
    }
    async markAsResolved(id) {
        const shortage = await this.findOne(id);
        shortage.status = 'RESOLVED';
        return await this.shortagesRepository.save(shortage);
    }
    async getCriticalShortages(projectId) {
        return await this.shortagesRepository
            .createQueryBuilder('shortage')
            .where('shortage.constructionProjectId = :projectId', { projectId })
            .andWhere('shortage.priority = :priority', { priority: 'CRITICAL' })
            .andWhere('shortage.status != :status', { status: 'RESOLVED' })
            .orderBy('shortage.requiredByDate', 'ASC')
            .getMany();
    }
};
exports.MaterialShortagesService = MaterialShortagesService;
exports.MaterialShortagesService = MaterialShortagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(material_shortage_entity_1.MaterialShortage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MaterialShortagesService);
//# sourceMappingURL=material-shortages.service.js.map