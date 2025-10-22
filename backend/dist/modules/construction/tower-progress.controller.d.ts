import { TowerProgressService } from './tower-progress.service';
import { CreateTowerProgressDto } from './dto/create-tower-progress.dto';
import { UpdateTowerProgressDto } from './dto/update-tower-progress.dto';
import { ConstructionPhase } from './entities/construction-tower-progress.entity';
export declare class TowerProgressController {
    private readonly towerProgressService;
    constructor(towerProgressService: TowerProgressService);
    createTowerProgress(projectId: string, towerId: string, createDto: CreateTowerProgressDto): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress>;
    updateTowerProgress(id: string, updateDto: UpdateTowerProgressDto): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress>;
    getTowerProgress(projectId: string, towerId: string, phase?: ConstructionPhase): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress | import("./entities/construction-tower-progress.entity").ConstructionTowerProgress[]>;
    getTowerPhaseProgress(towerId: string, phase: ConstructionPhase): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress | import("./entities/construction-tower-progress.entity").ConstructionTowerProgress[]>;
    getTowerSummary(projectId: string): Promise<any[]>;
    initializeTowerPhases(projectId: string, towerId: string): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress[]>;
    calculateProgress(towerId: string, projectId: string): Promise<{
        overallProgress: number;
    }>;
    getProjectTowersCompletion(projectId: string): Promise<{
        completion: number;
    }>;
    deleteTowerProgress(id: string): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress>;
    getAllTowerProgress(projectId: string): Promise<import("./entities/construction-tower-progress.entity").ConstructionTowerProgress[]>;
}
