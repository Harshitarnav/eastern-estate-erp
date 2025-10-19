import { Repository } from 'typeorm';
import { Tower } from './entities/tower.entity';
import { Property } from '../properties/entities/property.entity';
import { Flat } from '../flats/entities/flat.entity';
import { CreateTowerDto, UpdateTowerDto, QueryTowerDto, TowerResponseDto, PaginatedTowerResponseDto, TowerInventoryOverviewDto, BulkImportTowersSummaryDto } from './dto';
export declare class TowersService {
    private readonly towerRepository;
    private readonly propertyRepository;
    private readonly flatRepository;
    private readonly logger;
    constructor(towerRepository: Repository<Tower>, propertyRepository: Repository<Property>, flatRepository: Repository<Flat>);
    create(createTowerDto: CreateTowerDto): Promise<TowerResponseDto>;
    findAll(queryDto: QueryTowerDto): Promise<PaginatedTowerResponseDto>;
    findOne(id: string): Promise<TowerResponseDto>;
    update(id: string, updateTowerDto: UpdateTowerDto): Promise<TowerResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByProperty(propertyId: string): Promise<TowerResponseDto[]>;
    bulkImport(propertyId: string, fileBuffer: Buffer): Promise<BulkImportTowersSummaryDto>;
    getInventoryOverview(id: string): Promise<TowerInventoryOverviewDto>;
    private formatTowerResponse;
    private generateDefaultFlatsForTower;
    private syncFlatsForUpdatedTower;
    private normalizeRow;
    private sanitizeString;
    private sanitizeNullableString;
    private tryParseNumber;
    private toBoolean;
    private parseDateCell;
    private buildRowError;
    private parseDate;
    private validateTowerData;
}
