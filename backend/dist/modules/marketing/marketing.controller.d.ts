import { MarketingService } from './marketing.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    create(createCampaignDto: CreateCampaignDto): Promise<import("./entities/campaign.entity").Campaign>;
    findAll(query: QueryCampaignDto): Promise<import("./dto").PaginatedCampaignResponseDto>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        completed: number;
        totalBudget: number;
        totalSpent: number;
        totalLeads: number;
        totalRevenue: number;
        channelPerformance: any[];
        overallROI: number;
    }>;
    findOne(id: string): Promise<import("./entities/campaign.entity").Campaign>;
    update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<import("./entities/campaign.entity").Campaign>;
    updateMetrics(id: string, metrics: any): Promise<import("./entities/campaign.entity").Campaign>;
    remove(id: string): Promise<void>;
}
