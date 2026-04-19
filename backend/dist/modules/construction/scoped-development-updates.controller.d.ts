import { DevelopmentUpdatesService } from './development-updates.service';
import { CreateDevelopmentUpdateDto } from './dto/create-development-update.dto';
import { DevelopmentUpdateCategory, DevelopmentUpdateScope } from './entities/construction-development-update.entity';
export declare class ScopedDevelopmentUpdatesController {
    private readonly service;
    constructor(service: DevelopmentUpdatesService);
    list(req: any, propertyId?: string, towerId?: string, scopeType?: DevelopmentUpdateScope, category?: DevelopmentUpdateCategory, limit?: string, offset?: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate[]>;
    getOne(id: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    create(dto: CreateDevelopmentUpdateDto, req: any): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    remove(id: string): Promise<import("./entities/construction-development-update.entity").ConstructionDevelopmentUpdate>;
    uploadImages(files?: Express.Multer.File[]): {
        urls: string[];
    };
}
