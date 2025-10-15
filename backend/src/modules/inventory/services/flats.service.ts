import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Flat } from '../entities/flat.entity';
import { CreateFlatDto } from '../dto/create-flat.dto';
import { UpdateFlatDto } from '../dto/update-flat.dto';

@Injectable()
export class FlatsService {
  constructor(
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
  ) {}

  async create(createFlatDto: CreateFlatDto, userId: string) {
    const flat = this.flatsRepository.create({
      ...createFlatDto,
      property: { id: createFlatDto.propertyId } as any,
      tower: { id: createFlatDto.towerId } as any,
      floor: { id: createFlatDto.floorId } as any,
      createdBy: userId, // ✅ FIXED: Just the string, not { id: userId }
    });
    return await this.flatsRepository.save(flat);
  }

  async createBulk(flats: CreateFlatDto[], userId: string) {
    const flatEntities = flats.map(flatDto =>
      this.flatsRepository.create({
        ...flatDto,
        property: { id: flatDto.propertyId } as any,
        tower: { id: flatDto.towerId } as any,
        floor: { id: flatDto.floorId } as any,
        createdBy: userId, // ✅ FIXED: Just the string, not { id: userId }
      }),
    );
    return await this.flatsRepository.save(flatEntities);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, propertyId, towerId, floorId, status, flatType, minPrice, maxPrice } = query;

    const queryBuilder = this.flatsRepository
      .createQueryBuilder('flat')
      .leftJoinAndSelect('flat.property', 'property')
      .leftJoinAndSelect('flat.tower', 'tower')
      .leftJoinAndSelect('flat.floor', 'floor');

    if (propertyId) {
      queryBuilder.andWhere('flat.property.id = :propertyId', { propertyId });
    }

    if (towerId) {
      queryBuilder.andWhere('flat.tower.id = :towerId', { towerId });
    }

    if (floorId) {
      queryBuilder.andWhere('flat.floor.id = :floorId', { floorId });
    }

    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere('flat.status IN (:...status)', { status });
      } else {
        queryBuilder.andWhere('flat.status = :status', { status });
      }
    }

    if (flatType) {
      queryBuilder.andWhere('flat.flatType = :flatType', { flatType });
    }

    if (minPrice) {
      queryBuilder.andWhere('flat.totalPrice >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      queryBuilder.andWhere('flat.totalPrice <= :maxPrice', { maxPrice });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('flat.createdAt', 'DESC')
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

  async findOne(id: string) {
    const flat = await this.flatsRepository.findOne({
      where: { id },
      relations: ['property', 'tower', 'floor'],
    });

    if (!flat) {
      throw new NotFoundException(`Flat with ID ${id} not found`);
    }

    return flat;
  }

  async update(id: string, updateFlatDto: UpdateFlatDto, userId: string) {
    const flat = await this.findOne(id);
    Object.assign(flat, updateFlatDto);
    flat.updatedBy = userId;
    return await this.flatsRepository.save(flat);
  }

  async updateStatus(id: string, status: string, userId: string) {
    const flat = await this.findOne(id);
    flat.status = status;
    flat.updatedBy = userId;
    return await this.flatsRepository.save(flat);
  }

  async updateBulkStatus(ids: string[], status: string, userId: string) {
    await this.flatsRepository.update(
      { id: In(ids) },
      { status, updatedBy: userId },
    );
    return { message: 'Flats updated successfully' };
  }

  async remove(id: string) {
    const flat = await this.findOne(id);
    await this.flatsRepository.remove(flat);
    return { message: 'Flat deleted successfully' };
  }
}