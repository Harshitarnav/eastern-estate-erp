import { Repository } from 'typeorm';
import { Flat } from '../entities/flat.entity';
import { CreateFlatDto } from '../dto/create-flat.dto';
import { UpdateFlatDto } from '../dto/update-flat.dto';
export declare class FlatsService {
    private flatsRepository;
    constructor(flatsRepository: Repository<Flat>);
    create(createFlatDto: CreateFlatDto, userId: string): Promise<Flat>;
    createBulk(flats: CreateFlatDto[], userId: string): Promise<Flat[]>;
    findAll(query?: any): Promise<{
        data: Flat[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Flat>;
    update(id: string, updateFlatDto: UpdateFlatDto, userId: string): Promise<Flat>;
    updateStatus(id: string, status: string, userId: string): Promise<Flat>;
    updateBulkStatus(ids: string[], status: string, userId: string): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
