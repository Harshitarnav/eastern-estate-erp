import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flat, FlatStatus } from './entities/flat.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Booking } from '../bookings/entities/booking.entity';
import {
  CreateFlatDto,
  UpdateFlatDto,
  QueryFlatDto,
  FlatResponseDto,
  PaginatedFlatsResponse,
  FlatInventorySummaryDto,
  FlatInventoryUnitDto,
  emptyFlatCompleteness,
} from './dto';
import {
  emptySalesBreakdown,
  flatStatusToBreakdownKey,
} from '../properties/dto/property-inventory-summary.dto';
import { DataCompletenessStatus } from '../../common/enums/data-completeness-status.enum';

@Injectable()
export class FlatsService {
  constructor(
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
    @InjectRepository(Tower)
    private towersRepository: Repository<Tower>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  private normalizeSimpleArray(values?: string[] | null): string[] | undefined {
    if (!values) {
      return undefined;
    }
    const normalized = values
      .map((value) => (typeof value === 'string' ? value.trim() : value))
      .filter((value): value is string => Boolean(value));
    return normalized.length > 0 ? normalized : undefined;
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private async getFlatFinancialMap(
    flatIds: string[],
  ): Promise<Map<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }>> {
    const map = new Map<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }>();
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
      .getRawMany<{ flatId: string; totalAmount: string; paidAmount: string; balanceAmount: string }>();

    rows.forEach((row) => {
      const fundsTarget = Number(row.totalAmount ?? 0);
      const fundsRealized = Number(row.paidAmount ?? 0);
      const balance = Number(row.balanceAmount ?? Math.max(fundsTarget - fundsRealized, 0));
      const fundsOutstanding = Number.isFinite(balance) ? balance : Math.max(fundsTarget - fundsRealized, 0);
      map.set(row.flatId, { fundsTarget, fundsRealized, fundsOutstanding });
    });

    return map;
  }

  private async getFlatFinancials(flatId: string): Promise<{ fundsTarget: number; fundsRealized: number; fundsOutstanding: number }> {
    const map = await this.getFlatFinancialMap([flatId]);
    return (
      map.get(flatId) ?? {
        fundsTarget: 0,
        fundsRealized: 0,
        fundsOutstanding: 0,
      }
    );
  }

  private buildChecklist(flatLike: Partial<Record<string, any>>): Record<string, boolean> {
    const superBuiltUpArea = this.toNumber(flatLike.superBuiltUpArea);
    const builtUpArea = this.toNumber(flatLike.builtUpArea);
    const carpetArea = this.toNumber(flatLike.carpetArea);

    const hasArea = superBuiltUpArea > 0 && builtUpArea > 0 && carpetArea > 0;
    const hasPricing =
      this.toNumber(flatLike.basePrice) > 0 &&
      this.toNumber(flatLike.totalPrice) > 0 &&
      this.toNumber(flatLike.finalPrice) > 0;
    const hasFacing = Boolean(flatLike.facing);
    const hasAmenities =
      Array.isArray(flatLike.amenities) && flatLike.amenities.length > 0;
    const hasParkingMap =
      this.toNumber(flatLike.parkingSlots) > 0 || Boolean(flatLike.coveredParking);

    return {
      has_area: hasArea,
      has_pricing: hasPricing,
      has_facing: hasFacing,
      has_amenities: hasAmenities,
      has_parking_map: hasParkingMap,
    };
  }

  private evaluateFlatMetadata(flatLike: Partial<Record<string, any>>) {
    const checklist = this.buildChecklist(flatLike);
    const total = Object.keys(checklist).length || 1;
    const completed = Object.values(checklist).filter(Boolean).length;
    const pctRaw = (completed / total) * 100;
    const dataCompletionPct = Math.round(pctRaw * 100) / 100;

    const issues: string[] = [];

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

    let completenessStatus: DataCompletenessStatus;

    if (dataCompletionPct === 0) {
      completenessStatus = DataCompletenessStatus.NOT_STARTED;
    } else if (dataCompletionPct === 100 && issues.length === 0) {
      completenessStatus = DataCompletenessStatus.COMPLETE;
    } else if (issues.length > 0) {
      completenessStatus = DataCompletenessStatus.NEEDS_REVIEW;
    } else {
      completenessStatus = DataCompletenessStatus.IN_PROGRESS;
    }

    return {
      checklist,
      dataCompletionPct,
      completenessStatus,
      issues,
    };
  }

