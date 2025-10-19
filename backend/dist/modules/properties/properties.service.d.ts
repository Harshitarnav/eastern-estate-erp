import { Repository, DataSource } from 'typeorm';
import { Property } from './entities/property.entity';
import { Project } from '../projects/entities/project.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Flat } from '../flats/entities/flat.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto, PaginatedPropertyResponseDto, PropertyResponseDto, PropertyHierarchyDto, PropertyInventorySummaryDto } from './dto';
export declare class PropertiesService {
    private propertiesRepository;
    private projectsRepository;
    private towersRepository;
    private flatsRepository;
    private customersRepository;
    private readonly dataSource;
    constructor(propertiesRepository: Repository<Property>, projectsRepository: Repository<Project>, towersRepository: Repository<Tower>, flatsRepository: Repository<Flat>, customersRepository: Repository<Customer>, dataSource: DataSource);
    create(createPropertyDto: CreatePropertyDto, userId?: string): Promise<PropertyResponseDto>;
    findAll(queryDto: QueryPropertyDto): Promise<PaginatedPropertyResponseDto>;
    getInventorySummary(propertyId: string): Promise<PropertyInventorySummaryDto>;
    findOne(id: string): Promise<PropertyResponseDto>;
    findByCode(code: string): Promise<PropertyResponseDto>;
    getHierarchy(id: string): Promise<PropertyHierarchyDto>;
    update(id: string, updatePropertyDto: UpdatePropertyDto, userId?: string): Promise<PropertyResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<PropertyResponseDto>;
    getStats(): Promise<any>;
    private mapToResponseDto;
    private mapFlatToHierarchyDto;
    private calculateTowerStats;
    private calculatePropertyStats;
    private toNullableNumber;
    private normalizePropertyPayload;
    private normalizeStringArray;
    private normalizeJsonArray;
    private createDefaultTowersAndFlats;
    private distributeUnitsAcrossTowers;
    private toDate;
}
