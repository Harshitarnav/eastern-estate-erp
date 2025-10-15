import { ConstructionService } from './construction.service';
import { CreateConstructionProjectDto, UpdateConstructionProjectDto, QueryConstructionProjectDto, ConstructionProjectResponseDto, PaginatedConstructionProjectsResponse } from './dto';
export declare class ConstructionController {
    private readonly constructionService;
    constructor(constructionService: ConstructionService);
    create(createDto: CreateConstructionProjectDto): Promise<ConstructionProjectResponseDto>;
    findAll(query: QueryConstructionProjectDto): Promise<PaginatedConstructionProjectsResponse>;
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
    findOne(id: string): Promise<ConstructionProjectResponseDto>;
    update(id: string, updateDto: UpdateConstructionProjectDto): Promise<ConstructionProjectResponseDto>;
    remove(id: string): Promise<void>;
    updateProgress(id: string, body: {
        phase: string;
        progress: number;
    }): Promise<ConstructionProjectResponseDto>;
}
