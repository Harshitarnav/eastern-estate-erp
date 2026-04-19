import { UpdateVisibility, DevelopmentUpdateScope, DevelopmentUpdateCategory } from '../entities/construction-development-update.entity';
export declare class CreateDevelopmentUpdateDto {
    constructionProjectId?: string;
    propertyId?: string;
    towerId?: string;
    scopeType?: DevelopmentUpdateScope;
    commonAreaLabel?: string;
    category?: DevelopmentUpdateCategory;
    updateDate?: string;
    updateTitle: string;
    updateDescription: string;
    feedbackNotes?: string;
    images?: string[];
    attachments?: string[];
    visibility?: UpdateVisibility;
}
