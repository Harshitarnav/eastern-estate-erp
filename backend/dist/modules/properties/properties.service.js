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
const property_entity_1 = require("./entities/property.entity");
let PropertiesService = class PropertiesService {
    constructor(propertiesRepository) {
        this.propertiesRepository = propertiesRepository;
    }
    async create(createPropertyDto, userId) {
        const existingProperty = await this.propertiesRepository.findOne({
            where: { propertyCode: createPropertyDto.propertyCode },
        });
        if (existingProperty) {
            throw new common_1.BadRequestException(`Property with code ${createPropertyDto.propertyCode} already exists`);
        }
        const property = this.propertiesRepository.create({
            ...createPropertyDto,
            createdBy: userId,
        });
        const savedProperty = await this.propertiesRepository.save(property);
        return this.mapToResponseDto(savedProperty);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, city, state, status, projectType, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
        const queryBuilder = this.propertiesRepository
            .createQueryBuilder('property')
            .where('property.isActive = :isActive', { isActive: true });
        if (search) {
            queryBuilder.andWhere('(property.name ILIKE :search OR property.propertyCode ILIKE :search OR property.address ILIKE :search OR property.reraNumber ILIKE :search)', { search: `%${search}%` });
        }
        if (city) {
            queryBuilder.andWhere('property.city ILIKE :city', { city: `%${city}%` });
        }
        if (state) {
            queryBuilder.andWhere('property.state ILIKE :state', { state: `%${state}%` });
        }
        if (status) {
            queryBuilder.andWhere('property.status = :status', { status });
        }
        if (projectType) {
            queryBuilder.andWhere('property.projectType = :projectType', { projectType });
        }
        const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'propertyCode', 'launchDate'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`property.${sortField}`, sortOrder);
        const total = await queryBuilder.getCount();
        const properties = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const data = await Promise.all(properties.map(property => this.mapToResponseDto(property)));
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
            where: { id, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return this.mapToResponseDto(property);
    }
    async findByCode(code) {
        const property = await this.propertiesRepository.findOne({
            where: { propertyCode: code, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with code ${code} not found`);
        }
        return this.mapToResponseDto(property);
    }
    async update(id, updatePropertyDto, userId) {
        const property = await this.propertiesRepository.findOne({
            where: { id, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        if (updatePropertyDto.propertyCode && updatePropertyDto.propertyCode !== property.propertyCode) {
            const existingProperty = await this.propertiesRepository.findOne({
                where: { propertyCode: updatePropertyDto.propertyCode },
            });
            if (existingProperty) {
                throw new common_1.BadRequestException(`Property with code ${updatePropertyDto.propertyCode} already exists`);
            }
        }
        Object.assign(property, updatePropertyDto);
        property.updatedBy = userId;
        const updatedProperty = await this.propertiesRepository.save(property);
        return this.mapToResponseDto(updatedProperty);
    }
    async remove(id) {
        const property = await this.propertiesRepository.findOne({
            where: { id, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        property.isActive = false;
        await this.propertiesRepository.save(property);
        return { message: 'Property deleted successfully' };
    }
    async toggleActive(id) {
        const property = await this.propertiesRepository.findOne({
            where: { id },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        property.isActive = !property.isActive;
        const updatedProperty = await this.propertiesRepository.save(property);
        return this.mapToResponseDto(updatedProperty);
    }
    async getStats() {
        const totalProperties = await this.propertiesRepository.count({
            where: { isActive: true },
        });
        const activeProperties = await this.propertiesRepository.count({
            where: { isActive: true, status: 'Active' },
        });
        const underConstruction = await this.propertiesRepository.count({
            where: { isActive: true, status: 'Under Construction' },
        });
        const completed = await this.propertiesRepository.count({
            where: { isActive: true, status: 'Completed' },
        });
        return {
            totalProperties,
            activeProperties,
            underConstruction,
            completed,
        };
    }
    async mapToResponseDto(property) {
        return {
            id: property.id,
            propertyCode: property.propertyCode,
            name: property.name,
            description: property.description,
            address: property.address,
            city: property.city,
            state: property.state,
            pincode: property.pincode,
            latitude: property.latitude,
            longitude: property.longitude,
            totalArea: property.totalArea,
            areaUnit: property.areaUnit,
            launchDate: property.launchDate,
            expectedCompletionDate: property.expectedCompletionDate,
            actualCompletionDate: property.actualCompletionDate,
            reraNumber: property.reraNumber,
            projectType: property.projectType,
            status: property.status,
            images: property.images,
            documents: property.documents,
            amenities: property.amenities,
            isActive: property.isActive,
            createdBy: property.createdBy,
            updatedBy: property.updatedBy,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
            towers: 0,
            totalFlats: 0,
            soldFlats: 0,
            availableFlats: 0,
        };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map