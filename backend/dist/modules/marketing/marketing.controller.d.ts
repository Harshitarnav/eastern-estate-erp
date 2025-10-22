import { MarketingService } from './marketing.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    findAll(page?: string, limit?: string): Promise<{
        data: import("./entities/campaign.entity").Campaign[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./entities/campaign.entity").Campaign>;
    create(createCampaignDto: CreateCampaignDto): Promise<import("./entities/campaign.entity").Campaign>;
    update(id: string, updateData: Partial<CreateCampaignDto>): Promise<import("./entities/campaign.entity").Campaign>;
    partialUpdate(id: string, updateData: Partial<CreateCampaignDto>): Promise<import("./entities/campaign.entity").Campaign>;
    remove(id: string): Promise<void>;
}
