import { Repository } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { CreateConstructionProjectDto, UpdateConstructionProjectDto, QueryConstructionProjectDto, ConstructionProjectResponseDto, PaginatedConstructionProjectsResponse } from './dto';
export declare class ConstructionService {
    private constructionRepository;
    constructor(constructionRepository: Repository<ConstructionProject>);
    create(createDto: CreateConstructionProjectDto): Promise<ConstructionProjectResponseDto>;
    findAll(query: QueryConstructionProjectDto): Promise<PaginatedConstructionProjectsResponse>;
    findOne(id: string): Promise<ConstructionProjectResponseDto>;
    update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProjectResponseDto>;
    remove(id: string): Promise<void>;
    updateProgress(id: string, phase: string, progress: number): Promise<ConstructionProjectResponseDto>;
    getStatistics(): Promise<{
        total: number;
        notStarted: number;
        inProgress: number;
        onHold: number;
        delayed: number;
        completed: number;
        totalBudget: number;
        totalCost: number;
        budgetVariance: number;
        totalDelayDays: number;
        avgProgress: number;
        byPhase: {
            planning: number;
            foundation: number;
            structure: number;
            finishing: number;
            completed: number;
        };
        onTimeRate: number;
    }>;
}
