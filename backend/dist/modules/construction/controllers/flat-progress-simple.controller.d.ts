import { Repository } from 'typeorm';
import { FlatProgressService } from '../flat-progress.service';
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionProject } from '../entities/construction-project.entity';
import { ConstructionWorkflowService } from '../services/construction-workflow.service';
interface SimpleFlatProgressDto {
    flatId: string;
    phase: string;
    phaseProgress?: number;
    overallProgress?: number;
    status?: string;
    notes?: string;
}
export declare class FlatProgressSimpleController {
    private readonly flatProgressService;
    private readonly workflowService;
    private flatRepository;
    private constructionProjectRepository;
    constructor(flatProgressService: FlatProgressService, workflowService: ConstructionWorkflowService, flatRepository: Repository<Flat>, constructionProjectRepository: Repository<ConstructionProject>);
    getFlatProgress(flatId: string): Promise<import("../entities/construction-flat-progress.entity").ConstructionFlatProgress[]>;
    createFlatProgress(dto: SimpleFlatProgressDto): Promise<any>;
}
export {};
