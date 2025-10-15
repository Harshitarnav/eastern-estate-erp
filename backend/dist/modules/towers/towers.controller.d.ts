import { TowersService } from './towers.service';
import { CreateTowerDto, UpdateTowerDto, QueryTowerDto, TowerResponseDto, PaginatedTowerResponseDto } from './dto';
export declare class TowersController {
    private readonly towersService;
    constructor(towersService: TowersService);
    create(createTowerDto: CreateTowerDto): Promise<TowerResponseDto>;
    findAll(queryDto: QueryTowerDto): Promise<PaginatedTowerResponseDto>;
    findOne(id: string): Promise<TowerResponseDto>;
    update(id: string, updateTowerDto: UpdateTowerDto): Promise<TowerResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByProperty(propertyId: string): Promise<TowerResponseDto[]>;
    getStatistics(id: string): Promise<any>;
}
