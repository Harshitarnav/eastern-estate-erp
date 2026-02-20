import { Repository } from 'typeorm';
import { DemandDraftTemplate } from '../entities/demand-draft-template.entity';
import { CreateDemandDraftTemplateDto } from '../dto/create-demand-draft-template.dto';
import { UpdateDemandDraftTemplateDto } from '../dto/update-demand-draft-template.dto';
export declare class DemandDraftTemplateService {
    private readonly templateRepository;
    constructor(templateRepository: Repository<DemandDraftTemplate>);
    create(createDto: CreateDemandDraftTemplateDto, userId: string): Promise<DemandDraftTemplate>;
    findAll(activeOnly?: boolean): Promise<DemandDraftTemplate[]>;
    findOne(id: string): Promise<DemandDraftTemplate>;
    findFirstActive(): Promise<DemandDraftTemplate | null>;
    update(id: string, updateDto: UpdateDemandDraftTemplateDto, userId: string): Promise<DemandDraftTemplate>;
    remove(id: string, userId: string): Promise<void>;
    renderTemplate(template: DemandDraftTemplate, data: Record<string, any>): {
        subject: string;
        htmlContent: string;
    };
}
