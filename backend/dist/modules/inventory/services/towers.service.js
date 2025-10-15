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
const tower_entity_1 = require("../entities/tower.entity");
const floor_entity_1 = require("../entities/floor.entity");
let TowersService = class TowersService {
    constructor(towersRepository, floorsRepository) {
        this.towersRepository = towersRepository;
        this.floorsRepository = floorsRepository;
    }
    async create(createTowerDto, userId) {
        const tower = this.towersRepository.create({
            ...createTowerDto,
            property: { id: createTowerDto.propertyId },
            createdBy: userId,
        });
        const savedTower = await this.towersRepository.save(tower);
        if (createTowerDto.totalFloors) {
            const floors = [];
            for (let i = 0; i < createTowerDto.totalFloors; i++) {
                floors.push(this.floorsRepository.create({
                    tower: { id: savedTower.id },
                    floorNumber: i,
                    floorName: `Floor ${i}`,
                    totalFlats: createTowerDto.flatsPerFloor || 0,
                }));
            }
            await this.floorsRepository.save(floors);
        }
        return savedTower;
    }
    async findAll(query = {}) {
        const { page = 1, limit = 10, propertyId, status } = query;
        const queryBuilder = this.towersRepository
            .createQueryBuilder('tower')
            .leftJoinAndSelect('tower.property', 'property')
            .leftJoinAndSelect('tower.floors', 'floors')
            .leftJoinAndSelect('tower.flats', 'flats');
        if (propertyId) {
            queryBuilder.where('tower.property.id = :propertyId', { propertyId });
        }
        if (status) {
            queryBuilder.andWhere('tower.status = :status', { status });
        }
        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('tower.createdAt', 'DESC')
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
        const tower = await this.towersRepository.findOne({
            where: { id },
            relations: ['property', 'floors', 'flats'],
        });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${id} not found`);
        }
        return tower;
    }
    async update(id, updateTowerDto, userId) {
        const tower = await this.findOne(id);
        Object.assign(tower, updateTowerDto);
        tower.updatedBy = userId;
        return await this.towersRepository.save(tower);
    }
    async remove(id) {
        const tower = await this.findOne(id);
        await this.towersRepository.remove(tower);
        return { message: 'Tower deleted successfully' };
    }
};
exports.TowersService = TowersService;
exports.TowersService = TowersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __param(1, (0, typeorm_1.InjectRepository)(floor_entity_1.Floor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TowersService);
//# sourceMappingURL=towers.service.js.map