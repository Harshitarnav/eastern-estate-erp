import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto, PaginatedPropertyResponseDto, PropertyResponseDto } from './dto';
export declare class PropertiesService {
    private propertiesRepository;
    constructor(propertiesRepository: Repository<Property>);
    create(createPropertyDto: CreatePropertyDto, userId?: string): Promise<PropertyResponseDto>;
    findAll(queryDto: QueryPropertyDto): Promise<PaginatedPropertyResponseDto>;
    findOne(id: string): Promise<PropertyResponseDto>;
    findByCode(code: string): Promise<PropertyResponseDto>;
    update(id: string, updatePropertyDto: UpdatePropertyDto, userId?: string): Promise<PropertyResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<PropertyResponseDto>;
    getStats(): Promise<any>;
    private mapToResponseDto;
}
