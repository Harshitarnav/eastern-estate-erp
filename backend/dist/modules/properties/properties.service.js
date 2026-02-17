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
var PropertiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("./entities/property.entity");
const tower_entity_1 = require("../towers/entities/tower.entity");
const flat_entity_1 = require("../flats/entities/flat.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const dto_1 = require("./dto");
const data_completeness_status_enum_1 = require("../../common/enums/data-completeness-status.enum");
const flat_generation_util_1 = require("../towers/utils/flat-generation.util");
const property_access_service_1 = require("../users/services/property-access.service");
let PropertiesService = PropertiesService_1 = class PropertiesService {
    constructor(propertiesRepository, towersRepository, flatsRepository, customersRepository, bookingsRepository, dataSource, propertyAccessService) {
        this.propertiesRepository = propertiesRepository;
        this.towersRepository = towersRepository;
        this.flatsRepository = flatsRepository;
        this.customersRepository = customersRepository;
        this.bookingsRepository = bookingsRepository;
        this.dataSource = dataSource;
        this.propertyAccessService = propertyAccessService;
        this.logger = new common_1.Logger(PropertiesService_1.name);
    }
    async checkPropertyAccess(propertyId, userId) {
        const hasAccess = await this.propertyAccessService.hasAccess(userId, propertyId);
        if (!hasAccess) {
            throw new common_1.NotFoundException(`Property not found or you don't have access`);
        }
    }
    async create(createPropertyDto, userId) {
        const existingProperty = await this.propertiesRepository.findOne({
            where: { propertyCode: createPropertyDto.propertyCode },
        });
        if (existingProperty) {
            throw new common_1.BadRequestException(`Property with code ${createPropertyDto.propertyCode} already exists`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const propertyRepository = queryRunner.manager.getRepository(property_entity_1.Property);
            const normalizedPayload = this.normalizePropertyPayload(createPropertyDto);
            const towersCount = Math.max(createPropertyDto.numberOfTowers ?? 1, 1);
            const totalUnits = Math.max(createPropertyDto.numberOfUnits ?? towersCount, 1);
            const property = propertyRepository.create({
                ...normalizedPayload,
                status: normalizedPayload.status ?? 'Active',
                isActive: normalizedPayload.isActive ?? true,
                isFeatured: normalizedPayload.isFeatured ?? false,
                createdBy: userId,
                numberOfTowers: towersCount,
                numberOfUnits: totalUnits,
            });
            const savedProperty = await propertyRepository.save(property);
            await this.createDefaultTowersAndFlats(queryRunner.manager, savedProperty, {
                ...createPropertyDto,
                numberOfTowers: towersCount,
                numberOfUnits: totalUnits,
            });
            await queryRunner.commitTransaction();
            const hydratedProperty = await this.propertiesRepository.findOne({
                where: { id: savedProperty.id },
            });
            return this.mapToResponseDto(hydratedProperty ?? savedProperty);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(queryDto, userId) {
        const { page = 1, limit = 10, search, city, state, status, projectType, projectId, sortBy = 'createdAt', sortOrder = 'DESC', isActive, } = queryDto;
        const activeFilter = isActive ?? true;
        const queryBuilder = this.propertiesRepository
            .createQueryBuilder('property')
            .where('property.isActive = :isActive', { isActive: activeFilter });
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
        if (projectId) {
            queryBuilder.andWhere('property.projectId = :projectId', { projectId });
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
    async getInventorySummary(propertyId, userId) {
        const property = await this.propertiesRepository.findOne({
            where: { id: propertyId },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${propertyId} not found`);
        }
        const towers = await this.towersRepository.find({
            where: { propertyId, isActive: true },
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
        const towerIds = towers.map((tower) => tower.id);
        const towerStatusAggregation = {};
        const propertySalesBreakdown = (0, dto_1.emptySalesBreakdown)();
        const towerFinancials = await this.getTowerFinancials(towerIds);
        const constructionMap = new Map();
        if (towerIds.length > 0) {
            const flatAggregation = await this.flatsRepository
                .createQueryBuilder('flat')
                .select('flat.towerId', 'towerId')
                .addSelect('flat.status', 'status')
                .addSelect('COUNT(*)::int', 'count')
                .where('flat.towerId IN (:...towerIds)', { towerIds })
                .andWhere('flat.isActive = :active', { active: true })
                .groupBy('flat.towerId')
                .addGroupBy('flat.status')
                .getRawMany();
            for (const row of flatAggregation) {
                const { towerId, status, count } = row;
                const numericCount = Number(count) || 0;
                if (!towerStatusAggregation[towerId]) {
                    towerStatusAggregation[towerId] = { total: 0, statuses: {} };
                }
                towerStatusAggregation[towerId].total += numericCount;
                towerStatusAggregation[towerId].statuses[status] =
                    (towerStatusAggregation[towerId].statuses[status] ?? 0) + numericCount;
                const propertyKey = (0, dto_1.flatStatusToBreakdownKey)(status);
                propertySalesBreakdown[propertyKey] += numericCount;
                propertySalesBreakdown.total += numericCount;
            }
        }
        const towersCompleteness = (0, dto_1.emptyTowersCompleteness)();
        const towersToPatch = [];
        const towerSummaries = await Promise.all(towers.map(async (tower) => {
            const aggregation = towerStatusAggregation[tower.id] ?? { total: 0, statuses: {} };
            const salesBreakdown = (0, dto_1.emptySalesBreakdown)();
            Object.entries(aggregation.statuses).forEach(([statusKey, count]) => {
                const key = (0, dto_1.flatStatusToBreakdownKey)(statusKey);
                salesBreakdown[key] += count;
                salesBreakdown.total += count;
            });
            const plannedUnits = tower.unitsPlanned ?? tower.totalUnits ?? 0;
            const unitsDefined = aggregation.total;
            const missingUnits = Math.max(plannedUnits - unitsDefined, 0);
            switch (tower.dataCompletenessStatus) {
                case data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED:
                    towersCompleteness.notStarted += 1;
                    break;
                case data_completeness_status_enum_1.DataCompletenessStatus.IN_PROGRESS:
                    towersCompleteness.inProgress += 1;
                    break;
                case data_completeness_status_enum_1.DataCompletenessStatus.NEEDS_REVIEW:
                    towersCompleteness.needsReview += 1;
                    break;
                case data_completeness_status_enum_1.DataCompletenessStatus.COMPLETE:
                    towersCompleteness.complete += 1;
                    break;
                default:
                    towersCompleteness.inProgress += 1;
            }
            if ((tower.unitsDefined ?? 0) !== unitsDefined) {
                towersToPatch.push({ id: tower.id, unitsDefined });
            }
            const financial = towerFinancials[tower.id] ?? {
                fundsTarget: 0,
                fundsRealized: 0,
                fundsOutstanding: 0,
            };
            const imageGallery = this.normalizeImageArray(tower.images);
            const heroImage = imageGallery.length > 0 ? imageGallery[0] : null;
            const sampleFlats = await this.flatsRepository.find({
                where: { towerId: tower.id, isActive: true },
                order: { updatedAt: 'DESC' },
                take: 4,
            });
            const flatFinancialMap = await this.getFlatFinancialMap(sampleFlats.map((flat) => flat.id));
            const unitStagePreviews = sampleFlats.map((flat) => {
                const finances = flatFinancialMap.get(flat.id);
                return {
                    id: flat.id,
                    flatNumber: flat.flatNumber,
                    status: flat.status,
                    floor: flat.floor ?? null,
                    type: flat.type ? String(flat.type) : null,
                    facing: flat.facing ?? null,
                    images: this.normalizeImageArray(flat.images),
                    fundsTarget: finances?.fundsTarget,
                    fundsRealized: finances?.fundsRealized,
                    fundsOutstanding: finances?.fundsOutstanding,
                };
            });
            const paymentStages = this.buildTowerPaymentStages(tower, financial, constructionMap.get(tower.id));
            return {
                id: tower.id,
                name: tower.name,
                towerNumber: tower.towerNumber,
                towerCode: tower.towerCode,
                totalFloors: tower.totalFloors,
                totalUnits: tower.totalUnits,
                unitsPlanned: plannedUnits,
                unitsDefined,
                missingUnits,
                dataCompletionPct: Number(tower.dataCompletionPct ?? 0),
                dataCompletenessStatus: tower.dataCompletenessStatus ?? data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED,
                issuesCount: tower.issuesCount ?? 0,
                salesBreakdown,
                constructionStatus: tower.constructionStatus ?? null,
                heroImage,
                imageGallery,
                unitStagePreviews,
                fundsTarget: financial.fundsTarget,
                fundsRealized: financial.fundsRealized,
                fundsOutstanding: financial.fundsOutstanding,
                paymentStages,
            };
        }));
        const towersPlanned = property.totalTowersPlanned ?? property.numberOfTowers ?? towerSummaries.length;
        const towersDefined = towerSummaries.length;
        const missingTowers = Math.max(towersPlanned - towersDefined, 0);
        const unitsPlanned = property.totalUnitsPlanned ?? property.numberOfUnits ?? towerSummaries.reduce((sum, tower) => sum + (tower.unitsPlanned ?? 0), 0);
        const unitsDefined = towerSummaries.reduce((sum, tower) => sum + (tower.unitsDefined ?? 0), 0);
        const missingUnits = Math.max(unitsPlanned - unitsDefined, 0);
        if (propertySalesBreakdown.total === 0) {
            propertySalesBreakdown.total = unitsDefined;
        }
        const averagedCompletion = towerSummaries.length
            ? towerSummaries.reduce((sum, tower) => sum + (tower.dataCompletionPct ?? 0), 0) / towerSummaries.length
            : 0;
        if (towersToPatch.length > 0) {
            await Promise.all(towersToPatch.map(({ id: towerId, unitsDefined: defined }) => this.towersRepository.update(towerId, { unitsDefined: defined })));
        }
        const financials = await this.calculatePropertyFinancials(property.id);
        const summary = {
            propertyId: property.id,
            propertyName: property.name,
            propertyCode: property.propertyCode,
            dataCompletionPct: Number(property.dataCompletionPct ?? averagedCompletion ?? 0),
            dataCompletenessStatus: property.dataCompletenessStatus ?? data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED,
            towersPlanned,
            towersDefined,
            missingTowers,
            unitsPlanned,
            unitsDefined,
            missingUnits,
            towersCompleteness,
            salesBreakdown: propertySalesBreakdown,
            towers: towerSummaries,
            fundsTarget: financials.fundsTarget,
            fundsRealized: financials.fundsRealized,
            fundsOutstanding: financials.fundsOutstanding,
            generatedAt: new Date().toISOString(),
        };
        return summary;
    }
    async findOne(id, userId) {
        const property = await this.propertiesRepository.findOne({
            where: { id, isActive: true },
            relations: ['towers'],
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return this.mapToResponseDto(property);
    }
    async findByCode(code, userId) {
        const property = await this.propertiesRepository.findOne({
            where: { propertyCode: code, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with code ${code} not found`);
        }
        return this.mapToResponseDto(property);
    }
    async getHierarchy(id, userId) {
        const property = await this.propertiesRepository.findOne({
            where: { id, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        const towers = await this.towersRepository.find({
            where: { propertyId: id },
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
        const towerIds = towers.map((tower) => tower.id);
        const flats = towerIds.length
            ? await this.flatsRepository.find({
                where: { towerId: (0, typeorm_2.In)(towerIds) },
                order: { displayOrder: 'ASC', flatNumber: 'ASC' },
            })
            : [];
        const customerIds = Array.from(new Set(flats
            .map((flat) => flat.customerId)
            .filter((customerId) => Boolean(customerId))));
        const customers = customerIds.length
            ? await this.customersRepository.find({
                where: { id: (0, typeorm_2.In)(customerIds) },
            })
            : [];
        const customerMap = new Map();
        customers.forEach((customer) => {
            customerMap.set(customer.id, customer);
        });
        const towerHierarchies = towers.map((tower) => {
            const towerFlats = flats.filter((flat) => flat.towerId === tower.id);
            const flatDtos = towerFlats.map((flat) => this.mapFlatToHierarchyDto(flat, customerMap.get(flat.customerId ?? '')));
            return {
                id: tower.id,
                name: tower.name ?? 'Unnamed Tower',
                towerNumber: tower.towerNumber ?? '',
                description: tower.description ?? null,
                totalFloors: tower.totalFloors ?? 0,
                totalUnits: tower.totalUnits ?? 0,
                constructionStatus: tower.constructionStatus ?? 'PLANNED',
                vastuCompliant: tower.vastuCompliant ?? true,
                facing: tower.facing ?? null,
                specialFeatures: tower.specialFeatures ?? null,
                stats: this.calculateTowerStats(flatDtos),
                flats: flatDtos,
            };
        });
        const propertyStats = this.calculatePropertyStats(towerHierarchies);
        const financials = await this.calculatePropertyFinancials(property.id);
        return {
            id: property.id,
            propertyCode: property.propertyCode,
            name: property.name,
            description: property.description ?? undefined,
            status: property.status,
            address: property.address,
            city: property.city,
            state: property.state,
            pincode: property.pincode,
            totalArea: property.totalArea ?? undefined,
            builtUpArea: property.builtUpArea ?? undefined,
            expectedRevenue: property.expectedRevenue ?? undefined,
            bhkTypes: property.bhkTypes ?? null,
            amenities: property.amenities ?? null,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
            towers: towerHierarchies,
            stats: propertyStats,
        };
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
        const normalizedUpdate = this.normalizePropertyPayload(updatePropertyDto);
        Object.assign(property, normalizedUpdate);
        if (userId) {
            property.updatedBy = userId;
        }
        const updatedProperty = await this.propertiesRepository.save(property);
        return this.mapToResponseDto(updatedProperty);
    }
    async remove(id, userId) {
        if (userId) {
            await this.checkPropertyAccess(id, userId);
        }
        const property = await this.propertiesRepository.findOne({
            where: { id, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        property.isActive = false;
        property.updatedBy = userId;
        await this.propertiesRepository.save(property);
        await this.towersRepository.update({ propertyId: id }, { isActive: false });
        await this.flatsRepository.update({ propertyId: id }, { isActive: false });
    }
    async toggleActive(id, userId) {
        if (userId) {
            await this.checkPropertyAccess(id, userId);
        }
        const property = await this.propertiesRepository.findOne({
            where: { id },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        property.isActive = !property.isActive;
        property.updatedBy = userId;
        const updatedProperty = await this.propertiesRepository.save(property);
        await this.towersRepository.update({ propertyId: id }, { isActive: updatedProperty.isActive });
        await this.flatsRepository.update({ propertyId: id }, { isActive: updatedProperty.isActive });
        return this.mapToResponseDto(updatedProperty);
    }
    async getStats(userId) {
        let propertyIds = [];
        if (userId) {
            const isAdmin = await this.propertyAccessService.isGlobalAdmin(userId);
            if (!isAdmin) {
                propertyIds = await this.propertyAccessService.getUserPropertyIds(userId);
                if (propertyIds.length === 0) {
                    return {
                        totalProperties: 0,
                        activeProperties: 0,
                        underConstruction: 0,
                        completed: 0,
                    };
                }
            }
        }
        const whereClause = propertyIds.length > 0
            ? { isActive: true, id: (0, typeorm_2.In)(propertyIds) }
            : { isActive: true };
        const totalProperties = await this.propertiesRepository.count({
            where: whereClause,
        });
        const activeProperties = await this.propertiesRepository.count({
            where: { ...whereClause, status: 'Active' },
        });
        const underConstruction = await this.propertiesRepository.count({
            where: { ...whereClause, status: 'Under Construction' },
        });
        const completed = await this.propertiesRepository.count({
            where: { ...whereClause, status: 'Completed' },
        });
        return {
            totalProperties,
            activeProperties,
            underConstruction,
            completed,
        };
    }
    async mapToResponseDto(property) {
        const towersCountResult = await this.propertiesRepository.query('SELECT COUNT(*) as count FROM towers WHERE property_id = $1', [property.id]);
        const towersCount = parseInt(towersCountResult[0]?.count || '0', 10);
        const flatsCountResult = await this.propertiesRepository.query(`SELECT
         COUNT(*)::int AS total,
         COALESCE(SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END), 0)::int AS sold,
         COALESCE(SUM(CASE WHEN status = 'AVAILABLE' AND is_available = true THEN 1 ELSE 0 END), 0)::int AS available
       FROM flats
       WHERE property_id = $1`, [property.id]);
        const flatStats = flatsCountResult[0] ?? { total: 0, sold: 0, available: 0 };
        const totalFlats = Number(flatStats.total ?? 0);
        const soldFlats = Number(flatStats.sold ?? 0);
        const availableFlats = Number(flatStats.available ?? 0);
        const financials = await this.calculatePropertyFinancials(property.id);
        return {
            id: property.id,
            propertyCode: property.propertyCode,
            name: property.name,
            description: property.description,
            country: property.country,
            address: property.address,
            location: property.location,
            city: property.city,
            state: property.state,
            pincode: property.pincode,
            latitude: property.latitude,
            longitude: property.longitude,
            totalArea: property.totalArea,
            builtUpArea: property.builtUpArea,
            areaUnit: property.areaUnit,
            numberOfTowers: property.numberOfTowers ?? towersCount,
            numberOfUnits: property.numberOfUnits ?? totalFlats,
            floorsPerTower: property.floorsPerTower,
            launchDate: property.launchDate,
            expectedCompletionDate: property.expectedCompletionDate,
            actualCompletionDate: property.actualCompletionDate,
            reraNumber: property.reraNumber,
            reraStatus: property.reraStatus,
            projectType: property.projectType,
            propertyType: property.propertyType,
            status: property.status,
            images: property.images,
            documents: property.documents,
            amenities: property.amenities,
            bhkTypes: property.bhkTypes,
            priceMin: property.priceMin,
            priceMax: property.priceMax,
            expectedRevenue: property.expectedRevenue,
            nearbyLandmarks: property.nearbyLandmarks,
            isActive: property.isActive,
            isFeatured: property.isFeatured,
            createdBy: property.createdBy,
            updatedBy: property.updatedBy,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
            towers: towersCount,
            totalFlats,
            soldFlats,
            availableFlats,
            fundsTarget: financials.fundsTarget,
            fundsRealized: financials.fundsRealized,
            fundsOutstanding: financials.fundsOutstanding,
        };
    }
    mapFlatToHierarchyDto(flat, customer) {
        let customerSummary = null;
        if (customer) {
            customerSummary = {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phoneNumber || customer.legacyPhone || '',
                kycStatus: customer.kycStatus,
            };
        }
        return {
            id: flat.id,
            flatNumber: flat.flatNumber,
            name: flat.name,
            type: String(flat.type),
            floor: flat.floor,
            status: String(flat.status),
            isActive: flat.isActive,
            isAvailable: flat.isAvailable,
            bedrooms: flat.bedrooms,
            bathrooms: flat.bathrooms,
            superBuiltUpArea: this.toNullableNumber(flat.superBuiltUpArea),
            builtUpArea: this.toNullableNumber(flat.builtUpArea),
            carpetArea: this.toNullableNumber(flat.carpetArea),
            facing: flat.facing ?? null,
            basePrice: this.toNullableNumber(flat.basePrice),
            totalPrice: this.toNullableNumber(flat.totalPrice),
            finalPrice: this.toNullableNumber(flat.finalPrice),
            bookingDate: flat.bookingDate ?? null,
            soldDate: flat.soldDate ?? null,
            tokenAmount: this.toNullableNumber(flat.tokenAmount),
            remarks: flat.remarks ?? null,
            customer: customerSummary,
        };
    }
    calculateTowerStats(flats) {
        const stats = {
            totalFlats: flats.length,
            availableFlats: 0,
            bookedFlats: 0,
            blockedFlats: 0,
            soldFlats: 0,
            underConstructionFlats: 0,
        };
        flats.forEach((flat) => {
            const status = String(flat.status ?? '').toUpperCase();
            switch (status) {
                case flat_entity_1.FlatStatus.AVAILABLE:
                    stats.availableFlats += 1;
                    break;
                case flat_entity_1.FlatStatus.BOOKED:
                    stats.bookedFlats += 1;
                    break;
                case flat_entity_1.FlatStatus.BLOCKED:
                    stats.blockedFlats += 1;
                    break;
                case flat_entity_1.FlatStatus.SOLD:
                    stats.soldFlats += 1;
                    break;
                case flat_entity_1.FlatStatus.UNDER_CONSTRUCTION:
                    stats.underConstructionFlats += 1;
                    break;
                default:
                    break;
            }
        });
        return stats;
    }
    async getTowerFinancials(towerIds) {
        const map = {};
        if (!towerIds.length) {
            return map;
        }
        const rows = await this.bookingsRepository
            .createQueryBuilder('booking')
            .select('flat.towerId', 'towerId')
            .addSelect('COALESCE(SUM(booking.totalAmount), 0)', 'totalAmount')
            .addSelect('COALESCE(SUM(booking.paidAmount), 0)', 'paidAmount')
            .addSelect('COALESCE(SUM(booking.balanceAmount), 0)', 'balanceAmount')
            .innerJoin(flat_entity_1.Flat, 'flat', 'flat.id = booking.flatId')
            .where('flat.towerId IN (:...towerIds)', { towerIds })
            .groupBy('flat.towerId')
            .getRawMany();
        rows.forEach((row) => {
            const towerId = row.towerId;
            const fundsTarget = Number(row.totalAmount ?? 0);
            const fundsRealized = Number(row.paidAmount ?? 0);
            const balance = Number(row.balanceAmount ?? Math.max(fundsTarget - fundsRealized, 0));
            const fundsOutstanding = Number.isFinite(balance) ? balance : Math.max(fundsTarget - fundsRealized, 0);
            map[towerId] = { fundsTarget, fundsRealized, fundsOutstanding };
        });
        return map;
    }
    async getFlatFinancialMap(flatIds) {
        const map = new Map();
        if (!flatIds.length) {
            return map;
        }
        const rows = await this.bookingsRepository
            .createQueryBuilder('booking')
            .select('booking.flatId', 'flatId')
            .addSelect('COALESCE(SUM(booking.totalAmount), 0)', 'totalAmount')
            .addSelect('COALESCE(SUM(booking.paidAmount), 0)', 'paidAmount')
            .addSelect('COALESCE(SUM(booking.balanceAmount), 0)', 'balanceAmount')
            .where('booking.flatId IN (:...flatIds)', { flatIds })
            .groupBy('booking.flatId')
            .getRawMany();
        rows.forEach((row) => {
            const fundsTarget = Number(row.totalAmount ?? 0);
            const fundsRealized = Number(row.paidAmount ?? 0);
            const balance = Number(row.balanceAmount ?? Math.max(fundsTarget - fundsRealized, 0));
            const fundsOutstanding = Number.isFinite(balance) ? balance : Math.max(fundsTarget - fundsRealized, 0);
            map.set(row.flatId, { fundsTarget, fundsRealized, fundsOutstanding });
        });
        return map;
    }
    buildTowerPaymentStages(tower, financials, construction) {
        const totalFloors = Math.max(Number(tower.totalFloors ?? 0), 0);
        if (totalFloors === 0) {
            return [];
        }
        const fundsTarget = Number(financials.fundsTarget ?? 0);
        const fundsRealized = Number(financials.fundsRealized ?? 0);
        const perFloorDue = totalFloors > 0 ? fundsTarget / totalFloors : 0;
        const structureProgress = Math.max(Math.min(Number(construction?.structureProgress ?? 0), 100), 0);
        const floorsCompleted = Math.floor((structureProgress / 100) * totalFloors);
        let remainingRealized = fundsRealized;
        const stages = [];
        for (let floorNumber = 1; floorNumber <= totalFloors; floorNumber += 1) {
            const paymentCollected = Math.min(Math.max(remainingRealized, 0), perFloorDue);
            remainingRealized -= paymentCollected;
            const paymentBalance = Math.max(perFloorDue - paymentCollected, 0);
            let constructionStatus = 'UPCOMING';
            if (floorNumber <= floorsCompleted) {
                constructionStatus = 'COMPLETED';
            }
            else if (floorNumber === floorsCompleted + 1 && structureProgress < 100) {
                constructionStatus = 'IN_PROGRESS';
            }
            stages.push({
                floorNumber,
                stageLabel: `Floor ${floorNumber}`,
                constructionStatus,
                paymentDue: perFloorDue,
                paymentCollected,
                paymentBalance,
                isPaymentComplete: paymentBalance === 0,
                completedAt: constructionStatus === 'COMPLETED'
                    ? construction?.updatedAt?.toISOString?.() ?? null
                    : null,
            });
        }
        return stages;
    }
    async calculatePropertyFinancials(propertyId) {
        const finance = await this.bookingsRepository
            .createQueryBuilder('booking')
            .select('COALESCE(SUM(booking.totalAmount), 0)', 'totalAmount')
            .addSelect('COALESCE(SUM(booking.paidAmount), 0)', 'paidAmount')
            .addSelect('COALESCE(SUM(booking.balanceAmount), 0)', 'balanceAmount')
            .where('booking.propertyId = :propertyId', { propertyId })
            .getRawOne();
        const fundsTarget = Number(finance?.totalAmount ?? 0);
        const fundsRealized = Number(finance?.paidAmount ?? 0);
        const inferredOutstanding = Math.max(fundsTarget - fundsRealized, 0);
        const rawOutstanding = Number(finance?.balanceAmount ?? inferredOutstanding);
        const fundsOutstanding = Number.isFinite(rawOutstanding) ? rawOutstanding : inferredOutstanding;
        return {
            fundsTarget,
            fundsRealized,
            fundsOutstanding,
        };
    }
    normalizeImageArray(value) {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value
                .map((item) => (item !== null && item !== undefined ? String(item).trim() : ''))
                .filter(Boolean);
        }
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [];
    }
    calculatePropertyStats(towers) {
        const aggregated = {
            totalTowers: towers.length,
            totalFlats: 0,
            availableFlats: 0,
            bookedFlats: 0,
            blockedFlats: 0,
            soldFlats: 0,
            underConstructionFlats: 0,
        };
        towers.forEach((tower) => {
            aggregated.totalFlats += tower.stats.totalFlats;
            aggregated.availableFlats += tower.stats.availableFlats;
            aggregated.bookedFlats += tower.stats.bookedFlats;
            aggregated.blockedFlats += tower.stats.blockedFlats;
            aggregated.soldFlats += tower.stats.soldFlats;
            aggregated.underConstructionFlats += tower.stats.underConstructionFlats;
        });
        return aggregated;
    }
    toNullableNumber(value) {
        if (value === null || value === undefined) {
            return null;
        }
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
    }
    normalizePropertyPayload(payload) {
        const normalized = { ...payload };
        if (payload.projectId) {
            normalized.projectId = payload.projectId;
        }
        const numericKeys = [
            'totalArea',
            'builtUpArea',
            'numberOfTowers',
            'numberOfUnits',
            'priceMin',
            'priceMax',
            'expectedRevenue',
            'latitude',
            'longitude',
        ];
        numericKeys.forEach((key) => {
            if (normalized[key] !== undefined && normalized[key] !== null && normalized[key] !== '') {
                const numericValue = Number(normalized[key]);
                normalized[key] = Number.isFinite(numericValue) ? numericValue : null;
            }
        });
        const dateKeys = [
            'launchDate',
            'expectedCompletionDate',
            'actualCompletionDate',
        ];
        dateKeys.forEach((key) => {
            if (normalized[key]) {
                normalized[key] = this.toDate(normalized[key]);
            }
        });
        const amenities = this.normalizeStringArray(normalized.amenities);
        if (amenities !== undefined) {
            normalized.amenities = amenities;
        }
        const bhkTypes = this.normalizeStringArray(normalized.bhkTypes);
        if (bhkTypes !== undefined) {
            normalized.bhkTypes = bhkTypes ?? null;
        }
        const images = this.normalizeJsonArray(normalized.images);
        if (images !== undefined) {
            normalized.images = images;
        }
        const documents = this.normalizeJsonArray(normalized.documents);
        if (documents !== undefined) {
            normalized.documents = documents;
        }
        if (normalized.isActive !== undefined) {
            normalized.isActive = Boolean(normalized.isActive);
        }
        if (normalized.isFeatured !== undefined) {
            normalized.isFeatured = Boolean(normalized.isFeatured);
        }
        const derivedPropertyType = (typeof normalized.propertyType === 'string' && normalized.propertyType.trim()) ||
            (typeof normalized.projectType === 'string' && normalized.projectType.trim()) ||
            'General';
        normalized.propertyType = derivedPropertyType;
        return normalized;
    }
    normalizeStringArray(value) {
        if (value === undefined) {
            return undefined;
        }
        const sourceArray = Array.isArray(value)
            ? value
            : typeof value === 'string'
                ? value.split(',')
                : [];
        const normalized = sourceArray
            .map((item) => (typeof item === 'string' ? item.trim() : item))
            .filter((item) => item !== undefined && item !== null && item !== '');
        if (normalized.length === 0) {
            return null;
        }
        return normalized;
    }
    normalizeJsonArray(value) {
        if (value === undefined) {
            return undefined;
        }
        if (!Array.isArray(value)) {
            return null;
        }
        return value.length > 0 ? value : null;
    }
    async createDefaultTowersAndFlats(manager, property, payload) {
        const towersRepository = manager.getRepository(tower_entity_1.Tower);
        const flatsRepository = manager.getRepository(flat_entity_1.Flat);
        const towersCount = Math.max(payload.numberOfTowers ?? 1, 1);
        const totalUnits = Math.max(payload.numberOfUnits ?? towersCount, 1);
        const floorsFromDescriptor = (0, flat_generation_util_1.parseFloorsDescriptor)(payload.floorsPerTower, 1);
        const unitsDistribution = this.distributeUnitsAcrossTowers(totalUnits, towersCount);
        const expectedPossession = this.toDate(payload.expectedCompletionDate ?? property.expectedCompletionDate ?? null);
        const constructionStart = this.toDate(payload.launchDate ?? property.launchDate ?? null);
        for (let index = 0; index < towersCount; index += 1) {
            const unitsForTower = Math.max(unitsDistribution[index], 1);
            const totalFloors = Math.max(floorsFromDescriptor, 1);
            const towerNumber = `T${index + 1}`;
            const towerEntity = towersRepository.create({
                name: `${property.name} Tower ${index + 1}`,
                towerNumber,
                towerCode: towerNumber,
                description: 'Auto-generated tower. Please update with accurate specifications.',
                propertyId: property.id,
                totalFloors,
                totalUnits: unitsForTower,
                basementLevels: 0,
                unitsPerFloor: `${Math.ceil(unitsForTower / totalFloors)} units per floor (auto-generated)`,
                amenities: [],
                constructionStatus: 'PLANNED',
                constructionStartDate: constructionStart ?? null,
                completionDate: expectedPossession ?? null,
                numberOfLifts: 1,
                vastuCompliant: true,
                isActive: true,
                displayOrder: index + 1,
                images: [],
                floorPlans: {},
            });
            const savedTower = await towersRepository.save(towerEntity);
            const existingFlats = await flatsRepository.count({
                where: { towerId: savedTower.id },
            });
            if (existingFlats === 0) {
                const flatPayloads = (0, flat_generation_util_1.buildDefaultFlatPayloads)({
                    propertyId: property.id,
                    towerId: savedTower.id,
                    towerNumber,
                    totalUnits: unitsForTower,
                    totalFloors,
                    unitsPerFloorText: savedTower.unitsPerFloor,
                    expectedPossessionDate: expectedPossession ?? null,
                    startDisplayOrder: 1,
                });
                if (flatPayloads.length > 0) {
                    const flatEntities = flatsRepository.create(flatPayloads);
                    await flatsRepository.save(flatEntities);
                }
            }
        }
    }
    distributeUnitsAcrossTowers(totalUnits, towersCount) {
        const baseUnits = Math.floor(totalUnits / towersCount);
        const remainder = totalUnits % towersCount;
        const distribution = [];
        for (let index = 0; index < towersCount; index += 1) {
            distribution.push(baseUnits + (index < remainder ? 1 : 0));
        }
        return distribution.map((value) => (value > 0 ? value : 1));
    }
    toDate(value) {
        if (!value) {
            return null;
        }
        if (value instanceof Date) {
            return value;
        }
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = PropertiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __param(1, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __param(2, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(4, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        property_access_service_1.PropertyAccessService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map