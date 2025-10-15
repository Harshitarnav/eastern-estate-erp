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
const flat_entity_1 = require("./entities/flat.entity");
const dto_1 = require("./dto");
let FlatsService = class FlatsService {
    constructor(flatsRepository) {
        this.flatsRepository = flatsRepository;
    }
    async create(createFlatDto) {
        const existingFlat = await this.flatsRepository.findOne({
            where: {
                towerId: createFlatDto.towerId,
                flatNumber: createFlatDto.flatNumber,
            },
        });
        if (existingFlat) {
            throw new common_1.ConflictException(`Flat number ${createFlatDto.flatNumber} already exists in this tower`);
        }
        if (createFlatDto.finalPrice > createFlatDto.totalPrice) {
            throw new common_1.BadRequestException('Final price cannot be greater than total price');
        }
        if (createFlatDto.carpetArea > createFlatDto.builtUpArea) {
            throw new common_1.BadRequestException('Carpet area cannot be greater than built-up area');
        }
        if (createFlatDto.builtUpArea > createFlatDto.superBuiltUpArea) {
            throw new common_1.BadRequestException('Built-up area cannot be greater than super built-up area');
        }
        const flat = this.flatsRepository.create(createFlatDto);
        const savedFlat = await this.flatsRepository.save(flat);
        return dto_1.FlatResponseDto.fromEntity(savedFlat);
    }
    async findAll(query) {
        const { search, propertyId, towerId, type, status, isAvailable, minPrice, maxPrice, floor, bedrooms, vastuCompliant, cornerUnit, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.flatsRepository
            .createQueryBuilder('flat')
            .leftJoinAndSelect('flat.property', 'property')
            .leftJoinAndSelect('flat.tower', 'tower');
        if (search) {
            queryBuilder.andWhere('(flat.flatNumber ILIKE :search OR flat.name ILIKE :search OR flat.description ILIKE :search)', { search: `%${search}%` });
        }
        if (propertyId) {
            queryBuilder.andWhere('flat.propertyId = :propertyId', { propertyId });
        }
        if (towerId) {
            queryBuilder.andWhere('flat.towerId = :towerId', { towerId });
        }
        if (type) {
            queryBuilder.andWhere('flat.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('flat.status = :status', { status });
        }
        if (isAvailable !== undefined) {
            queryBuilder.andWhere('flat.isAvailable = :isAvailable', {
                isAvailable,
            });
        }
        if (minPrice !== undefined) {
            queryBuilder.andWhere('flat.finalPrice >= :minPrice', { minPrice });
        }
        if (maxPrice !== undefined) {
            queryBuilder.andWhere('flat.finalPrice <= :maxPrice', { maxPrice });
        }
        if (floor !== undefined) {
            queryBuilder.andWhere('flat.floor = :floor', { floor });
        }
        if (bedrooms !== undefined) {
            queryBuilder.andWhere('flat.bedrooms = :bedrooms', { bedrooms });
        }
        if (vastuCompliant !== undefined) {
            queryBuilder.andWhere('flat.vastuCompliant = :vastuCompliant', {
                vastuCompliant,
            });
        }
        if (cornerUnit !== undefined) {
            queryBuilder.andWhere('flat.cornerUnit = :cornerUnit', { cornerUnit });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('flat.isActive = :isActive', { isActive });
        }
        queryBuilder.orderBy(`flat.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const flats = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.FlatResponseDto.fromEntities(flats),
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
            relations: ['property', 'tower'],
        });
        if (!flat) {
            throw new common_1.NotFoundException(`Flat with ID ${id} not found`);
        }
        return dto_1.FlatResponseDto.fromEntity(flat);
    }
    async findByTower(towerId) {
        const flats = await this.flatsRepository.find({
            where: { towerId },
            relations: ['property', 'tower'],
            order: { floor: 'ASC', flatNumber: 'ASC' },
        });
        return dto_1.FlatResponseDto.fromEntities(flats);
    }
    async findByProperty(propertyId) {
        const flats = await this.flatsRepository.find({
            where: { propertyId },
            relations: ['property', 'tower'],
            order: { createdAt: 'DESC' },
        });
        return dto_1.FlatResponseDto.fromEntities(flats);
    }
    async update(id, updateFlatDto) {
        const flat = await this.flatsRepository.findOne({ where: { id } });
        if (!flat) {
            throw new common_1.NotFoundException(`Flat with ID ${id} not found`);
        }
        if (updateFlatDto.flatNumber &&
            updateFlatDto.flatNumber !== flat.flatNumber) {
            const existingFlat = await this.flatsRepository.findOne({
                where: {
                    towerId: flat.towerId,
                    flatNumber: updateFlatDto.flatNumber,
                },
            });
            if (existingFlat) {
                throw new common_1.ConflictException(`Flat number ${updateFlatDto.flatNumber} already exists in this tower`);
            }
        }
        const totalPrice = updateFlatDto.totalPrice ?? flat.totalPrice;
        const finalPrice = updateFlatDto.finalPrice ?? flat.finalPrice;
        if (finalPrice > totalPrice) {
            throw new common_1.BadRequestException('Final price cannot be greater than total price');
        }
        const superBuiltUpArea = updateFlatDto.superBuiltUpArea ?? flat.superBuiltUpArea;
        const builtUpArea = updateFlatDto.builtUpArea ?? flat.builtUpArea;
        const carpetArea = updateFlatDto.carpetArea ?? flat.carpetArea;
        if (carpetArea > builtUpArea) {
            throw new common_1.BadRequestException('Carpet area cannot be greater than built-up area');
        }
        if (builtUpArea > superBuiltUpArea) {
            throw new common_1.BadRequestException('Built-up area cannot be greater than super built-up area');
        }
        Object.assign(flat, updateFlatDto);
        const updatedFlat = await this.flatsRepository.save(flat);
        return dto_1.FlatResponseDto.fromEntity(updatedFlat);
    }
    async remove(id) {
        const flat = await this.flatsRepository.findOne({ where: { id } });
        if (!flat) {
            throw new common_1.NotFoundException(`Flat with ID ${id} not found`);
        }
        if (flat.status === 'BOOKED' || flat.status === 'SOLD') {
            throw new common_1.BadRequestException('Cannot delete a flat that is booked or sold');
        }
        flat.isActive = false;
        await this.flatsRepository.save(flat);
    }
    async getPropertyStats(propertyId) {
        const flats = await this.flatsRepository.find({
            where: { propertyId, isActive: true },
        });
        const total = flats.length;
        const available = flats.filter((f) => f.status === 'AVAILABLE').length;
        const booked = flats.filter((f) => f.status === 'BOOKED').length;
        const sold = flats.filter((f) => f.status === 'SOLD').length;
        const blocked = flats.filter((f) => f.status === 'BLOCKED').length;
        const totalRevenue = flats.reduce((sum, f) => sum + Number(f.finalPrice), 0);
        const soldRevenue = flats
            .filter((f) => f.status === 'SOLD')
            .reduce((sum, f) => sum + Number(f.finalPrice), 0);
        return {
            total,
            available,
            booked,
            sold,
            blocked,
            totalRevenue,
            soldRevenue,
            averagePrice: total > 0 ? totalRevenue / total : 0,
        };
    }
    async getTowerStats(towerId) {
        const flats = await this.flatsRepository.find({
            where: { towerId, isActive: true },
        });
        const total = flats.length;
        const available = flats.filter((f) => f.status === 'AVAILABLE').length;
        const booked = flats.filter((f) => f.status === 'BOOKED').length;
        const sold = flats.filter((f) => f.status === 'SOLD').length;
        const totalRevenue = flats.reduce((sum, f) => sum + Number(f.finalPrice), 0);
        return {
            total,
            available,
            booked,
            sold,
            totalRevenue,
            occupancyRate: total > 0 ? ((booked + sold) / total) * 100 : 0,
        };
    }
};
exports.FlatsService = FlatsService;
exports.FlatsService = FlatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FlatsService);
//# sourceMappingURL=flats.service.js.map