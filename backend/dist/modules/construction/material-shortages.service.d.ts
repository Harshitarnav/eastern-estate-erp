import { Repository } from 'typeorm';
import { MaterialShortage } from './entities/material-shortage.entity';
import { CreateMaterialShortageDto } from './dto/create-material-shortage.dto';
import { UpdateMaterialShortageDto } from './dto/update-material-shortage.dto';
export declare class MaterialShortagesService {
    private shortagesRepository;
    constructor(shortagesRepository: Repository<MaterialShortage>);
    create(createDto: CreateMaterialShortageDto): Promise<MaterialShortage>;
    findAll(filters?: {
        projectId?: string;
        status?: string;
        priority?: string;
    }): Promise<MaterialShortage[]>;
    findOne(id: string): Promise<MaterialShortage>;
    update(id: string, updateDto: UpdateMaterialShortageDto): Promise<MaterialShortage>;
    remove(id: string): Promise<void>;
    markAsResolved(id: string): Promise<MaterialShortage>;
    getCriticalShortages(projectId: string): Promise<MaterialShortage[]>;
}
