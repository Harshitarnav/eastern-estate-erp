import { FlatsService } from './flats.service';
import { CreateFlatDto, UpdateFlatDto, QueryFlatDto, FlatResponseDto, PaginatedFlatsResponse, FlatInventorySummaryDto } from './dto';
export declare class FlatsController {
    private readonly flatsService;
    constructor(flatsService: FlatsService);
    getGlobalStats(): Promise<{
        total: number;
        available: number;
        sold: number;
        booked: number;
        blocked: number;
        onHold: number;
        underConstruction: number;
    }>;
    create(createFlatDto: CreateFlatDto): Promise<FlatResponseDto>;
    findAll(query: QueryFlatDto): Promise<PaginatedFlatsResponse>;
    findOne(id: string): Promise<FlatResponseDto>;
    findByTower(towerId: string): Promise<FlatResponseDto[]>;
    findByProperty(propertyId: string): Promise<FlatResponseDto[]>;
    getTowerInventorySummary(towerId: string): Promise<FlatInventorySummaryDto>;
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
    update(id: string, updateFlatDto: UpdateFlatDto): Promise<FlatResponseDto>;
    remove(id: string): Promise<void>;
}
