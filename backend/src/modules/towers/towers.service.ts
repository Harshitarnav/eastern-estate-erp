import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Tower } from './entities/tower.entity';
import { Property } from '../properties/entities/property.entity';
import {
  CreateTowerDto,
  UpdateTowerDto,
  QueryTowerDto,
  TowerResponseDto,
  PaginatedTowerResponseDto,
} from './dto';

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
  constructor(
    @InjectRepository(Tower)
    private readonly towerRepository: Repository<Tower>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
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

    // Check for duplicate tower number within the same property
    const existingTower = await this.towerRepository.findOne({
      where: {
        propertyId: createTowerDto.propertyId,
        towerNumber: createTowerDto.towerNumber,
      },
    });

    if (existingTower) {
      throw new ConflictException(
        `Tower number ${createTowerDto.towerNumber} already exists in ${property.name}. Each tower deserves a unique identity.`,
      );
    }

    // Validate business rules
    this.validateTowerData(createTowerDto);

    // Create tower entity
    const tower = this.towerRepository.create({
      ...createTowerDto,
      constructionStartDate: createTowerDto.constructionStartDate
        ? new Date(createTowerDto.constructionStartDate)
        : null,
      completionDate: createTowerDto.completionDate
        ? new Date(createTowerDto.completionDate)
        : null,
    });

    // Save tower
    const savedTower = await this.towerRepository.save(tower);

    // Return with property details
    return this.formatTowerResponse(savedTower, property);
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

    return this.formatTowerResponse(tower, tower.property);
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

    // Check for tower number conflict if being changed
    if (updateTowerDto.towerNumber && updateTowerDto.towerNumber !== tower.towerNumber) {
      const conflictTower = await this.towerRepository.findOne({
        where: {
          propertyId: tower.propertyId,
          towerNumber: updateTowerDto.towerNumber,
        },
      });

      if (conflictTower && conflictTower.id !== id) {
        throw new ConflictException(
          `Tower number ${updateTowerDto.towerNumber} already exists in this property.`,
        );
      }
    }

    // Validate updated data
    if (updateTowerDto.totalFloors !== undefined || updateTowerDto.totalUnits !== undefined) {
      this.validateTowerData({
        ...tower,
        ...updateTowerDto,
      } as any);
    }

    // Handle date conversions
    if (updateTowerDto.constructionStartDate) {
      tower.constructionStartDate = new Date(updateTowerDto.constructionStartDate);
    }

    if (updateTowerDto.completionDate) {
      tower.completionDate = new Date(updateTowerDto.completionDate);
    }

    // Update tower
    Object.assign(tower, updateTowerDto);
    const updatedTower = await this.towerRepository.save(tower);

    return this.formatTowerResponse(updatedTower, tower.property);
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

    return towers.map((tower) => this.formatTowerResponse(tower, tower.property));
  }

  /**
   * Get tower statistics
   * 
   * Provides aggregated statistics for a tower.
   * Useful for dashboards and reporting.
   * 
   * @param id - Tower UUID
   * @returns Tower statistics
   */
  async getStatistics(id: string): Promise<any> {
    const tower = await this.findOne(id);

    // In future, this will include flat statistics
    // For now, return basic tower info
    return {
      towerId: tower.id,
      towerName: tower.name,
      totalFloors: tower.totalFloors,
      totalUnits: tower.totalUnits,
      constructionStatus: tower.constructionStatus,
      // These will be populated when Flats module is implemented
      availableUnits: 0,
      soldUnits: 0,
      bookedUnits: 0,
      occupancyRate: 0,
    };
  }

  /**
   * Validate tower data
   * 
   * Ensures business rules are met.
   * Eastern Estate quality standards.
   * 
   * @param data - Tower data to validate
   * @throws BadRequestException if validation fails
   */
  private validateTowerData(data: Partial<CreateTowerDto | UpdateTowerDto>): void {
    // Validate completion date is after start date
    if (data.constructionStartDate && data.completionDate) {
      const startDate = new Date(data.constructionStartDate);
      const endDate = new Date(data.completionDate);

      if (endDate < startDate) {
        throw new BadRequestException(
          'Completion date cannot be earlier than construction start date. Time flows forward, so do our projects.',
        );
      }
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

  /**
   * Format tower response
   * 
   * Converts entity to response DTO with consistent structure.
   * 
   * @param tower - Tower entity
   * @param property - Property entity (optional)
   * @returns Formatted tower response
   */
  private formatTowerResponse(tower: Tower, property?: Property): TowerResponseDto {
    const response: TowerResponseDto = {
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

    // Include property details if available
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
}
