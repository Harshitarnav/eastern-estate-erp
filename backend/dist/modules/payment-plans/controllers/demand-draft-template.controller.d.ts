import { DemandDraftTemplateService } from '../services/demand-draft-template.service';
import { CreateDemandDraftTemplateDto } from '../dto/create-demand-draft-template.dto';
import { UpdateDemandDraftTemplateDto } from '../dto/update-demand-draft-template.dto';
export declare class DemandDraftTemplateController {
    private readonly templateService;
    constructor(templateService: DemandDraftTemplateService);
    create(createDto: CreateDemandDraftTemplateDto, req: any): Promise<import("../entities/demand-draft-template.entity").DemandDraftTemplate>;
    findAll(activeOnly?: string): Promise<import("../entities/demand-draft-template.entity").DemandDraftTemplate[]>;
    findOne(id: string): Promise<import("../entities/demand-draft-template.entity").DemandDraftTemplate>;
    update(id: string, updateDto: UpdateDemandDraftTemplateDto, req: any): Promise<import("../entities/demand-draft-template.entity").DemandDraftTemplate>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
