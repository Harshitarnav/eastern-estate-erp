import { Repository } from 'typeorm';
import { ConstructionTowerProgress, ConstructionPhase } from './entities/construction-tower-progress.entity';
import { CreateTowerProgressDto } from './dto/create-tower-progress.dto';
import { UpdateTowerProgressDto } from './dto/update-tower-progress.dto';
export declare class TowerProgressService {
    private readonly towerProgressRepo;
    constructor(towerProgressRepo: Repository<ConstructionTowerProgress>);
    create(createDto: CreateTowerProgressDto): Promise<ConstructionTowerProgress>;
    findAll(): Promise<ConstructionTowerProgress[]>;
    findByProject(projectId: string): Promise<ConstructionTowerProgress[]>;
    findByTower(towerId: string): Promise<ConstructionTowerProgress[]>;
    findByTowerAndPhase(towerId: string, phase?: ConstructionPhase): Promise<ConstructionTowerProgress | ConstructionTowerProgress[]>;
    findOne(id: string): Promise<ConstructionTowerProgress>;
    update(id: string, updateDto: UpdateTowerProgressDto): Promise<ConstructionTowerProgress>;
    remove(id: string): Promise<ConstructionTowerProgress>;
    calculateTowerOverallProgress(towerId: string, projectId: string): Promise<number>;
    updateTowerOverallProgress(towerId: string, projectId: string): Promise<number>;
    getTowerProgressSummary(projectId: string): Promise<any[]>;
    initializeTowerPhases(projectId: string, towerId: string): Promise<ConstructionTowerProgress[]>;
    getProjectTowersCompletionPercentage(projectId: string): Promise<number>;
}
