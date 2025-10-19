import { Repository } from 'typeorm';
import { Flat } from './entities/flat.entity';
import { Tower } from '../towers/entities/tower.entity';
import { CreateFlatDto, UpdateFlatDto, QueryFlatDto, FlatResponseDto, PaginatedFlatsResponse, FlatInventorySummaryDto } from './dto';
export declare class FlatsService {
    private flatsRepository;
    private towersRepository;
    constructor(flatsRepository: Repository<Flat>, towersRepository: Repository<Tower>);
    private normalizeSimpleArray;
    private toNumber;
    private buildChecklist;
    private evaluateFlatMetadata;
    create(createFlatDto: CreateFlatDto): Promise<FlatResponseDto>;
    findAll(query: QueryFlatDto): Promise<PaginatedFlatsResponse>;
    findOne(id: string): Promise<FlatResponseDto>;
    findByTower(towerId: string): Promise<FlatResponseDto[]>;
    findByProperty(propertyId: string): Promise<FlatResponseDto[]>;
    getTowerInventorySummary(towerId: string): Promise<FlatInventorySummaryDto>;
    update(id: string, updateFlatDto: UpdateFlatDto): Promise<FlatResponseDto>;
    remove(id: string): Promise<void>;
    getPropertyStats(propertyId: string): Promise<{
        total: number;
        available: number;
        booked: number;
        sold: number;
        blocked: number;
        onHold: number;
        totalRevenue: number;
        soldRevenue: number;
        averagePrice: number;
    }>;
    getTowerStats(towerId: string): Promise<{
        total: number;
        available: number;
        booked: number;
        sold: number;
        onHold: number;
        totalRevenue: number;
        occupancyRate: number;
    }>;
    getGlobalStats(): Promise<{
        total: number;
        available: number;
        sold: number;
        booked: number;
        blocked: number;
        onHold: number;
        underConstruction: number;
    }>;
}
