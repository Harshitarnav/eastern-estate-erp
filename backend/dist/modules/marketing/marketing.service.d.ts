import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
export declare class MarketingService {
    private campaignRepository;
    constructor(campaignRepository: Repository<Campaign>);
    findAll(page?: number, limit?: number): Promise<{
        data: Campaign[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<Campaign>;
    create(createCampaignDto: CreateCampaignDto): Promise<Campaign>;
    update(id: string, updateData: Partial<CreateCampaignDto>): Promise<Campaign>;
    remove(id: string): Promise<void>;
}
