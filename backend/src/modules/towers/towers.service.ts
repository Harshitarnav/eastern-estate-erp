import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, In } from 'typeorm';
import { Tower } from './entities/tower.entity';
import { Property } from '../properties/entities/property.entity';
import { Flat, FlatStatus } from '../flats/entities/flat.entity';
import { buildDefaultFlatPayloads, parseFloorsDescriptor } from './utils/flat-generation.util';
import {
  CreateTowerDto,
  UpdateTowerDto,
  QueryTowerDto,
  TowerResponseDto,
  PaginatedTowerResponseDto,
  TowerInventoryOverviewDto,
  emptyChecklistInsights,
  BulkImportTowersSummaryDto,
  BulkImportTowerErrorDto,
} from './dto';
import {
  TowerInventorySummaryDto,
  emptySalesBreakdown,
  flatStatusToBreakdownKey,
} from '../properties/dto/property-inventory-summary.dto';
import { DataCompletenessStatus } from '../../common/enums/data-completeness-status.enum';
import * as XLSX from 'xlsx';

/**
 * Towers Service
 * 
 * Handles all business logic for tower management.
 * Implements CRUD operations with advanced filtering and pagination.
 * 
 * Eastern Estate Service Philosophy:
 * - Data Integrity: Validate all operations thoroughly
 * - Customer Trust: Ensure accurate, complete information
 * - Performance: Optimize queries for fast response times
 * - Relationships: Maintain proper connections with properties
 * 
 * @service TowersService
 */
@Injectable()
export class TowersService {
  private readonly logger = new Logger(TowersService.name);

  constructor(
    @InjectRepository(Tower)
    private readonly towerRepository: Repository<Tower>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
  ) {}

