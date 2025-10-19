import { TowersService } from './towers.service';
import { CreateTowerDto, UpdateTowerDto, QueryTowerDto, TowerResponseDto, PaginatedTowerResponseDto, TowerInventoryOverviewDto, BulkImportTowersSummaryDto } from './dto';
export declare class TowersController {
    private readonly towersService;
    constructor(towersService: TowersService);
    create(createTowerDto: CreateTowerDto): Promise<TowerResponseDto>;
    findAll(queryDto: QueryTowerDto): Promise<PaginatedTowerResponseDto>;
    findOne(id: string): Promise<TowerResponseDto>;
    bulkImport(propertyId: string, file?: Express.Multer.File): Promise<BulkImportTowersSummaryDto>;
    getInventoryOverview(id: string): Promise<TowerInventoryOverviewDto>;
    update(id: string, updateTowerDto: UpdateTowerDto): Promise<TowerResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByProperty(propertyId: string): Promise<TowerResponseDto[]>;
}
