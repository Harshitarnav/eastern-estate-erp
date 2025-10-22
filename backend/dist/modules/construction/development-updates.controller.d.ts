import { DevelopmentUpdatesService } from './development-updates.service';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import { UpdateDevelopmentUpdateDto } from './dto/update-development-update.dto';
export declare class DevelopmentUpdatesController {
    private readonly developmentUpdatesService;
    constructor(developmentUpdatesService: DevelopmentUpdatesService);
    createUpdate(projectId: string, createDto: CreateDevelopmentUpdateDto, req: any): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    getProjectUpdates(projectId: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate[]>;
    getUpdate(updateId: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    updateUpdate(updateId: string, updateDto: UpdateDevelopmentUpdateDto): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    deleteUpdate(updateId: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    addImages(updateId: string, images: string[]): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    removeImage(updateId: string, imageUrl: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    addAttachments(updateId: string, attachments: string[]): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    getRecentUpdates(projectId: string, days?: number): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate[]>;
    getUpdatesWithImages(projectId: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate[]>;
    getUpdatesByVisibility(projectId: string, visibility: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate[]>;
    getUpdatesTimeline(projectId: string): Promise<{
        month: string;
        updates: import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate[];
        count: number;
    }[]>;
    getUpdateStatistics(projectId: string): Promise<{
        totalUpdates: number;
        updatesWithImages: number;
        updatesWithAttachments: number;
        recentUpdates: number;
        totalImages: number;
        totalAttachments: number;
    }>;
}
