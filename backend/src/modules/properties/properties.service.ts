import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { 
  CreatePropertyDto, 
  UpdatePropertyDto, 
  QueryPropertyDto,
  PaginatedPropertyResponseDto,
  PropertyResponseDto
} from './dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId?: string): Promise<PropertyResponseDto> {
    // Check if property code already exists
    const existingProperty = await this.propertiesRepository.findOne({
      where: { propertyCode: createPropertyDto.propertyCode },
    });

    if (existingProperty) {
      throw new BadRequestException(`Property with code ${createPropertyDto.propertyCode} already exists`);
    }

    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      createdBy: userId,
    });

    const savedProperty = await this.propertiesRepository.save(property);
    return this.mapToResponseDto(savedProperty);
  }

  async findAll(queryDto: QueryPropertyDto): Promise<PaginatedPropertyResponseDto> {
    const { page = 1, limit = 10, search, city, state, status, projectType, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.isActive = :isActive', { isActive: true });

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

  async findOne(id: string): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
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

    Object.assign(property, updatePropertyDto);
    property.updatedBy = userId;

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

    // Soft delete
    property.isActive = false;
    await this.propertiesRepository.save(property);

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
    // TODO: Calculate actual tower and flat counts from related tables
    // For now, returning the property data as is
    return {
      id: property.id,
      propertyCode: property.propertyCode,
      name: property.name,
      description: property.description,
      address: property.address,
      city: property.city,
      state: property.state,
      pincode: property.pincode,
      latitude: property.latitude,
      longitude: property.longitude,
      totalArea: property.totalArea,
      areaUnit: property.areaUnit,
      launchDate: property.launchDate,
      expectedCompletionDate: property.expectedCompletionDate,
      actualCompletionDate: property.actualCompletionDate,
      reraNumber: property.reraNumber,
      projectType: property.projectType,
      status: property.status,
      images: property.images,
      documents: property.documents,
      amenities: property.amenities,
      isActive: property.isActive,
      createdBy: property.createdBy,
      updatedBy: property.updatedBy,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      // These will be calculated from towers/flats tables later
      towers: 0,
      totalFlats: 0,
      soldFlats: 0,
      availableFlats: 0,
    };
  }
}
