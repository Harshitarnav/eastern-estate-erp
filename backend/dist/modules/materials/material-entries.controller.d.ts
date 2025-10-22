import { MaterialEntriesService } from './material-entries.service';
import { CreateMaterialEntryDto } from './dto/create-material-entry.dto';
import { UpdateMaterialEntryDto } from './dto/update-material-entry.dto';
export declare class MaterialEntriesController {
    private readonly entriesService;
    constructor(entriesService: MaterialEntriesService);
    create(createDto: CreateMaterialEntryDto): Promise<import("./entities/material-entry.entity").MaterialEntry>;
    findAll(materialId?: string, vendorId?: string): Promise<import("./entities/material-entry.entity").MaterialEntry[]>;
    findOne(id: string): Promise<import("./entities/material-entry.entity").MaterialEntry>;
    update(id: string, updateDto: UpdateMaterialEntryDto): Promise<import("./entities/material-entry.entity").MaterialEntry>;
    remove(id: string): Promise<void>;
}
