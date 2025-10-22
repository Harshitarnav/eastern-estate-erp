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
var TowersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TowersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tower_entity_1 = require("./entities/tower.entity");
const property_entity_1 = require("../properties/entities/property.entity");
const flat_entity_1 = require("../flats/entities/flat.entity");
const flat_generation_util_1 = require("./utils/flat-generation.util");
const dto_1 = require("./dto");
const property_inventory_summary_dto_1 = require("../properties/dto/property-inventory-summary.dto");
const data_completeness_status_enum_1 = require("../../common/enums/data-completeness-status.enum");
const XLSX = require("xlsx");
const booking_entity_1 = require("../bookings/entities/booking.entity");
let TowersService = TowersService_1 = class TowersService {
    constructor(towerRepository, propertyRepository, flatRepository, bookingRepository) {
        this.towerRepository = towerRepository;
        this.propertyRepository = propertyRepository;
        this.flatRepository = flatRepository;
        this.bookingRepository = bookingRepository;
        this.logger = new common_1.Logger(TowersService_1.name);
    }
    async create(createTowerDto) {
        const property = await this.propertyRepository.findOne({
            where: { id: createTowerDto.propertyId, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${createTowerDto.propertyId} not found. Every tower needs a home (property) to belong to.`);
        }
        const towerNumber = (createTowerDto.towerNumber ?? '').trim();
        if (!towerNumber) {
            throw new common_1.BadRequestException('towerNumber is required');
        }
        const towerCode = (createTowerDto.towerCode ?? towerNumber).trim();
        const existingTowerNumber = await this.towerRepository.findOne({
            where: {
                propertyId: createTowerDto.propertyId,
                towerNumber,
            },
        });
        if (existingTowerNumber) {
            throw new common_1.ConflictException(`Tower number ${towerNumber} already exists in ${property.name}. Each tower deserves a unique identity.`);
        }
        const existingTowerCode = await this.towerRepository.findOne({
            where: {
                propertyId: createTowerDto.propertyId,
                towerCode,
            },
        });
        if (existingTowerCode) {
            throw new common_1.ConflictException(`Tower code ${towerCode} already exists in ${property.name}.`);
        }
        this.validateTowerData(createTowerDto);
        const tower = this.towerRepository.create({
            ...createTowerDto,
            towerNumber,
            towerCode,
            constructionStartDate: createTowerDto.constructionStartDate
                ? new Date(createTowerDto.constructionStartDate)
                : null,
            completionDate: createTowerDto.completionDate
                ? new Date(createTowerDto.completionDate)
                : null,
        });
        const savedTower = await this.towerRepository.save(tower);
        savedTower.property = property;
        await this.generateDefaultFlatsForTower(savedTower, property);
        return this.formatTowerResponse(savedTower);
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
        const data = await Promise.all(towers.map((tower) => this.formatTowerResponse(tower)));
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
        return this.formatTowerResponse(tower);
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
            const normalizedNumber = updateTowerDto.towerNumber.trim();
            const conflictTower = await this.towerRepository.findOne({
                where: {
                    propertyId: tower.propertyId,
                    towerNumber: normalizedNumber,
                },
            });
            if (conflictTower && conflictTower.id !== id) {
                throw new common_1.ConflictException(`Tower number ${normalizedNumber} already exists in this property.`);
            }
            updateTowerDto.towerNumber = normalizedNumber;
        }
        if (updateTowerDto.towerCode) {
            const normalizedCode = updateTowerDto.towerCode.trim();
            const conflictCode = await this.towerRepository.findOne({
                where: {
                    propertyId: tower.propertyId,
                    towerCode: normalizedCode,
                },
            });
            if (conflictCode && conflictCode.id !== id) {
                throw new common_1.ConflictException(`Tower code ${normalizedCode} already exists in this property.`);
            }
            updateTowerDto.towerCode = normalizedCode;
        }
        if (updateTowerDto.totalFloors !== undefined || updateTowerDto.totalUnits !== undefined) {
            this.validateTowerData({
                ...tower,
                ...updateTowerDto,
            });
        }
        const updatePayload = {};
        Object.assign(updatePayload, updateTowerDto);
        if (updateTowerDto.constructionStartDate !== undefined) {
            const parsedStartDate = this.parseDate(updateTowerDto.constructionStartDate);
            updatePayload.constructionStartDate = parsedStartDate ?? undefined;
        }
        if (updateTowerDto.completionDate !== undefined) {
            const parsedCompletionDate = this.parseDate(updateTowerDto.completionDate);
            updatePayload.completionDate = parsedCompletionDate ?? undefined;
        }
        if (!updatePayload.towerCode && updatePayload.towerNumber) {
            updatePayload.towerCode = updatePayload.towerNumber;
        }
        Object.assign(tower, updatePayload);
        const updatedTower = await this.towerRepository.save(tower);
        updatedTower.property = tower.property;
        await this.syncFlatsForUpdatedTower(updatedTower, tower.property);
        return this.formatTowerResponse(updatedTower);
    }
    async remove(id) {
        const tower = await this.towerRepository.findOne({ where: { id } });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${id} not found.`);
        }
        tower.isActive = false;
        await this.towerRepository.save(tower);
        await this.flatRepository.update({ towerId: id }, { isActive: false });
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
        return Promise.all(towers.map((tower) => this.formatTowerResponse(tower)));
    }
    async bulkImport(propertyId, fileBuffer) {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new common_1.BadRequestException('Uploaded file is empty.');
        }
        const property = await this.propertyRepository.findOne({
            where: { id: propertyId, isActive: true },
        });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${propertyId} not found.`);
        }
        let workbook;
        try {
            workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        }
        catch (error) {
            this.logger.error('Failed to parse bulk tower import file', error);
            throw new common_1.BadRequestException('Unable to read uploaded file. Ensure it is a valid CSV or XLSX document.');
        }
        if (!workbook.SheetNames.length) {
            throw new common_1.BadRequestException('Uploaded file does not contain any worksheet data.');
        }
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: null,
            blankrows: false,
        });
        if (!rows.length) {
            throw new common_1.BadRequestException('Uploaded file contains no data rows.');
        }
        const summary = {
            propertyId,
            totalRows: rows.length,
            created: 0,
            skipped: 0,
            errors: [],
        };
        const allowedStatuses = new Set(['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE']);
        for (let index = 0; index < rows.length; index++) {
            const rawRow = rows[index];
            const rowNumber = index + 2;
            const normalized = this.normalizeRow(rawRow);
            const issues = [];
            const towerNumber = this.sanitizeString(normalized['towernumber'] ?? normalized['tower_number'] ?? normalized['tower no'] ?? normalized['tower no.']);
            const name = this.sanitizeString(normalized['name'] ?? normalized['towername'] ?? normalized['tower_name']);
            const towerCode = this.sanitizeString(normalized['towercode'] ?? normalized['tower_code']) || towerNumber;
            if (!towerNumber) {
                issues.push('towerNumber is required');
            }
            if (!name) {
                issues.push('name is required');
            }
            const totalFloors = this.tryParseNumber(normalized['totalfloors'] ?? normalized['total_floors']);
            const totalUnits = this.tryParseNumber(normalized['totalunits'] ?? normalized['total_units']);
            if (totalFloors === null) {
                issues.push('totalFloors is required and must be a number');
            }
            else if (totalFloors < 1) {
                issues.push('totalFloors must be at least 1');
            }
            if (totalUnits === null) {
                issues.push('totalUnits is required and must be a number');
            }
            else if (totalUnits < 1) {
                issues.push('totalUnits must be at least 1');
            }
            const constructionStatusCandidate = this.sanitizeString(normalized['constructionstatus'] ?? normalized['construction_status'] ?? 'PLANNED').toUpperCase();
            const constructionStatus = allowedStatuses.has(constructionStatusCandidate)
                ? constructionStatusCandidate
                : 'PLANNED';
            const basementLevels = this.tryParseNumber(normalized['basementlevels'] ?? normalized['basement_levels']);
            const numberOfLifts = this.tryParseNumber(normalized['numberoflifts'] ?? normalized['number_of_lifts']);
            const builtUpArea = this.tryParseNumber(normalized['builtuparea'] ?? normalized['built_up_area']);
            const carpetArea = this.tryParseNumber(normalized['carpetarea'] ?? normalized['carpet_area']);
            const ceilingHeight = this.tryParseNumber(normalized['ceilingheight'] ?? normalized['ceiling_height']);
            const displayOrder = this.tryParseNumber(normalized['displayorder'] ?? normalized['display_order']);
            const constructionStartDate = this.parseDateCell(normalized['constructionstartdate'] ?? normalized['construction_start_date']);
            const completionDate = this.parseDateCell(normalized['completiondate'] ?? normalized['completion_date']);
            if (issues.length > 0) {
                summary.skipped += 1;
                summary.errors.push(this.buildRowError(rowNumber, towerNumber, issues));
                continue;
            }
            const createDto = {
                propertyId,
                towerNumber,
                towerCode,
                name,
                description: this.sanitizeNullableString(normalized['description']),
                totalFloors: totalFloors,
                totalUnits: totalUnits,
                basementLevels: basementLevels ?? 0,
                unitsPerFloor: this.sanitizeNullableString(normalized['unitsperfloor'] ?? normalized['units_per_floor']),
                constructionStatus,
                constructionStartDate,
                completionDate,
                reraNumber: this.sanitizeNullableString(normalized['reranumber'] ?? normalized['rera_number']),
                builtUpArea: builtUpArea ?? undefined,
                carpetArea: carpetArea ?? undefined,
                ceilingHeight: ceilingHeight ?? undefined,
                numberOfLifts: numberOfLifts ?? 1,
                vastuCompliant: this.toBoolean(normalized['vastucompliant'] ?? normalized['vastu_compliant'], true),
                facing: this.sanitizeNullableString(normalized['facing']),
                specialFeatures: this.sanitizeNullableString(normalized['specialfeatures'] ?? normalized['special_features']),
                displayOrder: displayOrder ?? 0,
            };
            try {
                await this.create(createDto);
                summary.created += 1;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                summary.skipped += 1;
                summary.errors.push(this.buildRowError(rowNumber, towerNumber, [message]));
            }
        }
        return summary;
    }
    async getInventoryOverview(id) {
        const tower = await this.towerRepository.findOne({
            where: { id },
            relations: ['property'],
        });
        if (!tower) {
            throw new common_1.NotFoundException(`Tower with ID ${id} not found.`);
        }
        const flats = await this.flatRepository.find({
            where: { towerId: id, isActive: true },
            select: ['id', 'flatNumber', 'floor', 'type', 'status', 'completenessStatus'],
            order: { floor: 'ASC', flatNumber: 'ASC' },
        });
        const financials = await this.getTowerFinancialSnapshot(id);
        const construction = null;
        const salesBreakdown = (0, property_inventory_summary_dto_1.emptySalesBreakdown)();
        const floorsSet = new Set();
        const typologySet = new Set();
        const checklistInsights = (0, dto_1.emptyChecklistInsights)();
        const checklistMap = new Map();
        for (const flat of flats) {
            if (flat.floor !== undefined && flat.floor !== null) {
                floorsSet.add(flat.floor);
            }
            if (flat.type) {
                typologySet.add(flat.type);
            }
            const statusKey = (0, property_inventory_summary_dto_1.flatStatusToBreakdownKey)(flat.status ?? flat_entity_1.FlatStatus.UNDER_CONSTRUCTION);
            salesBreakdown[statusKey] += 1;
            salesBreakdown.total += 1;
            const completeness = flat.completenessStatus ?? data_completeness_status_enum_1.DataCompletenessStatus.IN_PROGRESS;
            checklistMap.set(completeness, (checklistMap.get(completeness) ?? 0) + 1);
        }
        for (const insight of checklistInsights) {
            insight.count = checklistMap.get(insight.status) ?? 0;
        }
        const plannedUnits = tower.unitsPlanned ?? tower.totalUnits ?? 0;
        const unitsDefined = salesBreakdown.total;
        const missingUnits = Math.max(plannedUnits - unitsDefined, 0);
        const imageGallery = this.normalizeImageArray(tower.images);
        const heroImage = imageGallery[0] ?? null;
        const paymentStages = this.buildTowerPaymentStages(tower, financials, construction ?? undefined);
        const summary = {
            id: tower.id,
            name: tower.name,
            towerNumber: tower.towerNumber,
            towerCode: tower.towerCode,
            totalFloors: tower.totalFloors ?? 0,
            totalUnits: tower.totalUnits ?? 0,
            unitsPlanned: plannedUnits,
            unitsDefined,
            missingUnits,
            dataCompletionPct: Number(tower.dataCompletionPct ?? 0),
            dataCompletenessStatus: tower.dataCompletenessStatus ?? data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED,
            issuesCount: tower.issuesCount ?? 0,
            salesBreakdown,
            constructionStatus: tower.constructionStatus,
            heroImage,
            imageGallery,
            unitStagePreviews: undefined,
            fundsTarget: financials.fundsTarget,
            fundsRealized: financials.fundsRealized,
            fundsOutstanding: financials.fundsOutstanding,
            paymentStages,
        };
        if ((tower.unitsDefined ?? 0) !== unitsDefined) {
            await this.towerRepository.update(tower.id, { unitsDefined });
        }
        return {
            tower: summary,
            property: tower.property
                ? {
                    id: tower.property.id,
                    name: tower.property.name,
                    code: tower.property.propertyCode,
                }
                : null,
            floorsDefined: floorsSet.size,
            floorsPlanned: tower.totalFloors ?? 0,
            typologies: Array.from(typologySet).sort(),
            checklistInsights,
            salesBreakdown,
            generatedAt: new Date().toISOString(),
        };
    }
    async formatTowerResponse(tower) {
        let flatsCount = 0;
        try {
            const flatsCountResult = await this.towerRepository.query('SELECT COUNT(*) as count FROM flats WHERE tower_id = $1', [tower.id]);
            flatsCount = parseInt(flatsCountResult[0]?.count || '0', 10);
        }
        catch (error) {
            this.logger.warn(`Could not fetch flat count for tower ${tower.id}: ${error.message}`);
        }
        return {
            id: tower.id,
            name: tower.name || 'Unnamed Tower',
            towerNumber: tower.towerNumber || 'N/A',
            towerCode: tower.towerCode || tower.towerNumber || 'N/A',
            description: tower.description || null,
            totalFloors: tower.totalFloors ?? 0,
            totalUnits: tower.totalUnits ?? 0,
            basementLevels: tower.basementLevels ?? 0,
            unitsPerFloor: tower.unitsPerFloor || null,
            amenities: tower.amenities || null,
            constructionStatus: tower.constructionStatus || 'PLANNED',
            constructionStartDate: tower.constructionStartDate || null,
            completionDate: tower.completionDate || null,
            reraNumber: tower.reraNumber || null,
            builtUpArea: tower.builtUpArea || null,
            carpetArea: tower.carpetArea || null,
            ceilingHeight: tower.ceilingHeight || null,
            numberOfLifts: tower.numberOfLifts ?? 1,
            vastuCompliant: tower.vastuCompliant ?? true,
            facing: tower.facing || null,
            specialFeatures: tower.specialFeatures || null,
            isActive: tower.isActive ?? true,
            displayOrder: tower.displayOrder ?? 0,
            images: tower.images || null,
            floorPlans: tower.floorPlans || null,
            propertyId: tower.propertyId,
            property: tower.property ? {
                id: tower.property.id,
                name: tower.property.name,
                propertyCode: tower.property.propertyCode,
                city: tower.property.city || 'Not specified',
                state: tower.property.state || 'Not specified',
            } : undefined,
            flatsCount,
            unitsPlanned: tower.unitsPlanned ?? null,
            unitsDefined: tower.unitsDefined ?? flatsCount,
            dataCompletionPct: tower.dataCompletionPct !== undefined && tower.dataCompletionPct !== null
                ? Number(tower.dataCompletionPct)
                : null,
            dataCompletenessStatus: tower.dataCompletenessStatus ?? data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED,
            issuesCount: tower.issuesCount ?? 0,
            createdAt: tower.createdAt,
            updatedAt: tower.updatedAt,
        };
    }
    async generateDefaultFlatsForTower(tower, property) {
        const existingFlats = await this.flatRepository.count({ where: { towerId: tower.id } });
        if (existingFlats > 0) {
            return;
        }
        const totalUnits = Math.max(tower.totalUnits ?? 1, 1);
        const inferredFloors = (0, flat_generation_util_1.parseFloorsDescriptor)(property.floorsPerTower, 1);
        const totalFloors = Math.max(tower.totalFloors ?? inferredFloors, 1);
        const expectedPossessionDate = this.parseDate(tower.completionDate ?? property.expectedCompletionDate ?? null);
        const payloads = (0, flat_generation_util_1.buildDefaultFlatPayloads)({
            propertyId: tower.propertyId,
            towerId: tower.id,
            towerNumber: tower.towerNumber,
            totalUnits,
            totalFloors,
            unitsPerFloorText: tower.unitsPerFloor,
            expectedPossessionDate,
            startDisplayOrder: 1,
        });
        if (payloads.length === 0) {
            return;
        }
        const flats = this.flatRepository.create(payloads);
        await this.flatRepository.save(flats);
    }
    async syncFlatsForUpdatedTower(tower, property) {
        const existingFlats = await this.flatRepository.count({ where: { towerId: tower.id } });
        if (existingFlats > 0) {
            return;
        }
        const propertyEntity = property ??
            (await this.propertyRepository.findOne({ where: { id: tower.propertyId } }));
        if (propertyEntity) {
            await this.generateDefaultFlatsForTower(tower, propertyEntity);
        }
    }
    normalizeRow(row) {
        const normalized = {};
        Object.entries(row).forEach(([key, value]) => {
            if (!key) {
                return;
            }
            const trimmedKey = key.toString().trim().toLowerCase();
            if (!trimmedKey) {
                return;
            }
            normalized[trimmedKey] = value;
        });
        return normalized;
    }
    sanitizeString(value) {
        if (value === undefined || value === null) {
            return '';
        }
        return String(value).trim();
    }
    sanitizeNullableString(value) {
        const str = this.sanitizeString(value);
        return str ? str : undefined;
    }
    tryParseNumber(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }
        const sanitized = String(value).replace(/,/g, '').trim();
        if (!sanitized) {
            return null;
        }
        const parsed = Number(sanitized);
        return Number.isFinite(parsed) ? parsed : null;
    }
    toBoolean(value, defaultValue) {
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        const normalized = String(value).trim().toLowerCase();
        if (['true', 'yes', 'y', '1'].includes(normalized)) {
            return true;
        }
        if (['false', 'no', 'n', '0'].includes(normalized)) {
            return false;
        }
        return defaultValue;
    }
    parseDateCell(value) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value.toISOString().split('T')[0];
        }
        if (typeof value === 'number') {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (parsed) {
                const date = new Date(parsed.y, parsed.m - 1, parsed.d);
                if (!Number.isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
        }
        const str = this.sanitizeString(value);
        if (!str) {
            return undefined;
        }
        const timestamp = Date.parse(str);
        if (Number.isNaN(timestamp)) {
            return undefined;
        }
        return new Date(timestamp).toISOString().split('T')[0];
    }
    buildRowError(rowNumber, towerNumber, issues) {
        return {
            rowNumber,
            towerNumber: towerNumber || undefined,
            issues,
        };
    }
    parseDate(value) {
        if (!value) {
            return null;
        }
        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
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
    async getTowerFinancialSnapshot(towerId) {
        const finance = await this.bookingRepository
            .createQueryBuilder('booking')
            .select('COALESCE(SUM(booking.totalAmount), 0)', 'totalAmount')
            .addSelect('COALESCE(SUM(booking.paidAmount), 0)', 'paidAmount')
            .addSelect('COALESCE(SUM(booking.balanceAmount), 0)', 'balanceAmount')
            .innerJoin(flat_entity_1.Flat, 'flat', 'flat.id = booking.flatId')
            .where('flat.towerId = :towerId', { towerId })
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
    validateTowerData(data) {
        if (data.totalFloors !== undefined && data.totalFloors < 1) {
            throw new common_1.BadRequestException('Total floors must be at least 1. Every tower needs floors to create homes.');
        }
        if (data.totalFloors !== undefined && data.totalFloors > 100) {
            throw new common_1.BadRequestException('Total floors cannot exceed 100. Lets keep it realistic and safe.');
        }
        if (data.totalUnits !== undefined && data.totalUnits < 1) {
            throw new common_1.BadRequestException('Total units must be at least 1.');
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
};
exports.TowersService = TowersService;
exports.TowersService = TowersService = TowersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __param(2, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(3, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TowersService);
//# sourceMappingURL=towers.service.js.map