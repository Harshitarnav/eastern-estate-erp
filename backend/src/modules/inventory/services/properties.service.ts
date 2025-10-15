import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId: string) {
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      createdBy: userId,
    });
    return await this.propertiesRepository.save(property);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, search, status } = query;

    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.towers', 'towers');

    if (search) {
      queryBuilder.where(
        'property.name ILIKE :search OR property.propertyCode ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('property.createdAt', 'DESC')
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
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['towers', 'towers.flats'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string) {
    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);
    property.updatedBy = userId;
    return await this.propertiesRepository.save(property);
  }

  async remove(id: string) {
    const property = await this.findOne(id);
    await this.propertiesRepository.remove(property);
    return { message: 'Property deleted successfully' };
  }

  async getInventorySummary(propertyId: string) {
    const query = `
      SELECT 
        f.flat_type,
        COUNT(*) as total_flats,
        COUNT(CASE WHEN f.status = 'Available' THEN 1 END) as available,
        COUNT(CASE WHEN f.status = 'Booked' THEN 1 END) as booked,
        COUNT(CASE WHEN f.status = 'Sold' THEN 1 END) as sold,
        SUM(f.total_price) as total_value,
        SUM(CASE WHEN f.status = 'Available' THEN f.total_price ELSE 0 END) as available_value
      FROM flats f
      WHERE f.property_id = $1 AND f.is_active = true
      GROUP BY f.flat_type
    `;

    return await this.propertiesRepository.query(query, [propertyId]);
  }
}