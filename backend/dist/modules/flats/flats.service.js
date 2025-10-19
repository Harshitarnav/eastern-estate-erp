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
const tower_entity_1 = require("../towers/entities/tower.entity");
const dto_1 = require("./dto");
const property_inventory_summary_dto_1 = require("../properties/dto/property-inventory-summary.dto");
const data_completeness_status_enum_1 = require("../../common/enums/data-completeness-status.enum");
let FlatsService = class FlatsService {
    constructor(flatsRepository, towersRepository) {
        this.flatsRepository = flatsRepository;
        this.towersRepository = towersRepository;
    }
    normalizeSimpleArray(values) {
        if (!values) {
            return undefined;
        }
        const normalized = values
            .map((value) => (typeof value === 'string' ? value.trim() : value))
            .filter((value) => Boolean(value));
        return normalized.length > 0 ? normalized : undefined;
    }
    toNumber(value) {
        if (value === null || value === undefined) {
            return 0;
        }
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    }
    buildChecklist(flatLike) {
        const superBuiltUpArea = this.toNumber(flatLike.superBuiltUpArea);
        const builtUpArea = this.toNumber(flatLike.builtUpArea);
        const carpetArea = this.toNumber(flatLike.carpetArea);
        const hasArea = superBuiltUpArea > 0 && builtUpArea > 0 && carpetArea > 0;
        const hasPricing = this.toNumber(flatLike.basePrice) > 0 &&
            this.toNumber(flatLike.totalPrice) > 0 &&
            this.toNumber(flatLike.finalPrice) > 0;
        const hasFacing = Boolean(flatLike.facing);
        const hasAmenities = Array.isArray(flatLike.amenities) && flatLike.amenities.length > 0;
        const hasParkingMap = this.toNumber(flatLike.parkingSlots) > 0 || Boolean(flatLike.coveredParking);
        return {
            has_area: hasArea,
            has_pricing: hasPricing,
            has_facing: hasFacing,
            has_amenities: hasAmenities,
            has_parking_map: hasParkingMap,
        };
    }
    evaluateFlatMetadata(flatLike) {
        const checklist = this.buildChecklist(flatLike);
        const total = Object.keys(checklist).length || 1;
        const completed = Object.values(checklist).filter(Boolean).length;
        const pctRaw = (completed / total) * 100;
        const dataCompletionPct = Math.round(pctRaw * 100) / 100;
        const issues = [];
        if (!checklist.has_area) {
            issues.push('Area details incomplete');
        }
        if (!checklist.has_pricing) {
            issues.push('Pricing information incomplete');
        }
        if (!checklist.has_facing) {
            issues.push('Facing direction missing');
        }
        if (!checklist.has_amenities) {
            issues.push('Amenities not provided');
        }
        if (!checklist.has_parking_map) {
            issues.push('Parking allocation not defined');
        }
        const superBuiltUpArea = this.toNumber(flatLike.superBuiltUpArea);
        const builtUpArea = this.toNumber(flatLike.builtUpArea);
        const carpetArea = this.toNumber(flatLike.carpetArea);
        if (builtUpArea > superBuiltUpArea && superBuiltUpArea > 0) {
            issues.push('Built-up area exceeds super built-up area');
        }
        if (carpetArea > builtUpArea && builtUpArea > 0) {
            issues.push('Carpet area exceeds built-up area');
        }
        if (this.toNumber(flatLike.basePrice) > 0 && this.toNumber(flatLike.carpetArea) === 0) {
            issues.push('Pricing present but carpet area missing');
        }
        let completenessStatus;
        if (dataCompletionPct === 0) {
            completenessStatus = data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED;
        }
        else if (dataCompletionPct === 100 && issues.length === 0) {
            completenessStatus = data_completeness_status_enum_1.DataCompletenessStatus.COMPLETE;
        }
        else if (issues.length > 0) {
            completenessStatus = data_completeness_status_enum_1.DataCompletenessStatus.NEEDS_REVIEW;
        }
        else {
            completenessStatus = data_completeness_status_enum_1.DataCompletenessStatus.IN_PROGRESS;
        }
        return {
            checklist,
            dataCompletionPct,
            completenessStatus,
            issues,
        };
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
        const normalizedCreateDto = {
            ...createFlatDto,
            amenities: this.normalizeSimpleArray(createFlatDto.amenities),
            images: this.normalizeSimpleArray(createFlatDto.images),
        };
        const metadata = this.evaluateFlatMetadata(normalizedCreateDto);
        const flat = this.flatsRepository.create({
            ...normalizedCreateDto,
            flatChecklist: metadata.checklist,
            dataCompletionPct: metadata.dataCompletionPct,
            completenessStatus: metadata.completenessStatus,
            issues: metadata.issues,
            issuesCount: metadata.issues.length,
        });
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
    async getTowerInventorySummary(towerId) {
        const tower = await this.towersRepository.findOne({
            where: { id: towerId },
            relations: ['property'],
        });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${towerId} not found`);
        }
        const flats = await this.flatsRepository.find({
            where: { towerId, isActive: true },
            order: { floor: 'ASC', flatNumber: 'ASC' },
        });
        const salesBreakdown = (0, property_inventory_summary_dto_1.emptySalesBreakdown)();
        const completeness = (0, dto_1.emptyFlatCompleteness)();
        let completionAccumulator = 0;
        let issuesAccumulator = 0;
        const units = flats.map((flat) => {
            const statusKey = (0, property_inventory_summary_dto_1.flatStatusToBreakdownKey)(flat.status);
            salesBreakdown[statusKey] += 1;
            salesBreakdown.total += 1;
            let checklist = flat.flatChecklist ?? null;
            let dataCompletionPct = this.toNumber(flat.dataCompletionPct);
            let completenessStatus = flat.completenessStatus ?? data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED;
            let issues = Array.isArray(flat.issues) ? flat.issues : [];
            let issuesCount = flat.issuesCount ?? issues.length;
            if (!checklist || (dataCompletionPct === 0 && !flat.dataCompletionPct)) {
                const metadata = this.evaluateFlatMetadata(flat);
                checklist = metadata.checklist;
                dataCompletionPct = metadata.dataCompletionPct;
                completenessStatus = metadata.completenessStatus;
                issues = metadata.issues;
                issuesCount = metadata.issues.length;
            }
            switch (completenessStatus) {
                case data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED:
                    completeness.notStarted += 1;
                    break;
                case data_completeness_status_enum_1.DataCompletenessStatus.NEEDS_REVIEW:
                    completeness.needsReview += 1;
                    break;
                case data_completeness_status_enum_1.DataCompletenessStatus.COMPLETE:
                    completeness.complete += 1;
                    break;
                case data_completeness_status_enum_1.DataCompletenessStatus.IN_PROGRESS:
                default:
                    completeness.inProgress += 1;
                    break;
            }
            completionAccumulator += dataCompletionPct;
            issuesAccumulator += issuesCount;
            return {
                id: flat.id,
                flatNumber: flat.flatNumber,
                floor: flat.floor ?? 0,
                type: flat.type,
                carpetArea: this.toNumber(flat.carpetArea),
                superBuiltUpArea: this.toNumber(flat.superBuiltUpArea),
                builtUpArea: this.toNumber(flat.builtUpArea),
                facing: flat.facing,
                basePrice: this.toNumber(flat.basePrice),
                pricePerSqft: flat.pricePerSqft ? this.toNumber(flat.pricePerSqft) : undefined,
                status: flat.status,
                dataCompletionPct,
                completenessStatus,
                checklist,
                issues,
                issuesCount,
            };
        });
        const unitsDefined = flats.length;
        const unitsPlanned = tower.unitsPlanned ?? tower.totalUnits ?? unitsDefined;
        const missingUnits = Math.max(unitsPlanned - unitsDefined, 0);
        const averageCompletionPct = unitsDefined
            ? Math.round((completionAccumulator / unitsDefined) * 100) / 100
            : 0;
        return {
            towerId: tower.id,
            towerName: tower.name,
            towerNumber: tower.towerNumber,
            propertyId: tower.propertyId,
            propertyName: tower.property?.name,
            propertyCode: tower.property?.propertyCode,
            unitsPlanned,
            unitsDefined,
            missingUnits,
            averageCompletionPct,
            completeness,
            issuesCount: issuesAccumulator,
            salesBreakdown,
            units,
            generatedAt: new Date().toISOString(),
        };
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
        const normalizedUpdateDto = {
            ...updateFlatDto,
            amenities: this.normalizeSimpleArray(updateFlatDto.amenities),
            images: this.normalizeSimpleArray(updateFlatDto.images),
        };
        Object.assign(flat, normalizedUpdateDto);
        const metadata = this.evaluateFlatMetadata(flat);
        flat.flatChecklist = metadata.checklist;
        flat.dataCompletionPct = metadata.dataCompletionPct;
        flat.completenessStatus = metadata.completenessStatus;
        flat.issues = metadata.issues;
        flat.issuesCount = metadata.issues.length;
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
        const onHold = flats.filter((f) => f.status === 'ON_HOLD').length;
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
            onHold,
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
        const onHold = flats.filter((f) => f.status === 'ON_HOLD').length;
        const totalRevenue = flats.reduce((sum, f) => sum + Number(f.finalPrice), 0);
        return {
            total,
            available,
            booked,
            sold,
            onHold,
            totalRevenue,
            occupancyRate: total > 0 ? ((booked + sold) / total) * 100 : 0,
        };
    }
    async getGlobalStats() {
        const record = await this.flatsRepository
            .createQueryBuilder('flat')
            .select('COUNT(*)', 'total')
            .addSelect("SUM(CASE WHEN flat.status = :available THEN 1 ELSE 0 END)", 'available')
            .addSelect("SUM(CASE WHEN flat.status = :sold THEN 1 ELSE 0 END)", 'sold')
            .addSelect("SUM(CASE WHEN flat.status = :booked THEN 1 ELSE 0 END)", 'booked')
            .addSelect("SUM(CASE WHEN flat.status = :blocked THEN 1 ELSE 0 END)", 'blocked')
            .addSelect("SUM(CASE WHEN flat.status = :onHold THEN 1 ELSE 0 END)", 'onHold')
            .addSelect("SUM(CASE WHEN flat.status = :underConstruction THEN 1 ELSE 0 END)", 'underConstruction')
            .setParameters({
            available: flat_entity_1.FlatStatus.AVAILABLE,
            sold: flat_entity_1.FlatStatus.SOLD,
            booked: flat_entity_1.FlatStatus.BOOKED,
            blocked: flat_entity_1.FlatStatus.BLOCKED,
            onHold: flat_entity_1.FlatStatus.ON_HOLD,
            underConstruction: flat_entity_1.FlatStatus.UNDER_CONSTRUCTION,
        })
            .getRawOne();
        return {
            total: Number(record?.total ?? 0),
            available: Number(record?.available ?? 0),
            sold: Number(record?.sold ?? 0),
            booked: Number(record?.booked ?? 0),
            blocked: Number(record?.blocked ?? 0),
            onHold: Number(record?.onHold ?? 0),
            underConstruction: Number(record?.underConstruction ?? 0),
        };
    }
};
exports.FlatsService = FlatsService;
exports.FlatsService = FlatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(1, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FlatsService);
//# sourceMappingURL=flats.service.js.map