import { ConstructionProgressLogsService } from './construction-progress-logs.service';
export declare class ConstructionProgressLogsController {
    private readonly constructionProgressLogsService;
    constructor(constructionProgressLogsService: ConstructionProgressLogsService);
    create(createDto: any): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    findAll(constructionProjectId?: string, propertyId?: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog[]>;
    findByProject(projectId: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog[]>;
    getLatestByProject(projectId: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    findOne(id: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    update(id: string, updateDto: any): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    uploadPhotos(id: string, files: Express.Multer.File[]): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
    removePhoto(id: string, photoUrl: string): Promise<import("./entities/construction-progress-log.entity").ConstructionProgressLog>;
}
