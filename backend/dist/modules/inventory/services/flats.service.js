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
exports.FlatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flat_entity_1 = require("../entities/flat.entity");
let FlatsService = class FlatsService {
    constructor(flatsRepository) {
        this.flatsRepository = flatsRepository;
    }
    async create(createFlatDto, userId) {
        const flat = this.flatsRepository.create({
            ...createFlatDto,
            property: { id: createFlatDto.propertyId },
            tower: { id: createFlatDto.towerId },
            floor: { id: createFlatDto.floorId },
            createdBy: userId,
        });
        return await this.flatsRepository.save(flat);
    }
    async createBulk(flats, userId) {
        const flatEntities = flats.map(flatDto => this.flatsRepository.create({
            ...flatDto,
            property: { id: flatDto.propertyId },
            tower: { id: flatDto.towerId },
            floor: { id: flatDto.floorId },
            createdBy: userId,
        }));
        return await this.flatsRepository.save(flatEntities);
    }
    async findAll(query = {}) {
        const { page = 1, limit = 10, propertyId, towerId, floorId, status, flatType, minPrice, maxPrice } = query;
        const queryBuilder = this.flatsRepository
            .createQueryBuilder('flat')
            .leftJoinAndSelect('flat.property', 'property')
            .leftJoinAndSelect('flat.tower', 'tower')
            .leftJoinAndSelect('flat.floor', 'floor');
        if (propertyId) {
            queryBuilder.andWhere('flat.property.id = :propertyId', { propertyId });
        }
        if (towerId) {
            queryBuilder.andWhere('flat.tower.id = :towerId', { towerId });
        }
        if (floorId) {
            queryBuilder.andWhere('flat.floor.id = :floorId', { floorId });
        }
        if (status) {
            if (Array.isArray(status)) {
                queryBuilder.andWhere('flat.status IN (:...status)', { status });
            }
            else {
                queryBuilder.andWhere('flat.status = :status', { status });
            }
        }
        if (flatType) {
            queryBuilder.andWhere('flat.flatType = :flatType', { flatType });
        }
        if (minPrice) {
            queryBuilder.andWhere('flat.totalPrice >= :minPrice', { minPrice });
        }
        if (maxPrice) {
            queryBuilder.andWhere('flat.totalPrice <= :maxPrice', { maxPrice });
        }
        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('flat.createdAt', 'DESC')
            .getManyAndCount();
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
        const flat = await this.flatsRepository.findOne({
            where: { id },
            relations: ['property', 'tower', 'floor'],
        });
        if (!flat) {
            throw new common_1.NotFoundException(`Flat with ID ${id} not found`);
        }
        return flat;
    }
    async update(id, updateFlatDto, userId) {
        const flat = await this.findOne(id);
        Object.assign(flat, updateFlatDto);
        flat.updatedBy = userId;
        return await this.flatsRepository.save(flat);
    }
    async updateStatus(id, status, userId) {
        const flat = await this.findOne(id);
        flat.status = status;
        flat.updatedBy = userId;
        return await this.flatsRepository.save(flat);
    }
    async updateBulkStatus(ids, status, userId) {
        await this.flatsRepository.update({ id: (0, typeorm_2.In)(ids) }, { status, updatedBy: userId });
        return { message: 'Flats updated successfully' };
    }
    async remove(id) {
        const flat = await this.findOne(id);
        await this.flatsRepository.remove(flat);
        return { message: 'Flat deleted successfully' };
    }
};
exports.FlatsService = FlatsService;
exports.FlatsService = FlatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FlatsService);
//# sourceMappingURL=flats.service.js.map