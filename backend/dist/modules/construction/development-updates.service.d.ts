import { Repository } from 'typeorm';
import { ConstructionDevelopmentUpdate, DevelopmentUpdateCategory, DevelopmentUpdateScope } from './entities/construction-development-update.entity';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import { UpdateDevelopmentUpdateDto } from './dto/update-development-update.dto';
import { ConstructionProject } from './entities/construction-project.entity';
export interface ScopedUpdateFilters {
    propertyId?: string;
    towerId?: string;
    scopeType?: DevelopmentUpdateScope;
    category?: DevelopmentUpdateCategory;
    limit?: number;
    offset?: number;
}
export declare class DevelopmentUpdatesService {
    private readonly updatesRepo;
    private readonly projectRepo;
    constructor(updatesRepo: Repository<ConstructionDevelopmentUpdate>, projectRepo: Repository<ConstructionProject>);
    create(createDto: CreateDevelopmentUpdateDto, createdBy: string): Promise<ConstructionDevelopmentUpdate>;
    findAll(): Promise<ConstructionDevelopmentUpdate[]>;
    findScoped(filters: ScopedUpdateFilters, accessiblePropertyIds?: string[] | null): Promise<ConstructionDevelopmentUpdate[]>;
    findByProject(projectId: string): Promise<ConstructionDevelopmentUpdate[]>;
    findOne(id: string): Promise<ConstructionDevelopmentUpdate>;
    update(id: string, updateDto: UpdateDevelopmentUpdateDto): Promise<ConstructionDevelopmentUpdate>;
    remove(id: string): Promise<ConstructionDevelopmentUpdate>;
    addImages(id: string, imageUrls: string[]): Promise<ConstructionDevelopmentUpdate>;
    removeImage(id: string, imageUrl: string): Promise<ConstructionDevelopmentUpdate>;
    addAttachments(id: string, attachmentUrls: string[]): Promise<ConstructionDevelopmentUpdate>;
    getRecentUpdates(projectId: string, days?: number): Promise<ConstructionDevelopmentUpdate[]>;
    getUpdatesWithImages(projectId: string): Promise<ConstructionDevelopmentUpdate[]>;
    getUpdatesByVisibility(projectId: string, visibility: string): Promise<ConstructionDevelopmentUpdate[]>;
    getUpdatesTimeline(projectId: string): Promise<{
        month: string;
        updates: ConstructionDevelopmentUpdate[];
        count: number;
    }[]>;
    getProjectUpdateStatistics(projectId: string): Promise<{
        totalUpdates: number;
        updatesWithImages: number;
        updatesWithAttachments: number;
        recentUpdates: number;
        totalImages: number;
        totalAttachments: number;
    }>;
}
