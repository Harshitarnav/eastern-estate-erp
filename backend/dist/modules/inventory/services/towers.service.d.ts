import { Repository } from 'typeorm';
import { Tower } from '../entities/tower.entity';
import { Floor } from '../entities/floor.entity';
import { CreateTowerDto } from '../dto/create-tower.dto';
import { UpdateTowerDto } from '../dto/update-tower.dto';
export declare class TowersService {
    private towersRepository;
    private floorsRepository;
    constructor(towersRepository: Repository<Tower>, floorsRepository: Repository<Floor>);
    create(createTowerDto: CreateTowerDto, userId: string): Promise<Tower>;
    findAll(query?: any): Promise<{
        data: Tower[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Tower>;
    update(id: string, updateTowerDto: UpdateTowerDto, userId: string): Promise<Tower>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
