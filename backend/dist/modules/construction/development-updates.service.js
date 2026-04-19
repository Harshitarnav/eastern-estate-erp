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
exports.DevelopmentUpdatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construction_development_update_entity_1 = require("./entities/construction-development-update.entity");
const construction_project_entity_1 = require("./entities/construction-project.entity");
let DevelopmentUpdatesService = class DevelopmentUpdatesService {
    constructor(updatesRepo, projectRepo) {
        this.updatesRepo = updatesRepo;
        this.projectRepo = projectRepo;
    }
    async create(createDto, createdBy) {
        if (!createDto.constructionProjectId && !createDto.propertyId) {
            throw new common_1.BadRequestException('Either propertyId or constructionProjectId is required');
        }
        let propertyId = createDto.propertyId ?? null;
        if (!propertyId && createDto.constructionProjectId) {
            const project = await this.projectRepo.findOne({
                where: { id: createDto.constructionProjectId },
            });
            propertyId = project?.propertyId ?? null;
        }
        const update = this.updatesRepo.create({
            ...createDto,
            propertyId,
            scopeType: createDto.scopeType ?? null,
            category: createDto.category ?? null,
            towerId: createDto.towerId ?? null,
            commonAreaLabel: createDto.commonAreaLabel ?? null,
            constructionProjectId: createDto.constructionProjectId ?? null,
            updateDate: createDto.updateDate || new Date().toISOString().split('T')[0],
            createdBy,
        });
        return this.updatesRepo.save(update);
    }
    async findAll() {
        return this.updatesRepo.find({
            relations: ['constructionProject', 'creator', 'property', 'tower'],
            order: { updateDate: 'DESC' },
        });
    }
    async findScoped(filters, accessiblePropertyIds) {
        const qb = this.updatesRepo
            .createQueryBuilder('u')
            .leftJoinAndSelect('u.creator', 'creator')
            .leftJoinAndSelect('u.property', 'property')
            .leftJoinAndSelect('u.tower', 'tower')
            .leftJoinAndSelect('u.constructionProject', 'cp')
            .orderBy('u.updateDate', 'DESC')
            .addOrderBy('u.createdAt', 'DESC');
        if (filters.propertyId) {
            qb.andWhere('u.property_id = :propertyId', { propertyId: filters.propertyId });
        }
        else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
            qb.andWhere('(u.property_id IS NULL OR u.property_id IN (:...accIds))', {
                accIds: accessiblePropertyIds,
            });
        }
        if (filters.towerId) {
            qb.andWhere('u.tower_id = :towerId', { towerId: filters.towerId });
        }
        if (filters.scopeType) {
            qb.andWhere('u.scope_type = :scopeType', { scopeType: filters.scopeType });
        }
        if (filters.category) {
            qb.andWhere('u.category = :category', { category: filters.category });
        }
        if (typeof filters.limit === 'number')
            qb.take(filters.limit);
        if (typeof filters.offset === 'number')
            qb.skip(filters.offset);
        return qb.getMany();
    }
    async findByProject(projectId) {
        return this.updatesRepo.find({
            where: { constructionProjectId: projectId },
            relations: ['creator'],
            order: { updateDate: 'DESC' },
        });
    }
    async findOne(id) {
        const update = await this.updatesRepo.findOne({
            where: { id },
            relations: ['constructionProject', 'creator'],
        });
        if (!update) {
            throw new common_1.NotFoundException('Development update not found');
        }
        return update;
    }
    async update(id, updateDto) {
        const update = await this.findOne(id);
        Object.assign(update, updateDto);
        return this.updatesRepo.save(update);
    }
    async remove(id) {
        const update = await this.findOne(id);
        return this.updatesRepo.remove(update);
    }
    async addImages(id, imageUrls) {
        const update = await this.findOne(id);
        if (!Array.isArray(update.images)) {
            update.images = [];
        }
        update.images = [...update.images, ...imageUrls];
        return this.updatesRepo.save(update);
    }
    async removeImage(id, imageUrl) {
        const update = await this.findOne(id);
        if (Array.isArray(update.images)) {
            update.images = update.images.filter((img) => img !== imageUrl);
            return this.updatesRepo.save(update);
        }
        return update;
    }
    async addAttachments(id, attachmentUrls) {
        const update = await this.findOne(id);
        if (!Array.isArray(update.attachments)) {
            update.attachments = [];
        }
        update.attachments = [...update.attachments, ...attachmentUrls];
        return this.updatesRepo.save(update);
    }
    async getRecentUpdates(projectId, days = 7) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        return this.updatesRepo
            .createQueryBuilder('update')
            .leftJoinAndSelect('update.creator', 'creator')
            .where('update.constructionProjectId = :projectId', { projectId })
            .andWhere('update.updateDate >= :dateThreshold', {
            dateThreshold: dateThreshold.toISOString().split('T')[0],
        })
            .orderBy('update.updateDate', 'DESC')
            .getMany();
    }
    async getUpdatesWithImages(projectId) {
        return this.updatesRepo
            .createQueryBuilder('update')
            .leftJoinAndSelect('update.creator', 'creator')
            .where('update.constructionProjectId = :projectId', { projectId })
            .andWhere("jsonb_array_length(update.images) > 0")
            .orderBy('update.updateDate', 'DESC')
            .getMany();
    }
    async getUpdatesByVisibility(projectId, visibility) {
        return this.updatesRepo.find({
            where: {
                constructionProjectId: projectId,
                visibility: visibility,
            },
            relations: ['creator'],
            order: { updateDate: 'DESC' },
        });
    }
    async getUpdatesTimeline(projectId) {
        const updates = await this.findByProject(projectId);
        const grouped = updates.reduce((acc, update) => {
            const date = new Date(update.updateDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(update);
            return acc;
        }, {});
        return Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, updates]) => ({
            month,
            updates,
            count: updates.length,
        }));
    }
    async getProjectUpdateStatistics(projectId) {
        const updates = await this.findByProject(projectId);
        return {
            totalUpdates: updates.length,
            updatesWithImages: updates.filter((u) => u.hasImages).length,
            updatesWithAttachments: updates.filter((u) => u.hasAttachments).length,
            recentUpdates: updates.filter((u) => u.isRecent).length,
            totalImages: updates.reduce((sum, u) => sum + u.imageCount, 0),
            totalAttachments: updates.reduce((sum, u) => sum + u.attachmentCount, 0),
        };
    }
};
exports.DevelopmentUpdatesService = DevelopmentUpdatesService;
exports.DevelopmentUpdatesService = DevelopmentUpdatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(construction_development_update_entity_1.ConstructionDevelopmentUpdate)),
    __param(1, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DevelopmentUpdatesService);
//# sourceMappingURL=development-updates.service.js.map