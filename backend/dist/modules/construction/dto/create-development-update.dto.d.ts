import { UpdateVisibility } from '../entities/construction-development-update.entity';
export declare class CreateDevelopmentUpdateDto {
    constructionProjectId: string;
    updateDate?: string;
    updateTitle: string;
    updateDescription: string;
    feedbackNotes?: string;
    images?: string[];
    attachments?: string[];
    visibility?: UpdateVisibility;
}
