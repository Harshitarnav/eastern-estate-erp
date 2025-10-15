import { CampaignType, CampaignStatus, CampaignChannel } from '../entities/campaign.entity';
export declare class QueryCampaignDto {
    search?: string;
    type?: CampaignType;
    status?: CampaignStatus;
    channel?: CampaignChannel;
    page?: number;
    limit?: number;
}
