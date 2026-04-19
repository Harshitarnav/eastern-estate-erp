import { Repository } from 'typeorm';
import { FlatProgressService } from '../flat-progress.service';
import { Flat } from '../../flats/entities/flat.entity';
import { ConstructionProject } from '../entities/construction-project.entity';
import { ConstructionFlatProgress } from '../entities/construction-flat-progress.entity';
import { ConstructionWorkflowService } from '../services/construction-workflow.service';
interface SimpleFlatProgressDto {
    flatId: string;
    phase: string;
    phaseProgress?: number;
    overallProgress?: number;
    status?: string;
    notes?: string;
    photos?: string[];
}
export declare class FlatProgressSimpleController {
    private readonly flatProgressService;
    private readonly workflowService;
    private flatRepository;
    private constructionProjectRepository;
    private flatProgressRepo;
    constructor(flatProgressService: FlatProgressService, workflowService: ConstructionWorkflowService, flatRepository: Repository<Flat>, constructionProjectRepository: Repository<ConstructionProject>, flatProgressRepo: Repository<ConstructionFlatProgress>);
    getFlatProgress(flatId: string): Promise<ConstructionFlatProgress[]>;
    getRecent(limit?: string, propertyId?: string): Promise<ConstructionFlatProgress[]>;
    uploadPhotos(files?: Express.Multer.File[]): {
        urls: string[];
    };
    createFlatProgress(dto: SimpleFlatProgressDto): Promise<any>;
}
export {};
