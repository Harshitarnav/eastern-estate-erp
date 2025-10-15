import { PropertiesService } from '../services/properties.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto, req: any): Promise<import("../entities/property.entity").Property>;
    findAll(query: any): Promise<{
        data: import("../entities/property.entity").Property[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("../entities/property.entity").Property>;
    getInventorySummary(id: string): Promise<any>;
    update(id: string, updatePropertyDto: UpdatePropertyDto, req: any): Promise<import("../entities/property.entity").Property>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
