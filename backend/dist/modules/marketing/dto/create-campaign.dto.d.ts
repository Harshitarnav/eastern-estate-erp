export declare class CreateCampaignDto {
    name: string;
    description?: string;
    type: string;
    status: string;
    budget?: number;
    startDate?: string | Date;
    endDate?: string | Date;
    notes?: string;
    attachments?: any[];
}
