import { Repository } from 'typeorm';
import { Tower } from './entities/tower.entity';
import { Property } from '../properties/entities/property.entity';
import { CreateTowerDto, UpdateTowerDto, QueryTowerDto, TowerResponseDto, PaginatedTowerResponseDto } from './dto';
export declare class TowersService {
    private readonly towerRepository;
    private readonly propertyRepository;
    constructor(towerRepository: Repository<Tower>, propertyRepository: Repository<Property>);
    create(createTowerDto: CreateTowerDto): Promise<TowerResponseDto>;
    findAll(queryDto: QueryTowerDto): Promise<PaginatedTowerResponseDto>;
    findOne(id: string): Promise<TowerResponseDto>;
    update(id: string, updateTowerDto: UpdateTowerDto): Promise<TowerResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByProperty(propertyId: string): Promise<TowerResponseDto[]>;
    getStatistics(id: string): Promise<any>;
    private validateTowerData;
    private formatTowerResponse;
}
