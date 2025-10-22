import { ConstructionProgressLogsService } from './construction-progress-logs.service';
export declare class ConstructionProgressLogsController {
    private readonly constructionProgressLogsService;
    constructor(constructionProgressLogsService: ConstructionProgressLogsService);
    create(createDto: any): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog[]>;
    findByProject(projectId: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog[]>;
    getLatestByProject(projectId: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    findOne(id: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    update(id: string, updateDto: any): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    remove(id: string): Promise<void>;
}
