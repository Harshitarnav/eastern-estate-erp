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
exports.TowersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tower_entity_1 = require("./entities/tower.entity");
const property_entity_1 = require("../properties/entities/property.entity");
let TowersService = class TowersService {
    constructor(towerRepository, propertyRepository) {
        this.towerRepository = towerRepository;
        this.propertyRepository = propertyRepository;
    }
    async create(createTowerDto) {
        const property = await this.propertyRepository.findOne({
            where: { id: createTowerDto.propertyId, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${createTowerDto.propertyId} not found. Every tower needs a home (property) to belong to.`);
        }
        const existingTower = await this.towerRepository.findOne({
            where: {
                propertyId: createTowerDto.propertyId,
                towerNumber: createTowerDto.towerNumber,
            },
        });
        if (existingTower) {
            throw new common_1.ConflictException(`Tower number ${createTowerDto.towerNumber} already exists in ${property.name}. Each tower deserves a unique identity.`);
        }
        this.validateTowerData(createTowerDto);
        const tower = this.towerRepository.create({
            ...createTowerDto,
            constructionStartDate: createTowerDto.constructionStartDate
                ? new Date(createTowerDto.constructionStartDate)
                : null,
            completionDate: createTowerDto.completionDate
                ? new Date(createTowerDto.completionDate)
                : null,
        });
        const savedTower = await this.towerRepository.save(tower);
        return this.formatTowerResponse(savedTower, property);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, propertyId, constructionStatus, vastuCompliant, facing, minFloors, maxFloors, isActive = true, sortBy = 'displayOrder', sortOrder = 'ASC', } = queryDto;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (propertyId) {
            where.propertyId = propertyId;
        }
        if (constructionStatus) {
            where.constructionStatus = constructionStatus;
        }
        if (vastuCompliant !== undefined) {
            where.vastuCompliant = vastuCompliant;
        }
        if (facing) {
            where.facing = facing;
        }
        const queryBuilder = this.towerRepository
            .createQueryBuilder('tower')
            .leftJoinAndSelect('tower.property', 'property')
            .where(where);
        if (search) {
            queryBuilder.andWhere('(tower.name ILIKE :search OR tower.towerNumber ILIKE :search OR tower.description ILIKE :search)', { search: `%${search}%` });
        }
        if (minFloors !== undefined) {
            queryBuilder.andWhere('tower.totalFloors >= :minFloors', { minFloors });
        }
        if (maxFloors !== undefined) {
            queryBuilder.andWhere('tower.totalFloors <= :maxFloors', { maxFloors });
        }
        const validSortFields = ['name', 'towerNumber', 'totalFloors', 'totalUnits', 'displayOrder', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'displayOrder';
        queryBuilder.orderBy(`tower.${sortField}`, sortOrder);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [towers, total] = await queryBuilder.getManyAndCount();
        const data = towers.map((tower) => this.formatTowerResponse(tower, tower.property));
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
        const tower = await this.towerRepository.findOne({
            where: { id },
            relations: ['property'],
        });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${id} not found. Let's help you find the perfect tower for your needs.`);
        }
        return this.formatTowerResponse(tower, tower.property);
    }
    async update(id, updateTowerDto) {
        const tower = await this.towerRepository.findOne({
            where: { id },
            relations: ['property'],
        });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${id} not found. We're committed to maintaining accurate records.`);
        }
        if (updateTowerDto.towerNumber && updateTowerDto.towerNumber !== tower.towerNumber) {
            const conflictTower = await this.towerRepository.findOne({
                where: {
                    propertyId: tower.propertyId,
                    towerNumber: updateTowerDto.towerNumber,
                },
            });
            if (conflictTower && conflictTower.id !== id) {
                throw new common_1.ConflictException(`Tower number ${updateTowerDto.towerNumber} already exists in this property.`);
            }
        }
        if (updateTowerDto.totalFloors !== undefined || updateTowerDto.totalUnits !== undefined) {
            this.validateTowerData({
                ...tower,
                ...updateTowerDto,
            });
        }
        if (updateTowerDto.constructionStartDate) {
            tower.constructionStartDate = new Date(updateTowerDto.constructionStartDate);
        }
        if (updateTowerDto.completionDate) {
            tower.completionDate = new Date(updateTowerDto.completionDate);
        }
        Object.assign(tower, updateTowerDto);
        const updatedTower = await this.towerRepository.save(tower);
        return this.formatTowerResponse(updatedTower, tower.property);
    }
    async remove(id) {
        const tower = await this.towerRepository.findOne({ where: { id } });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${id} not found.`);
        }
        tower.isActive = false;
        await this.towerRepository.save(tower);
        return {
            message: `Tower ${tower.name} has been deactivated. Historical data preserved for your records.`,
        };
    }
    async findByProperty(propertyId) {
        const towers = await this.towerRepository.find({
            where: { propertyId, isActive: true },
            relations: ['property'],
            order: { displayOrder: 'ASC' },
        });
        return towers.map((tower) => this.formatTowerResponse(tower, tower.property));
    }
    async getStatistics(id) {
        const tower = await this.findOne(id);
        return {
            towerId: tower.id,
            towerName: tower.name,
            totalFloors: tower.totalFloors,
            totalUnits: tower.totalUnits,
            constructionStatus: tower.constructionStatus,
            availableUnits: 0,
            soldUnits: 0,
            bookedUnits: 0,
            occupancyRate: 0,
        };
    }
    validateTowerData(data) {
        if (data.constructionStartDate && data.completionDate) {
            const startDate = new Date(data.constructionStartDate);
            const endDate = new Date(data.completionDate);
            if (endDate < startDate) {
                throw new common_1.BadRequestException('Completion date cannot be earlier than construction start date. Time flows forward, so do our projects.');
            }
        }
        if (data.totalUnits && data.totalFloors) {
            const unitsPerFloor = data.totalUnits / data.totalFloors;
            if (unitsPerFloor < 1 || unitsPerFloor > 20) {
                throw new common_1.BadRequestException('Units per floor ratio seems unusual (should be between 1 and 20). Please verify your numbers.');
            }
        }
        if (data.carpetArea && data.builtUpArea) {
            if (data.carpetArea > data.builtUpArea) {
                throw new common_1.BadRequestException('Carpet area cannot exceed built-up area. Lets ensure accurate measurements.');
            }
        }
    }
    formatTowerResponse(tower, property) {
        const response = {
            id: tower.id,
            name: tower.name,
            towerNumber: tower.towerNumber,
            description: tower.description,
            totalFloors: tower.totalFloors,
            totalUnits: tower.totalUnits,
            basementLevels: tower.basementLevels,
            unitsPerFloor: tower.unitsPerFloor,
            amenities: tower.amenities,
            constructionStatus: tower.constructionStatus,
            constructionStartDate: tower.constructionStartDate,
            completionDate: tower.completionDate,
            reraNumber: tower.reraNumber,
            builtUpArea: tower.builtUpArea,
            carpetArea: tower.carpetArea,
            ceilingHeight: tower.ceilingHeight,
            numberOfLifts: tower.numberOfLifts,
            vastuCompliant: tower.vastuCompliant,
            facing: tower.facing,
            specialFeatures: tower.specialFeatures,
            isActive: tower.isActive,
            displayOrder: tower.displayOrder,
            images: tower.images,
            floorPlans: tower.floorPlans,
            propertyId: tower.propertyId,
            createdAt: tower.createdAt,
            updatedAt: tower.updatedAt,
        };
        if (property) {
            response.property = {
                id: property.id,
                name: property.name,
                propertyCode: property.propertyCode,
                city: property.city,
                state: property.state,
            };
        }
        return response;
    }
};
exports.TowersService = TowersService;
exports.TowersService = TowersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TowersService);
//# sourceMappingURL=towers.service.js.map