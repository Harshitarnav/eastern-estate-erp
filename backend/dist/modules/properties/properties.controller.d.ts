import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto, PaginatedPropertyResponseDto, PropertyResponseDto, PropertyHierarchyDto, PropertyInventorySummaryDto } from './dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto, req: any): Promise<PropertyResponseDto>;
    findAll(queryDto: QueryPropertyDto): Promise<PaginatedPropertyResponseDto>;
    getStats(): Promise<any>;
    findByCode(code: string): Promise<PropertyResponseDto>;
    getHierarchy(id: string): Promise<PropertyHierarchyDto>;
    getInventorySummary(id: string): Promise<PropertyInventorySummaryDto>;
    findOne(id: string): Promise<PropertyResponseDto>;
    update(id: string, updatePropertyDto: UpdatePropertyDto, req: any): Promise<PropertyResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<PropertyResponseDto>;
}
