import { TowersService } from '../services/towers.service';
import { CreateTowerDto } from '../dto/create-tower.dto';
import { UpdateTowerDto } from '../dto/update-tower.dto';
export declare class TowersController {
    private readonly towersService;
    constructor(towersService: TowersService);
    create(createTowerDto: CreateTowerDto, req: any): Promise<import("../entities/tower.entity").Tower>;
    findAll(query: any): Promise<{
        data: import("../entities/tower.entity").Tower[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("../entities/tower.entity").Tower>;
    update(id: string, updateTowerDto: UpdateTowerDto, req: any): Promise<import("../entities/tower.entity").Tower>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
