import { MaterialShortagesService } from './material-shortages.service';
import { CreateMaterialShortageDto } from './dto/create-material-shortage.dto';
import { UpdateMaterialShortageDto } from './dto/update-material-shortage.dto';
export declare class MaterialShortagesController {
    private readonly shortagesService;
    constructor(shortagesService: MaterialShortagesService);
    create(createDto: CreateMaterialShortageDto): Promise<import("./entities/material-shortage.entity").MaterialShortage>;
    findAll(projectId?: string, status?: string, priority?: string): Promise<import("./entities/material-shortage.entity").MaterialShortage[]>;
    getCriticalShortages(projectId: string): Promise<import("./entities/material-shortage.entity").MaterialShortage[]>;
    findOne(id: string): Promise<import("./entities/material-shortage.entity").MaterialShortage>;
    update(id: string, updateDto: UpdateMaterialShortageDto): Promise<import("./entities/material-shortage.entity").MaterialShortage>;
    markAsResolved(id: string): Promise<import("./entities/material-shortage.entity").MaterialShortage>;
    remove(id: string): Promise<void>;
}
