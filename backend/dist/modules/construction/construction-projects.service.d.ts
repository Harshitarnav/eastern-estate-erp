import { Repository } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { ConstructionTowerProgress } from './entities/construction-tower-progress.entity';
import { ConstructionFlatProgress } from './entities/construction-flat-progress.entity';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';
export declare class ConstructionProjectsService {
    private readonly constructionProjectRepository;
    private readonly towerProgressRepository;
    private readonly flatProgressRepository;
    private readonly logger;
    constructor(constructionProjectRepository: Repository<ConstructionProject>, towerProgressRepository: Repository<ConstructionTowerProgress>, flatProgressRepository: Repository<ConstructionFlatProgress>);
    recomputeOverallProgress(projectId: string): Promise<number | null>;
    create(createDto: CreateConstructionProjectDto): Promise<ConstructionProject>;
    findAll(propertyId?: string, accessiblePropertyIds?: string[] | null): Promise<ConstructionProject[]>;
    findOne(id: string): Promise<ConstructionProject>;
    update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProject>;
    remove(id: string): Promise<void>;
    getByProperty(propertyId: string): Promise<ConstructionProject[]>;
}
