import { FlatProgressService } from './flat-progress.service';
import { CreateFlatProgressDto } from './dto/create-flat-progress.dto';
import { UpdateFlatProgressDto } from './dto/update-flat-progress.dto';
import { ConstructionPhase } from './entities/construction-tower-progress.entity';
import { ConstructionWorkflowService } from './services/construction-workflow.service';
import { ConstructionProjectsService } from './construction-projects.service';
export declare class FlatProgressController {
    private readonly flatProgressService;
    private readonly workflowService;
    private readonly projectsService;
    constructor(flatProgressService: FlatProgressService, workflowService: ConstructionWorkflowService, projectsService: ConstructionProjectsService);
    createFlatProgress(projectId: string, flatId: string, createDto: CreateFlatProgressDto): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress>;
    updateFlatProgress(id: string, updateDto: UpdateFlatProgressDto): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress>;
    getFlatProgress(projectId: string, flatId: string, phase?: ConstructionPhase): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress | import("./entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
    getFlatPhaseProgress(flatId: string, phase: ConstructionPhase): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress | import("./entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
    getFlatSummary(projectId: string): Promise<any[]>;
    getFlatsReadyForHandover(projectId: string): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
    getFlatProgressByTower(projectId: string, towerId: string): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
    initializeFlatPhases(projectId: string, flatId: string): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
    calculateProgress(flatId: string, projectId: string): Promise<{
        overallProgress: number;
    }>;
    getProjectFlatsCompletion(projectId: string): Promise<{
        completion: number;
    }>;
    deleteFlatProgress(id: string): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress>;
    getAllFlatProgress(projectId: string): Promise<import("./entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
}
