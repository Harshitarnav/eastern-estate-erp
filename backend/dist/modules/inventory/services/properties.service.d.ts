import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
export declare class PropertiesService {
    private propertiesRepository;
    constructor(propertiesRepository: Repository<Property>);
    create(createPropertyDto: CreatePropertyDto, userId: string): Promise<Property>;
    findAll(query?: any): Promise<{
        data: Property[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Property>;
    update(id: string, updatePropertyDto: UpdatePropertyDto, userId: string): Promise<Property>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getInventorySummary(propertyId: string): Promise<any>;
}
