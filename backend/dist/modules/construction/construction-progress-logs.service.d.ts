import { Repository } from 'typeorm';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';
export declare class ConstructionProgressLogsService {
    private readonly constructionProgressLogRepository;
    constructor(constructionProgressLogRepository: Repository<ConstructionProgressLog>);
    create(createDto: any): Promise<ConstructionProgressLog[]>;
    findByProject(constructionProjectId: string): Promise<ConstructionProgressLog[]>;
    findOne(id: string): Promise<ConstructionProgressLog>;
    update(id: string, updateDto: any): Promise<ConstructionProgressLog>;
    remove(id: string): Promise<void>;
    getLatestByProject(constructionProjectId: string): Promise<ConstructionProgressLog>;
}
