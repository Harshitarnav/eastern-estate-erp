import { CampaignType, CampaignStatus, CampaignChannel } from '../entities/campaign.entity';
export declare class CreateCampaignDto {
    campaignCode: string;
    name: string;
    description?: string;
    type: CampaignType;
    status?: CampaignStatus;
    channel: CampaignChannel;
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    objectives?: string;
    message?: string;
    callToAction?: string;
    landingPageUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    vendorName?: string;
    agencyName?: string;
    managerId?: string;
    targetAudience?: any;
    tags?: string[];
    notes?: string;
}
