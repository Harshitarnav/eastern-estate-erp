import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto, PaginatedCampaignResponseDto } from './dto';
export declare class MarketingService {
    private campaignsRepository;
    constructor(campaignsRepository: Repository<Campaign>);
    create(createCampaignDto: CreateCampaignDto): Promise<Campaign>;
    findAll(query: QueryCampaignDto): Promise<PaginatedCampaignResponseDto>;
    findOne(id: string): Promise<Campaign>;
    update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign>;
    updateMetrics(id: string, metrics: {
        impressions?: number;
        clicks?: number;
        leads?: number;
        conversions?: number;
        spend?: number;
        revenue?: number;
    }): Promise<Campaign>;
    remove(id: string): Promise<void>;
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
}
