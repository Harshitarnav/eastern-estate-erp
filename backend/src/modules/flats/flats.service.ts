import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flat } from './entities/flat.entity';
import {
  CreateFlatDto,
  UpdateFlatDto,
  QueryFlatDto,
  FlatResponseDto,
  PaginatedFlatsResponse,
} from './dto';

@Injectable()
export class FlatsService {
  constructor(
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
  ) {}

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

    const flat = this.flatsRepository.create(createFlatDto);
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

    return {
      data: FlatResponseDto.fromEntities(flats),
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

    return FlatResponseDto.fromEntity(flat);
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

    return FlatResponseDto.fromEntities(flats);
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

    return FlatResponseDto.fromEntities(flats);
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

    Object.assign(flat, updateFlatDto);
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

    const totalRevenue = flats.reduce((sum, f) => sum + Number(f.finalPrice), 0);

    return {
      total,
      available,
      booked,
      sold,
      totalRevenue,
      occupancyRate: total > 0 ? ((booked + sold) / total) * 100 : 0,
    };
  }
}