  /**
   * Create a new flat
   */
  async create(createFlatDto: CreateFlatDto): Promise<FlatResponseDto> {
    // Check if flat number already exists for this tower
    const existingFlat = await this.flatsRepository.findOne({
      where: {
        towerId: createFlatDto.towerId,
        flatNumber: createFlatDto.flatNumber,
      },
    });

    if (existingFlat) {
      throw new ConflictException(
        `Flat number ${createFlatDto.flatNumber} already exists in this tower`,
      );
    }

    // Validate pricing
    if (createFlatDto.finalPrice > createFlatDto.totalPrice) {
      throw new BadRequestException(
        'Final price cannot be greater than total price',
      );
    }

    if (createFlatDto.carpetArea > createFlatDto.builtUpArea) {
      throw new BadRequestException(
        'Carpet area cannot be greater than built-up area',
      );
    }

    if (createFlatDto.builtUpArea > createFlatDto.superBuiltUpArea) {
      throw new BadRequestException(
        'Built-up area cannot be greater than super built-up area',
      );
    }

    const normalizedCreateDto: CreateFlatDto = {
      ...createFlatDto,
      amenities: this.normalizeSimpleArray(createFlatDto.amenities),
      images: this.normalizeSimpleArray(createFlatDto.images),
      flatCode: createFlatDto.flatCode?.trim() || createFlatDto.flatNumber?.trim(),
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

    return FlatResponseDto.fromEntity(savedFlat);
  }

  /**
   * Get all flats with filtering and pagination
   */
  async findAll(query: QueryFlatDto): Promise<PaginatedFlatsResponse> {
    const {
      search,
      propertyId,
      towerId,
      type,
      status,
      isAvailable,
      minPrice,
      maxPrice,
      floor,
      bedrooms,
      vastuCompliant,
      cornerUnit,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.flatsRepository
      .createQueryBuilder('flat')
      .leftJoinAndSelect('flat.property', 'property')
      .leftJoinAndSelect('flat.tower', 'tower');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(flat.flatNumber ILIKE :search OR flat.name ILIKE :search OR flat.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filters
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

    // Sorting
    queryBuilder.orderBy(`flat.${sortBy}`, sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const flats = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const financialMap = await this.getFlatFinancialMap(flats.map((flat) => flat.id));
    const extras: Record<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }> = {};
    financialMap.forEach((value, key) => {
      extras[key] = value;
    });

    return {
      data: FlatResponseDto.fromEntities(flats, extras),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get flat by ID
   */
  async findOne(id: string): Promise<FlatResponseDto> {
    const flat = await this.flatsRepository.findOne({
      where: { id },
      relations: ['property', 'tower'],
    });

    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }

    const finances = await this.getFlatFinancials(flat.id);
    return FlatResponseDto.fromEntity(flat, finances);
  }

  /**
   * Get flats by tower ID
   */
  async findByTower(towerId: string): Promise<FlatResponseDto[]> {
    const flats = await this.flatsRepository.find({
      where: { towerId },
      relations: ['property', 'tower'],
      order: { floor: 'ASC', flatNumber: 'ASC' },
    });

    const financialMap = await this.getFlatFinancialMap(flats.map((flat) => flat.id));
    const extras: Record<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }> = {};
    financialMap.forEach((value, key) => {
      extras[key] = value;
    });

    return FlatResponseDto.fromEntities(flats, extras);
  }

  /**
   * Get flats by property ID
   */
  async findByProperty(propertyId: string): Promise<FlatResponseDto[]> {
    const flats = await this.flatsRepository.find({
      where: { propertyId },
      relations: ['property', 'tower'],
      order: { createdAt: 'DESC' },
    });

    const financialMap = await this.getFlatFinancialMap(flats.map((flat) => flat.id));
    const extras: Record<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }> = {};
    financialMap.forEach((value, key) => {
      extras[key] = value;
    });

    return FlatResponseDto.fromEntities(flats, extras);
  }

  async getTowerInventorySummary(towerId: string): Promise<FlatInventorySummaryDto> {
    const tower = await this.towersRepository.findOne({
      where: { id: towerId },
      relations: ['property'],
    });

    if (!tower) {
      throw new NotFoundException(`Tower with ID ${towerId} not found`);
    }

    const flats = await this.flatsRepository.find({
      where: { towerId, isActive: true },
      order: { floor: 'ASC', flatNumber: 'ASC' },
    });

    const financialMap = await this.getFlatFinancialMap(flats.map((flat) => flat.id));
    const salesBreakdown = emptySalesBreakdown();
    const completeness = emptyFlatCompleteness();

    let completionAccumulator = 0;
    let issuesAccumulator = 0;
    let fundsTargetAccumulator = 0;
    let fundsRealizedAccumulator = 0;
    let fundsOutstandingAccumulator = 0;

    const units: FlatInventoryUnitDto[] = flats.map((flat) => {
      const statusKey = flatStatusToBreakdownKey(flat.status);
      salesBreakdown[statusKey] += 1;
      salesBreakdown.total += 1;

      let checklist = flat.flatChecklist ?? null;
      let dataCompletionPct = this.toNumber(flat.dataCompletionPct);
      let completenessStatus = flat.completenessStatus ?? DataCompletenessStatus.NOT_STARTED;
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
        case DataCompletenessStatus.NOT_STARTED:
          completeness.notStarted += 1;
          break;
        case DataCompletenessStatus.NEEDS_REVIEW:
          completeness.needsReview += 1;
          break;
        case DataCompletenessStatus.COMPLETE:
          completeness.complete += 1;
          break;
        case DataCompletenessStatus.IN_PROGRESS:
        default:
          completeness.inProgress += 1;
          break;
      }

      completionAccumulator += dataCompletionPct;
      issuesAccumulator += issuesCount;

      const finances = financialMap.get(flat.id) ?? {
        fundsTarget: this.toNumber(flat.finalPrice ?? flat.totalPrice ?? flat.basePrice ?? 0),
        fundsRealized: this.toNumber(flat.tokenAmount ?? 0),
        fundsOutstanding: 0,
      };
      if (finances.fundsOutstanding === undefined || finances.fundsOutstanding === null) {
        finances.fundsOutstanding = Math.max(finances.fundsTarget - finances.fundsRealized, 0);
      }

      fundsTargetAccumulator += finances.fundsTarget;
      fundsRealizedAccumulator += finances.fundsRealized;
      fundsOutstandingAccumulator += finances.fundsOutstanding;

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
        fundsTarget: finances.fundsTarget,
        fundsRealized: finances.fundsRealized,
        fundsOutstanding: finances.fundsOutstanding,
        // Include construction progress fields
        constructionStage: flat.constructionStage ?? undefined,
        constructionProgress: flat.constructionProgress ? this.toNumber(flat.constructionProgress) : 0,
        lastConstructionUpdate: flat.lastConstructionUpdate ?? undefined,
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
      fundsTarget: fundsTargetAccumulator,
      fundsRealized: fundsRealizedAccumulator,
      fundsOutstanding: fundsOutstandingAccumulator,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update flat
   */
  async update(
    id: string,
    updateFlatDto: UpdateFlatDto,
  ): Promise<FlatResponseDto> {
    const flat = await this.flatsRepository.findOne({ where: { id } });

    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }

    // Check if updating flat number and it conflicts
    if (
      updateFlatDto.flatNumber &&
      updateFlatDto.flatNumber !== flat.flatNumber
    ) {
      const existingFlat = await this.flatsRepository.findOne({
        where: {
          towerId: flat.towerId,
          flatNumber: updateFlatDto.flatNumber,
        },
      });

      if (existingFlat) {
        throw new ConflictException(
          `Flat number ${updateFlatDto.flatNumber} already exists in this tower`,
        );
      }
    }

    // Validate pricing if provided
    const totalPrice = updateFlatDto.totalPrice ?? flat.totalPrice;
    const finalPrice = updateFlatDto.finalPrice ?? flat.finalPrice;

    if (finalPrice > totalPrice) {
      throw new BadRequestException(
        'Final price cannot be greater than total price',
      );
    }

    // Validate areas if provided
    const superBuiltUpArea =
      updateFlatDto.superBuiltUpArea ?? flat.superBuiltUpArea;
    const builtUpArea = updateFlatDto.builtUpArea ?? flat.builtUpArea;
    const carpetArea = updateFlatDto.carpetArea ?? flat.carpetArea;

    if (carpetArea > builtUpArea) {
      throw new BadRequestException(
        'Carpet area cannot be greater than built-up area',
      );
    }

    if (builtUpArea > superBuiltUpArea) {
      throw new BadRequestException(
        'Built-up area cannot be greater than super built-up area',
      );
    }

    const normalizedUpdateDto: UpdateFlatDto = {
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

    return FlatResponseDto.fromEntity(updatedFlat);
  }

  /**
   * Delete flat (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const flat = await this.flatsRepository.findOne({ where: { id } });

    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }

    // Check if flat is booked or sold
    if (flat.status === 'BOOKED' || flat.status === 'SOLD') {
      throw new BadRequestException(
        'Cannot delete a flat that is booked or sold',
      );
    }

    flat.isActive = false;
    await this.flatsRepository.save(flat);
  }

  /**
   * Get flat statistics for a property
   */
  async getPropertyStats(propertyId: string) {
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

  /**
   * Get flat statistics for a tower
   */
  async getTowerStats(towerId: string) {
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
        available: FlatStatus.AVAILABLE,
        sold: FlatStatus.SOLD,
        booked: FlatStatus.BOOKED,
        blocked: FlatStatus.BLOCKED,
        onHold: FlatStatus.ON_HOLD,
        underConstruction: FlatStatus.UNDER_CONSTRUCTION,
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
}
