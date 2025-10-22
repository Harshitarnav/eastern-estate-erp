import { Repository } from 'typeorm';
import { ConstructionFlatProgress } from './entities/construction-flat-progress.entity';
import { ConstructionPhase } from './entities/construction-tower-progress.entity';
import { CreateFlatProgressDto } from './dto/create-flat-progress.dto';
import { UpdateFlatProgressDto } from './dto/update-flat-progress.dto';
export declare class FlatProgressService {
    private readonly flatProgressRepo;
    constructor(flatProgressRepo: Repository<ConstructionFlatProgress>);
    create(createDto: CreateFlatProgressDto): Promise<ConstructionFlatProgress>;
    findAll(): Promise<ConstructionFlatProgress[]>;
    findByProject(projectId: string): Promise<ConstructionFlatProgress[]>;
    findByFlat(flatId: string): Promise<ConstructionFlatProgress[]>;
    findByFlatAndPhase(flatId: string, phase?: ConstructionPhase): Promise<ConstructionFlatProgress | ConstructionFlatProgress[]>;
    findOne(id: string): Promise<ConstructionFlatProgress>;
    update(id: string, updateDto: UpdateFlatProgressDto): Promise<ConstructionFlatProgress>;
    remove(id: string): Promise<ConstructionFlatProgress>;
    calculateFlatOverallProgress(flatId: string, projectId: string): Promise<number>;
    updateFlatOverallProgress(flatId: string, projectId: string): Promise<number>;
    getFlatProgressSummary(projectId: string): Promise<any[]>;
    initializeFlatPhases(projectId: string, flatId: string): Promise<ConstructionFlatProgress[]>;
    getProjectFlatsCompletionPercentage(projectId: string): Promise<number>;
    getFlatsReadyForHandover(projectId: string): Promise<ConstructionFlatProgress[]>;
    getFlatProgressByTower(projectId: string, towerId: string): Promise<ConstructionFlatProgress[]>;
}
