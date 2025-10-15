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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
let PropertiesService = class PropertiesService {
    constructor(propertiesRepository) {
        this.propertiesRepository = propertiesRepository;
    }
    async create(createPropertyDto, userId) {
        const property = this.propertiesRepository.create({
            ...createPropertyDto,
            createdBy: userId,
        });
        return await this.propertiesRepository.save(property);
    }
    async findAll(query = {}) {
        const { page = 1, limit = 10, search, status } = query;
        const queryBuilder = this.propertiesRepository
            .createQueryBuilder('property')
            .leftJoinAndSelect('property.towers', 'towers');
        if (search) {
            queryBuilder.where('property.name ILIKE :search OR property.propertyCode ILIKE :search', { search: `%${search}%` });
        }
        if (status) {
            queryBuilder.andWhere('property.status = :status', { status });
        }
        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('property.createdAt', 'DESC')
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
        const property = await this.propertiesRepository.findOne({
            where: { id },
            relations: ['towers', 'towers.flats'],
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return property;
    }
    async update(id, updatePropertyDto, userId) {
        const property = await this.findOne(id);
        Object.assign(property, updatePropertyDto);
        property.updatedBy = userId;
        return await this.propertiesRepository.save(property);
    }
    async remove(id) {
        const property = await this.findOne(id);
        await this.propertiesRepository.remove(property);
        return { message: 'Property deleted successfully' };
    }
    async getInventorySummary(propertyId) {
        const query = `
      SELECT 
        f.flat_type,
        COUNT(*) as total_flats,
        COUNT(CASE WHEN f.status = 'Available' THEN 1 END) as available,
        COUNT(CASE WHEN f.status = 'Booked' THEN 1 END) as booked,
        COUNT(CASE WHEN f.status = 'Sold' THEN 1 END) as sold,
        SUM(f.total_price) as total_value,
        SUM(CASE WHEN f.status = 'Available' THEN f.total_price ELSE 0 END) as available_value
      FROM flats f
      WHERE f.property_id = $1 AND f.is_active = true
      GROUP BY f.flat_type
    `;
        return await this.propertiesRepository.query(query, [propertyId]);
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map