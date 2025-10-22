import { ConstructionProject } from './construction-project.entity';
import { User } from '../../users/entities/user.entity';
export declare enum UpdateVisibility {
    ALL = "ALL",
    INTERNAL = "INTERNAL",
    MANAGEMENT_ONLY = "MANAGEMENT_ONLY"
}
export declare class ConstructionDevelopmentUpdate {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    updateDate: Date;
    updateTitle: string;
    updateDescription: string;
    feedbackNotes: string | null;
    images: string[];
    attachments: string[];
    createdBy: string;
    creator: User;
    visibility: UpdateVisibility;
    createdAt: Date;
    updatedAt: Date;
    get hasImages(): boolean;
    get hasAttachments(): boolean;
    get imageCount(): number;
    get attachmentCount(): number;
    get isRecent(): boolean;
}
