import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, EntityManager } from 'typeorm';
import { Property } from './entities/property.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Flat, FlatStatus } from '../flats/entities/flat.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
// import { ConstructionProject } from '../construction/entities/construction-project.entity'; // Removed
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  QueryPropertyDto,
  PaginatedPropertyResponseDto,
  PropertyResponseDto,
  PropertyHierarchyDto,
  TowerHierarchyDto,
  FlatHierarchyDto,
  TowerHierarchyStatsDto,
  PropertyHierarchyStatsDto,
  CustomerSummaryDto,
  PropertyInventorySummaryDto,
  TowerInventorySummaryDto,
  TowerPaymentStageDto,
  emptySalesBreakdown,
  emptyTowersCompleteness,
  flatStatusToBreakdownKey,
} from './dto';
import { DataCompletenessStatus } from '../../common/enums/data-completeness-status.enum';
import { buildDefaultFlatPayloads, parseFloorsDescriptor } from '../towers/utils/flat-generation.util';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(Tower)
    private towersRepository: Repository<Tower>,
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    // @InjectRepository(ConstructionProject) // Removed
    // private constructionRepository: Repository<ConstructionProject>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId?: string): Promise<PropertyResponseDto> {
    const existingProperty = await this.propertiesRepository.findOne({
      where: { propertyCode: createPropertyDto.propertyCode },
    });

    if (existingProperty) {
      throw new BadRequestException(`Property with code ${createPropertyDto.propertyCode} already exists`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const propertyRepository = queryRunner.manager.getRepository(Property);

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

      await this.createDefaultTowersAndFlats(
        queryRunner.manager,
        savedProperty,
        {
          ...createPropertyDto,
          numberOfTowers: towersCount,
          numberOfUnits: totalUnits,
        },
      );

      await queryRunner.commitTransaction();

      const hydratedProperty = await this.propertiesRepository.findOne({
        where: { id: savedProperty.id },
      });

      return this.mapToResponseDto(hydratedProperty ?? savedProperty);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryDto: QueryPropertyDto): Promise<PaginatedPropertyResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      state,
      status,
      projectType,
      projectId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      isActive,
    } = queryDto;

    const activeFilter = isActive ?? true;

    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.isActive = :isActive', { isActive: activeFilter });

    // Search across multiple fields
    if (search) {
      queryBuilder.andWhere(
        '(property.name ILIKE :search OR property.propertyCode ILIKE :search OR property.address ILIKE :search OR property.reraNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filters
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

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'propertyCode', 'launchDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`property.${sortField}`, sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const properties = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data = await Promise.all(
      properties.map(property => this.mapToResponseDto(property))
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

  async getInventorySummary(propertyId: string): Promise<PropertyInventorySummaryDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const towers = await this.towersRepository.find({
      where: { propertyId, isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    const towerIds = towers.map((tower) => tower.id);
    const towerStatusAggregation: Record<string, { total: number; statuses: Record<string, number> }> = {};
    const propertySalesBreakdown = emptySalesBreakdown();

    const towerFinancials = await this.getTowerFinancials(towerIds);
    // let towerConstructionProjects: ConstructionProject[] = []; // Removed
    // if (towerIds.length) {
    //   try {
    //     towerConstructionProjects = await this.constructionRepository.find({
    //       where: { towerId: In(towerIds), isActive: true },
    //       order: { updatedAt: 'DESC' },
    //       select: ['id', 'towerId', 'structureProgress', 'updatedAt', 'overallProgress', 'projectPhase'],
    //     });
    //   } catch (error) {
    //     this.logger.warn('Construction schema missing tower linkage; skipping tower stage data');
    //     towerConstructionProjects = [];
    //   }
    // }
    const constructionMap = new Map<string, any>(); // Changed from ConstructionProject to any
    // towerConstructionProjects.forEach((project) => {
    //   if (!project.towerId) {
    //     return;
    //   }
    //   const existing = constructionMap.get(project.towerId);
    //   if (!existing || (existing.updatedAt ?? 0) < (project.updatedAt ?? 0)) {
    //     constructionMap.set(project.towerId, project);
    //   }
    // });

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
        const { towerId, status, count } = row as { towerId: string; status: FlatStatus; count: string };
        const numericCount = Number(count) || 0;

        if (!towerStatusAggregation[towerId]) {
          towerStatusAggregation[towerId] = { total: 0, statuses: {} };
        }

        towerStatusAggregation[towerId].total += numericCount;
        towerStatusAggregation[towerId].statuses[status] =
          (towerStatusAggregation[towerId].statuses[status] ?? 0) + numericCount;

        const propertyKey = flatStatusToBreakdownKey(status);
        propertySalesBreakdown[propertyKey] += numericCount;
        propertySalesBreakdown.total += numericCount;
      }
    }

    const towersCompleteness = emptyTowersCompleteness();
    const towersToPatch: { id: string; unitsDefined: number }[] = [];
    const towerSummaries: TowerInventorySummaryDto[] = await Promise.all(
      towers.map(async (tower) => {
        const aggregation = towerStatusAggregation[tower.id] ?? { total: 0, statuses: {} };
        const salesBreakdown = emptySalesBreakdown();

        Object.entries(aggregation.statuses).forEach(([statusKey, count]) => {
          const key = flatStatusToBreakdownKey(statusKey as FlatStatus);
          salesBreakdown[key] += count;
          salesBreakdown.total += count;
        });

        const plannedUnits = tower.unitsPlanned ?? tower.totalUnits ?? 0;
        const unitsDefined = aggregation.total;
        const missingUnits = Math.max(plannedUnits - unitsDefined, 0);

        switch (tower.dataCompletenessStatus) {
          case DataCompletenessStatus.NOT_STARTED:
            towersCompleteness.notStarted += 1;
            break;
          case DataCompletenessStatus.IN_PROGRESS:
            towersCompleteness.inProgress += 1;
            break;
          case DataCompletenessStatus.NEEDS_REVIEW:
            towersCompleteness.needsReview += 1;
            break;
          case DataCompletenessStatus.COMPLETE:
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

        const paymentStages = this.buildTowerPaymentStages(
          tower,
          financial,
          constructionMap.get(tower.id),
        );

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
          dataCompletenessStatus: tower.dataCompletenessStatus ?? DataCompletenessStatus.NOT_STARTED,
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
        } as TowerInventorySummaryDto;
      }),
    );

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
      await Promise.all(
        towersToPatch.map(({ id: towerId, unitsDefined: defined }) =>
          this.towersRepository.update(towerId, { unitsDefined: defined }),
        ),
      );
    }

    const financials = await this.calculatePropertyFinancials(property.id);

    const summary: PropertyInventorySummaryDto = {
      propertyId: property.id,
      propertyName: property.name,
      propertyCode: property.propertyCode,
      dataCompletionPct: Number(property.dataCompletionPct ?? averagedCompletion ?? 0),
      dataCompletenessStatus: property.dataCompletenessStatus ?? DataCompletenessStatus.NOT_STARTED,
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

  async findOne(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
      relations: ['towers'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return this.mapToResponseDto(property);
  }

  async findByCode(code: string): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { propertyCode: code, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with code ${code} not found`);
    }

    return this.mapToResponseDto(property);
  }

  async getHierarchy(id: string): Promise<PropertyHierarchyDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const towers = await this.towersRepository.find({
      where: { propertyId: id },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    const towerIds = towers.map((tower) => tower.id);

    const flats = towerIds.length
      ? await this.flatsRepository.find({
          where: { towerId: In(towerIds) },
          order: { displayOrder: 'ASC', flatNumber: 'ASC' },
        })
      : [];

    const customerIds = Array.from(
      new Set(
        flats
          .map((flat) => flat.customerId)
          .filter((customerId): customerId is string => Boolean(customerId)),
      ),
    );

    const customers = customerIds.length
      ? await this.customersRepository.find({
          where: { id: In(customerIds) },
        })
      : [];

    const customerMap = new Map<string, Customer>();
    customers.forEach((customer) => {
      customerMap.set(customer.id, customer);
    });

    const towerHierarchies: TowerHierarchyDto[] = towers.map((tower) => {
      const towerFlats = flats.filter((flat) => flat.towerId === tower.id);
      const flatDtos = towerFlats.map((flat) =>
        this.mapFlatToHierarchyDto(flat, customerMap.get(flat.customerId ?? '')),
      );

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

  async update(id: string, updatePropertyDto: UpdatePropertyDto, userId?: string): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Check if property code is being changed and if it already exists
    if (updatePropertyDto.propertyCode && updatePropertyDto.propertyCode !== property.propertyCode) {
      const existingProperty = await this.propertiesRepository.findOne({
        where: { propertyCode: updatePropertyDto.propertyCode },
      });

      if (existingProperty) {
        throw new BadRequestException(`Property with code ${updatePropertyDto.propertyCode} already exists`);
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

  async remove(id: string): Promise<{ message: string }> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    property.isActive = false;
    await this.propertiesRepository.save(property);

    await this.towersRepository.update({ propertyId: id }, { isActive: false });
    await this.flatsRepository.update({ propertyId: id }, { isActive: false });

    return { message: 'Property deleted successfully' };
  }

  async toggleActive(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    property.isActive = !property.isActive;
    const updatedProperty = await this.propertiesRepository.save(property);

    await this.towersRepository.update(
      { propertyId: id },
      { isActive: updatedProperty.isActive },
    );

    await this.flatsRepository.update(
      { propertyId: id },
      { isActive: updatedProperty.isActive },
    );

    return this.mapToResponseDto(updatedProperty);
  }

  async getStats(): Promise<any> {
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

  private async mapToResponseDto(property: Property): Promise<PropertyResponseDto> {
    const towersCountResult = await this.propertiesRepository.query(
      'SELECT COUNT(*) as count FROM towers WHERE property_id = $1',
      [property.id]
    );
    const towersCount = parseInt(towersCountResult[0]?.count || '0', 10);

    const flatsCountResult = await this.propertiesRepository.query(
      `SELECT
         COUNT(*)::int AS total,
         COALESCE(SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END), 0)::int AS sold,
         COALESCE(SUM(CASE WHEN status = 'AVAILABLE' AND is_available = true THEN 1 ELSE 0 END), 0)::int AS available
       FROM flats
       WHERE property_id = $1`,
      [property.id],
    );

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
      // Calculated from relationships
      towers: towersCount,
      totalFlats,
      soldFlats,
      availableFlats,
      fundsTarget: financials.fundsTarget,
      fundsRealized: financials.fundsRealized,
      fundsOutstanding: financials.fundsOutstanding,
    };
  }

  private mapFlatToHierarchyDto(flat: Flat, customer?: Customer): FlatHierarchyDto {
    let customerSummary: CustomerSummaryDto | null = null;
    if (customer) {
      customerSummary = {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phoneNumber || (customer as any).legacyPhone || '',
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

  private calculateTowerStats(flats: FlatHierarchyDto[]): TowerHierarchyStatsDto {
    const stats: TowerHierarchyStatsDto = {
      totalFlats: flats.length,
      availableFlats: 0,
      bookedFlats: 0,
      blockedFlats: 0,
      soldFlats: 0,
      underConstructionFlats: 0,
    };

    flats.forEach((flat) => {
      const status = String(flat.status ?? '').toUpperCase() as FlatStatus;
      switch (status) {
        case FlatStatus.AVAILABLE:
          stats.availableFlats += 1;
          break;
        case FlatStatus.BOOKED:
          stats.bookedFlats += 1;
          break;
        case FlatStatus.BLOCKED:
          stats.blockedFlats += 1;
          break;
        case FlatStatus.SOLD:
          stats.soldFlats += 1;
          break;
        case FlatStatus.UNDER_CONSTRUCTION:
          stats.underConstructionFlats += 1;
          break;
        default:
          break;
      }
    });

    return stats;
  }

  private async getTowerFinancials(
    towerIds: string[],
  ): Promise<Record<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }>> {
    const map: Record<string, { fundsTarget: number; fundsRealized: number; fundsOutstanding: number }> = {};
    if (!towerIds.length) {
      return map;
    }

    const rows = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('flat.towerId', 'towerId')
      .addSelect('COALESCE(SUM(booking.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(booking.paidAmount), 0)', 'paidAmount')
      .addSelect('COALESCE(SUM(booking.balanceAmount), 0)', 'balanceAmount')
      .innerJoin(Flat, 'flat', 'flat.id = booking.flatId')
      .where('flat.towerId IN (:...towerIds)', { towerIds })
      .groupBy('flat.towerId')
      .getRawMany<{ towerId: string; totalAmount: string; paidAmount: string; balanceAmount: string }>();

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

  private buildTowerPaymentStages(
    tower: Tower,
    financials: { fundsTarget: number; fundsRealized: number; fundsOutstanding: number },
    construction?: any, // Changed from ConstructionProject
  ): TowerPaymentStageDto[] {
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

    const stages: TowerPaymentStageDto[] = [];

    for (let floorNumber = 1; floorNumber <= totalFloors; floorNumber += 1) {
      const paymentCollected = Math.min(Math.max(remainingRealized, 0), perFloorDue);
      remainingRealized -= paymentCollected;
      const paymentBalance = Math.max(perFloorDue - paymentCollected, 0);

      let constructionStatus: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' = 'UPCOMING';
      if (floorNumber <= floorsCompleted) {
        constructionStatus = 'COMPLETED';
      } else if (floorNumber === floorsCompleted + 1 && structureProgress < 100) {
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
        completedAt:
          constructionStatus === 'COMPLETED'
            ? construction?.updatedAt?.toISOString?.() ?? null
            : null,
      });
    }

    return stages;
  }

  private async calculatePropertyFinancials(
    propertyId: string,
  ): Promise<{ fundsTarget: number; fundsRealized: number; fundsOutstanding: number }> {
    const finance = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('COALESCE(SUM(booking.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(booking.paidAmount), 0)', 'paidAmount')
      .addSelect('COALESCE(SUM(booking.balanceAmount), 0)', 'balanceAmount')
      .where('booking.propertyId = :propertyId', { propertyId })
      .getRawOne<{ totalAmount: string; paidAmount: string; balanceAmount: string }>();

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

  private normalizeImageArray(value: unknown): string[] {
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

  private calculatePropertyStats(towers: TowerHierarchyDto[]): PropertyHierarchyStatsDto {
    const aggregated: PropertyHierarchyStatsDto = {
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

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private normalizePropertyPayload(payload: Partial<CreatePropertyDto>): Record<string, any> {
    const normalized: Record<string, any> = { ...payload };

    if (payload.projectId) {
      normalized.projectId = payload.projectId;
    }

    const numericKeys: (keyof CreatePropertyDto)[] = [
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

    const dateKeys: (keyof CreatePropertyDto)[] = [
      'launchDate',
      'expectedCompletionDate',
      'actualCompletionDate',
    ];

    dateKeys.forEach((key) => {
      if (normalized[key]) {
        normalized[key] = this.toDate(normalized[key] as any);
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

    const derivedPropertyType =
      (typeof normalized.propertyType === 'string' && normalized.propertyType.trim()) ||
      (typeof normalized.projectType === 'string' && normalized.projectType.trim()) ||
      'General';
    normalized.propertyType = derivedPropertyType;

    return normalized;
  }

  private normalizeStringArray(value: unknown): string[] | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    // Accept both string and array inputs; normalize to an array of trimmed strings
    const sourceArray: unknown[] = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',') // allow comma-separated string for single/multiple values
        : [];

    const normalized = sourceArray
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => item !== undefined && item !== null && item !== '') as (string | number)[];

    if (normalized.length === 0) {
      return null;
    }

    return normalized as string[];
  }

  private normalizeJsonArray(value: unknown): unknown[] | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!Array.isArray(value)) {
      return null;
    }

    return value.length > 0 ? value : null;
  }

  private async createDefaultTowersAndFlats(
    manager: EntityManager,
    property: Property,
    payload: Pick<CreatePropertyDto, 'numberOfTowers' | 'numberOfUnits' | 'floorsPerTower' | 'expectedCompletionDate' | 'launchDate'>,
  ): Promise<void> {
    const towersRepository = manager.getRepository(Tower);
    const flatsRepository = manager.getRepository(Flat);

    const towersCount = Math.max(payload.numberOfTowers ?? 1, 1);
    const totalUnits = Math.max(payload.numberOfUnits ?? towersCount, 1);
    const floorsFromDescriptor = parseFloorsDescriptor(payload.floorsPerTower, 1);
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
        const flatPayloads = buildDefaultFlatPayloads({
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

  private distributeUnitsAcrossTowers(totalUnits: number, towersCount: number): number[] {
    const baseUnits = Math.floor(totalUnits / towersCount);
    const remainder = totalUnits % towersCount;
    const distribution: number[] = [];

    for (let index = 0; index < towersCount; index += 1) {
      distribution.push(baseUnits + (index < remainder ? 1 : 0));
    }

    return distribution.map((value) => (value > 0 ? value : 1));
  }

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
