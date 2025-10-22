import { Repository, DataSource } from 'typeorm';
import { MaterialExit } from './entities/material-exit.entity';
import { Material } from './entities/material.entity';
import { CreateMaterialExitDto } from './dto/create-material-exit.dto';
import { UpdateMaterialExitDto } from './dto/update-material-exit.dto';
export declare class MaterialExitsService {
    private exitsRepository;
    private materialsRepository;
    private dataSource;
    constructor(exitsRepository: Repository<MaterialExit>, materialsRepository: Repository<Material>, dataSource: DataSource);
    create(createDto: CreateMaterialExitDto): Promise<MaterialExit>;
    findAll(filters?: {
        materialId?: string;
        projectId?: string;
    }): Promise<MaterialExit[]>;
    findOne(id: string): Promise<MaterialExit>;
    update(id: string, updateDto: UpdateMaterialExitDto): Promise<MaterialExit>;
    remove(id: string): Promise<void>;
}
