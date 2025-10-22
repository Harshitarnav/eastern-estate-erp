import { Repository, DataSource } from 'typeorm';
import { MaterialEntry } from './entities/material-entry.entity';
import { Material } from './entities/material.entity';
import { CreateMaterialEntryDto } from './dto/create-material-entry.dto';
import { UpdateMaterialEntryDto } from './dto/update-material-entry.dto';
export declare class MaterialEntriesService {
    private entriesRepository;
    private materialsRepository;
    private dataSource;
    constructor(entriesRepository: Repository<MaterialEntry>, materialsRepository: Repository<Material>, dataSource: DataSource);
    create(createDto: CreateMaterialEntryDto): Promise<MaterialEntry>;
    findAll(filters?: {
        materialId?: string;
        vendorId?: string;
    }): Promise<MaterialEntry[]>;
    findOne(id: string): Promise<MaterialEntry>;
    update(id: string, updateDto: UpdateMaterialEntryDto): Promise<MaterialEntry>;
    remove(id: string): Promise<void>;
}
