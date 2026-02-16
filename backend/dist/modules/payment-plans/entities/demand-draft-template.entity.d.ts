import { User } from '../../users/entities/user.entity';
export declare class DemandDraftTemplate {
    id: string;
    name: string;
    description: string;
    subject: string;
    htmlContent: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    creator: User;
    updatedBy: string;
    updater: User;
}
