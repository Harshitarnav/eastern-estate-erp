import { FlatsService } from './flats.service';
import { CreateFlatDto, UpdateFlatDto, QueryFlatDto, FlatResponseDto, PaginatedFlatsResponse } from './dto';
export declare class FlatsController {
    private readonly flatsService;
    constructor(flatsService: FlatsService);
    create(createFlatDto: CreateFlatDto): Promise<FlatResponseDto>;
    findAll(query: QueryFlatDto): Promise<PaginatedFlatsResponse>;
    findOne(id: string): Promise<FlatResponseDto>;
    findByTower(towerId: string): Promise<FlatResponseDto[]>;
    findByProperty(propertyId: string): Promise<FlatResponseDto[]>;
    getPropertyStats(propertyId: string): Promise<{
        total: number;
        available: number;
        booked: number;
        sold: number;
        blocked: number;
        totalRevenue: number;
        soldRevenue: number;
        averagePrice: number;
    }>;
    getTowerStats(towerId: string): Promise<{
        total: number;
        available: number;
        booked: number;
        sold: number;
        totalRevenue: number;
        occupancyRate: number;
    }>;
    update(id: string, updateFlatDto: UpdateFlatDto): Promise<FlatResponseDto>;
    remove(id: string): Promise<void>;
}