  /**
   * Create a new tower
   * 
   * Validates property existence and creates tower with all details.
   * Ensures data consistency and business rules compliance.
   * 
   * @param createTowerDto - Tower creation data
   * @returns Created tower with full details
   * @throws NotFoundException if property doesn't exist
   * @throws ConflictException if tower number already exists for property
   */
  async create(createTowerDto: CreateTowerDto): Promise<TowerResponseDto> {
    // Validate property exists
    const property = await this.propertyRepository.findOne({
      where: { id: createTowerDto.propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createTowerDto.propertyId} not found. Every tower needs a home (property) to belong to.`,
      );
    }

    const towerNumber = (createTowerDto.towerNumber ?? '').trim();
    if (!towerNumber) {
      throw new BadRequestException('towerNumber is required');
    }

    const towerCode = (createTowerDto.towerCode ?? towerNumber).trim();

    // Check for duplicate tower number within the same property
    const existingTowerNumber = await this.towerRepository.findOne({
      where: {
        propertyId: createTowerDto.propertyId,
        towerNumber,
      },
    });

    if (existingTowerNumber) {
      throw new ConflictException(
        `Tower number ${towerNumber} already exists in ${property.name}. Each tower deserves a unique identity.`,
      );
    }

    const existingTowerCode = await this.towerRepository.findOne({
      where: {
        propertyId: createTowerDto.propertyId,
        towerCode,
      },
    });

    if (existingTowerCode) {
      throw new ConflictException(
        `Tower code ${towerCode} already exists in ${property.name}.`,
      );
    }

    // Validate business rules
    this.validateTowerData(createTowerDto);

    // Create tower entity
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

    // Save tower
    const savedTower = await this.towerRepository.save(tower);

    // Load property relationship
    savedTower.property = property;

    await this.generateDefaultFlatsForTower(savedTower, property);

    // Return with property details
    return this.formatTowerResponse(savedTower);
  }

  /**
   * Get all towers with filtering and pagination
   * 
   * Supports comprehensive filtering by various criteria.
   * Optimized for performance with indexed queries.
   * 
   * @param queryDto - Query parameters for filtering and pagination
   * @returns Paginated list of towers
   */
  async findAll(queryDto: QueryTowerDto): Promise<PaginatedTowerResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      propertyId,
      constructionStatus,
      vastuCompliant,
      facing,
      minFloors,
      maxFloors,
      isActive = true,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
    } = queryDto;

    // Build where clause
    const where: FindOptionsWhere<Tower> = {};

    // Apply filters
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

    // Build query
    const queryBuilder = this.towerRepository
      .createQueryBuilder('tower')
      .leftJoinAndSelect('tower.property', 'property')
      .where(where);

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(tower.name ILIKE :search OR tower.towerNumber ILIKE :search OR tower.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply floor range filters
    if (minFloors !== undefined) {
      queryBuilder.andWhere('tower.totalFloors >= :minFloors', { minFloors });
    }

    if (maxFloors !== undefined) {
      queryBuilder.andWhere('tower.totalFloors <= :maxFloors', { maxFloors });
    }

    // Apply sorting
    const validSortFields = ['name', 'towerNumber', 'totalFloors', 'totalUnits', 'displayOrder', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'displayOrder';
    queryBuilder.orderBy(`tower.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [towers, total] = await queryBuilder.getManyAndCount();

    // Format response
    const data = await Promise.all(
      towers.map((tower) => this.formatTowerResponse(tower))
    );

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

  /**
   * Get tower by ID
   * 
   * Retrieves complete tower details including property relationship.
   * 
   * @param id - Tower UUID
   * @returns Tower details
   * @throws NotFoundException if tower doesn't exist
   */
  async findOne(id: string): Promise<TowerResponseDto> {
    const tower = await this.towerRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!tower) {
      throw new NotFoundException(
        `Tower with ID ${id} not found. Let's help you find the perfect tower for your needs.`,
      );
    }

    return this.formatTowerResponse(tower);
  }

  /**
   * Update tower
   * 
   * Updates tower with new information while maintaining data integrity.
   * 
   * @param id - Tower UUID
   * @param updateTowerDto - Updated tower data
   * @returns Updated tower details
   * @throws NotFoundException if tower doesn't exist
   * @throws ConflictException if tower number conflicts
   */
  async update(id: string, updateTowerDto: UpdateTowerDto): Promise<TowerResponseDto> {
    // Check if tower exists
    const tower = await this.towerRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!tower) {
      throw new NotFoundException(
        `Tower with ID ${id} not found. We're committed to maintaining accurate records.`,
      );
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
        throw new ConflictException(
          `Tower number ${normalizedNumber} already exists in this property.`,
        );
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
        throw new ConflictException(`Tower code ${normalizedCode} already exists in this property.`);
      }
      updateTowerDto.towerCode = normalizedCode;
    }

    // Validate updated data
    if (updateTowerDto.totalFloors !== undefined || updateTowerDto.totalUnits !== undefined) {
      this.validateTowerData({
        ...tower,
        ...updateTowerDto,
      } as any);
    }

    const updatePayload: Partial<Tower> = {};
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

    // Update tower
    Object.assign(tower, updatePayload);
    const updatedTower = await this.towerRepository.save(tower);
    updatedTower.property = tower.property;

    await this.syncFlatsForUpdatedTower(updatedTower, tower.property);

    return this.formatTowerResponse(updatedTower);
  }

  /**
   * Soft delete tower
   * 
   * Deactivates tower instead of permanently deleting.
   * Preserves historical data and relationships.
   * 
   * @param id - Tower UUID
   * @returns Success message
   * @throws NotFoundException if tower doesn't exist
   */
  async remove(id: string): Promise<{ message: string }> {
    const tower = await this.towerRepository.findOne({ where: { id } });

    if (!tower) {
      throw new NotFoundException(`Tower with ID ${id} not found.`);
    }

    // Soft delete by setting isActive to false
    tower.isActive = false;
    await this.towerRepository.save(tower);
    await this.flatRepository.update({ towerId: id }, { isActive: false });

    return {
      message: `Tower ${tower.name} has been deactivated. Historical data preserved for your records.`,
    };
  }

  /**
   * Get towers by property
   * 
   * Retrieves all towers for a specific property.
   * Useful for property detail pages.
   * 
   * @param propertyId - Property UUID
   * @returns List of towers in the property
   */
  async findByProperty(propertyId: string): Promise<TowerResponseDto[]> {
    const towers = await this.towerRepository.find({
      where: { propertyId, isActive: true },
      relations: ['property'],
      order: { displayOrder: 'ASC' },
    });

    return Promise.all(
      towers.map((tower) => this.formatTowerResponse(tower))
    );
  }

