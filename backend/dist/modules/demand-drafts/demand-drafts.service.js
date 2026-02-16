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
exports.DemandDraftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const demand_draft_entity_1 = require("./entities/demand-draft.entity");
let DemandDraftsService = class DemandDraftsService {
    constructor(demandDraftRepository) {
        this.demandDraftRepository = demandDraftRepository;
    }
    async findAll(query) {
        const queryBuilder = this.demandDraftRepository.createQueryBuilder('draft');
        if (query.flatId) {
            queryBuilder.andWhere('draft.flatId = :flatId', { flatId: query.flatId });
        }
        if (query.customerId) {
            queryBuilder.andWhere('draft.customerId = :customerId', { customerId: query.customerId });
        }
        if (query.bookingId) {
            queryBuilder.andWhere('draft.bookingId = :bookingId', { bookingId: query.bookingId });
        }
        if (query.status) {
            queryBuilder.andWhere('draft.status = :status', { status: query.status });
        }
        if (query.requiresReview !== undefined) {
            queryBuilder.andWhere('draft.requiresReview = :requiresReview', {
                requiresReview: query.requiresReview === 'true',
            });
        }
        queryBuilder.orderBy('draft.createdAt', 'DESC');
        return await queryBuilder.getMany();
    }
    async findOne(id) {
        const draft = await this.demandDraftRepository.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft with ID ${id} not found`);
        }
        return draft;
    }
    async create(createDto, userId) {
        const draft = this.demandDraftRepository.create({
            ...createDto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.demandDraftRepository.save(draft);
        return saved;
    }
    async update(id, updateDto, userId) {
        const draft = await this.findOne(id);
        for (const key in updateDto) {
            if (updateDto.hasOwnProperty(key)) {
                draft[key] = updateDto[key];
            }
        }
        draft.updatedBy = userId;
        return this.demandDraftRepository.save(draft);
    }
    async remove(id) {
        await this.findOne(id);
        await this.demandDraftRepository.delete(id);
    }
};
exports.DemandDraftsService = DemandDraftsService;
exports.DemandDraftsService = DemandDraftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DemandDraftsService);
//# sourceMappingURL=demand-drafts.service.js.map