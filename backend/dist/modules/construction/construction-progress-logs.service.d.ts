import { Repository } from 'typeorm';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';
import { ConstructionProject } from './entities/construction-project.entity';
export declare class ConstructionProgressLogsService {
    private readonly constructionProgressLogRepository;
    private readonly constructionProjectRepository;
    constructor(constructionProgressLogRepository: Repository<ConstructionProgressLog>, constructionProjectRepository: Repository<ConstructionProject>);
    create(createDto: any): Promise<ConstructionProgressLog>;
    findAll(filters?: {
        constructionProjectId?: string;
        propertyId?: string;
    }): Promise<ConstructionProgressLog[]>;
    findByProject(constructionProjectId: string): Promise<ConstructionProgressLog[]>;
    findOne(id: string): Promise<ConstructionProgressLog>;
    update(id: string, updateDto: any): Promise<ConstructionProgressLog>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getLatestByProject(constructionProjectId: string): Promise<ConstructionProgressLog>;
    addPhotos(id: string, urls: string[]): Promise<ConstructionProgressLog>;
    removePhoto(id: string, photoUrl: string): Promise<ConstructionProgressLog>;
}