  async bulkImport(propertyId: string, fileBuffer: Buffer): Promise<BulkImportTowersSummaryDto> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found.`);
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (error) {
      this.logger.error('Failed to parse bulk tower import file', error as Error);
      throw new BadRequestException('Unable to read uploaded file. Ensure it is a valid CSV or XLSX document.');
    }

    if (!workbook.SheetNames.length) {
      throw new BadRequestException('Uploaded file does not contain any worksheet data.');
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: null,
      blankrows: false,
    });

    if (!rows.length) {
      throw new BadRequestException('Uploaded file contains no data rows.');
    }

    const summary: BulkImportTowersSummaryDto = {
      propertyId,
      totalRows: rows.length,
      created: 0,
      skipped: 0,
      errors: [],
    };

    const allowedStatuses = new Set(['PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED', 'READY_TO_MOVE']);

    for (let index = 0; index < rows.length; index++) {
      const rawRow = rows[index];
      const rowNumber = index + 2; // account for header row
      const normalized = this.normalizeRow(rawRow);

      const issues: string[] = [];

      const towerNumber = this.sanitizeString(
        normalized['towernumber'] ?? normalized['tower_number'] ?? normalized['tower no'] ?? normalized['tower no.'],
      );
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
      } else if (totalFloors < 1) {
        issues.push('totalFloors must be at least 1');
      }

      if (totalUnits === null) {
        issues.push('totalUnits is required and must be a number');
      } else if (totalUnits < 1) {
        issues.push('totalUnits must be at least 1');
      }

      const constructionStatusCandidate = this.sanitizeString(
        normalized['constructionstatus'] ?? normalized['construction_status'] ?? 'PLANNED',
      ).toUpperCase();
      const constructionStatus = allowedStatuses.has(constructionStatusCandidate)
        ? (constructionStatusCandidate as CreateTowerDto['constructionStatus'])
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

      const createDto: CreateTowerDto = {
        propertyId,
        towerNumber,
        towerCode,
        name,
        description: this.sanitizeNullableString(normalized['description']),
        totalFloors: totalFloors as number,
        totalUnits: totalUnits as number,
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
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        summary.skipped += 1;
        summary.errors.push(this.buildRowError(rowNumber, towerNumber, [message]));
      }
    }

    return summary;
  }

  async getInventoryOverview(id: string): Promise<TowerInventoryOverviewDto> {
    const tower = await this.towerRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!tower) {
      throw new NotFoundException(`Tower with ID ${id} not found.`);
    }

    const flats = await this.flatRepository.find({
      where: { towerId: id, isActive: true },
      select: ['id', 'flatNumber', 'floor', 'type', 'status', 'completenessStatus'],
      order: { floor: 'ASC', flatNumber: 'ASC' },
    });

    const salesBreakdown = emptySalesBreakdown();
    const floorsSet = new Set<number>();
    const typologySet = new Set<string>();
    const checklistInsights = emptyChecklistInsights();

    const checklistMap = new Map<DataCompletenessStatus, number>();

    for (const flat of flats) {
      if (flat.floor !== undefined && flat.floor !== null) {
        floorsSet.add(flat.floor);
      }

      if (flat.type) {
        typologySet.add(flat.type);
      }

      const statusKey = flatStatusToBreakdownKey(flat.status ?? FlatStatus.UNDER_CONSTRUCTION);
      salesBreakdown[statusKey] += 1;
      salesBreakdown.total += 1;

      const completeness = flat.completenessStatus ?? DataCompletenessStatus.IN_PROGRESS;
      checklistMap.set(completeness, (checklistMap.get(completeness) ?? 0) + 1);
    }

    for (const insight of checklistInsights) {
      insight.count = checklistMap.get(insight.status) ?? 0;
    }

    const plannedUnits = tower.unitsPlanned ?? tower.totalUnits ?? 0;
    const unitsDefined = salesBreakdown.total;
    const missingUnits = Math.max(plannedUnits - unitsDefined, 0);

    const summary: TowerInventorySummaryDto = {
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
      dataCompletenessStatus: tower.dataCompletenessStatus ?? DataCompletenessStatus.NOT_STARTED,
      issuesCount: tower.issuesCount ?? 0,
      salesBreakdown,
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

  /**
   * Convert tower entity to response DTO with computed fields
   * Uses defensive programming to handle missing columns gracefully
   */
  private async formatTowerResponse(tower: Tower): Promise<TowerResponseDto> {
    // Calculate flat count using direct SQL query
    let flatsCount = 0;
    try {
      const flatsCountResult = await this.towerRepository.query(
        'SELECT COUNT(*) as count FROM flats WHERE tower_id = $1',
        [tower.id]
      );
      flatsCount = parseInt(flatsCountResult[0]?.count || '0', 10);
    } catch (error) {
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
      dataCompletionPct:
        tower.dataCompletionPct !== undefined && tower.dataCompletionPct !== null
          ? Number(tower.dataCompletionPct)
          : null,
      dataCompletenessStatus: tower.dataCompletenessStatus ?? DataCompletenessStatus.NOT_STARTED,
      issuesCount: tower.issuesCount ?? 0,
      createdAt: tower.createdAt,
      updatedAt: tower.updatedAt,
    };
  }

  private async generateDefaultFlatsForTower(tower: Tower, property: Property): Promise<void> {
    const existingFlats = await this.flatRepository.count({ where: { towerId: tower.id } });
    if (existingFlats > 0) {
      return;
    }

    const totalUnits = Math.max(tower.totalUnits ?? 1, 1);
    const inferredFloors = parseFloorsDescriptor(property.floorsPerTower, 1);
    const totalFloors = Math.max(tower.totalFloors ?? inferredFloors, 1);
    const expectedPossessionDate = this.parseDate(
      tower.completionDate ?? property.expectedCompletionDate ?? null,
    );

    const payloads = buildDefaultFlatPayloads({
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

  private async syncFlatsForUpdatedTower(tower: Tower, property?: Property): Promise<void> {
    const existingFlats = await this.flatRepository.count({ where: { towerId: tower.id } });
    if (existingFlats > 0) {
      return;
    }

    const propertyEntity =
      property ??
      (await this.propertyRepository.findOne({ where: { id: tower.propertyId } }));

    if (propertyEntity) {
      await this.generateDefaultFlatsForTower(tower, propertyEntity);
    }
  }

  private normalizeRow(row: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
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

  private sanitizeString(value: any): string {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value).trim();
  }

  private sanitizeNullableString(value: any): string | undefined {
    const str = this.sanitizeString(value);
    return str ? str : undefined;
  }

  private tryParseNumber(value: any): number | null {
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

  private toBoolean(value: any, defaultValue: boolean): boolean {
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

  private parseDateCell(value: any): string | undefined {
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

  private buildRowError(rowNumber: number, towerNumber: string, issues: string[]): BulkImportTowerErrorDto {
    return {
      rowNumber,
      towerNumber: towerNumber || undefined,
      issues,
    };
  }

  private parseDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Validate tower business rules
   * 
   * Ensures data consistency and realistic values.
   * 
   * @param data - Tower data to validate
   * @throws BadRequestException if validation fails
   */
  private validateTowerData(data: Partial<CreateTowerDto | UpdateTowerDto>): void {
    // Validate floor count
    if (data.totalFloors !== undefined && data.totalFloors < 1) {
      throw new BadRequestException(
        'Total floors must be at least 1. Every tower needs floors to create homes.',
      );
    }

    if (data.totalFloors !== undefined && data.totalFloors > 100) {
      throw new BadRequestException(
        'Total floors cannot exceed 100. Lets keep it realistic and safe.',
      );
    }

    // Validate units
    if (data.totalUnits !== undefined && data.totalUnits < 1) {
      throw new BadRequestException(
        'Total units must be at least 1.',
      );
    }

    // Validate units vs floors ratio
    if (data.totalUnits && data.totalFloors) {
      const unitsPerFloor = data.totalUnits / data.totalFloors;
      if (unitsPerFloor < 1 || unitsPerFloor > 20) {
        throw new BadRequestException(
          'Units per floor ratio seems unusual (should be between 1 and 20). Please verify your numbers.',
        );
      }
    }

    // Validate carpet area vs built-up area
    if (data.carpetArea && data.builtUpArea) {
      if (data.carpetArea > data.builtUpArea) {
        throw new BadRequestException(
          'Carpet area cannot exceed built-up area. Lets ensure accurate measurements.',
        );
      }
    }
  }
}
