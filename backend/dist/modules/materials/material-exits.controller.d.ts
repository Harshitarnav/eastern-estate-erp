import { MaterialExitsService } from './material-exits.service';
import { CreateMaterialExitDto } from './dto/create-material-exit.dto';
import { UpdateMaterialExitDto } from './dto/update-material-exit.dto';
export declare class MaterialExitsController {
    private readonly exitsService;
    constructor(exitsService: MaterialExitsService);
    create(createDto: CreateMaterialExitDto): Promise<import("./entities/material-exit.entity").MaterialExit>;
    findAll(materialId?: string, projectId?: string): Promise<import("./entities/material-exit.entity").MaterialExit[]>;
    findOne(id: string): Promise<import("./entities/material-exit.entity").MaterialExit>;
    update(id: string, updateDto: UpdateMaterialExitDto): Promise<import("./entities/material-exit.entity").MaterialExit>;
    remove(id: string): Promise<void>;
}
