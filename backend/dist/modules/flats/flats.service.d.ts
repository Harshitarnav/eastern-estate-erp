import { Repository } from 'typeorm';
import { Flat } from './entities/flat.entity';
import { CreateFlatDto, UpdateFlatDto, QueryFlatDto, FlatResponseDto, PaginatedFlatsResponse } from './dto';
export declare class FlatsService {
    private flatsRepository;
    constructor(flatsRepository: Repository<Flat>);
    create(createFlatDto: CreateFlatDto): Promise<FlatResponseDto>;
    findAll(query: QueryFlatDto): Promise<PaginatedFlatsResponse>;
    findOne(id: string): Promise<FlatResponseDto>;
    findByTower(towerId: string): Promise<FlatResponseDto[]>;
    findByProperty(propertyId: string): Promise<FlatResponseDto[]>;
    update(id: string, updateFlatDto: UpdateFlatDto): Promise<FlatResponseDto>;
    remove(id: string): Promise<void>;
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
}
