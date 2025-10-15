import { FlatsService } from '../services/flats.service';
import { CreateFlatDto } from '../dto/create-flat.dto';
import { UpdateFlatDto } from '../dto/update-flat.dto';
import { UpdateFlatStatusDto } from '../dto/update-flat-status.dto';
export declare class FlatsController {
    private readonly flatsService;
    constructor(flatsService: FlatsService);
    create(createFlatDto: CreateFlatDto, req: any): Promise<import("../entities/flat.entity").Flat>;
    createBulk(body: {
        flats: CreateFlatDto[];
    }, req: any): Promise<import("../entities/flat.entity").Flat[]>;
    findAll(query: any): Promise<{
        data: import("../entities/flat.entity").Flat[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("../entities/flat.entity").Flat>;
    update(id: string, updateFlatDto: UpdateFlatDto, req: any): Promise<import("../entities/flat.entity").Flat>;
    updateStatus(id: string, updateStatusDto: UpdateFlatStatusDto, req: any): Promise<import("../entities/flat.entity").Flat>;
    updateBulkStatus(body: {
        ids: string[];
        status: string;
    }, req: any): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
