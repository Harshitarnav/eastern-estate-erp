import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto, PaginatedPropertyResponseDto, PropertyResponseDto, PropertyHierarchyDto, PropertyInventorySummaryDto } from './dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto, req: any): Promise<PropertyResponseDto>;
    findAll(queryDto: QueryPropertyDto, req: any): Promise<PaginatedPropertyResponseDto>;
    getStats(req: any): Promise<any>;
    findByCode(code: string, req: any): Promise<PropertyResponseDto>;
    getHierarchy(id: string, req: any): Promise<PropertyHierarchyDto>;
    getInventorySummary(id: string, req: any): Promise<PropertyInventorySummaryDto>;
    findOne(id: string, req: any): Promise<PropertyResponseDto>;
    update(id: string, updatePropertyDto: UpdatePropertyDto, req: any): Promise<PropertyResponseDto>;
    remove(id: string, req: any): Promise<void>;
    toggleActive(id: string, req: any): Promise<PropertyResponseDto>;
}
