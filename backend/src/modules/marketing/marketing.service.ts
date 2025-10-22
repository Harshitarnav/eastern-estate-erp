import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async findAll(page: number = 1, limit: number = 12) {
    const [data, total] = await this.campaignRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return await this.campaignRepository.findOne({ where: { id } });
  }

  async create(createCampaignDto: CreateCampaignDto) {
    const campaign = this.campaignRepository.create(createCampaignDto);
    return await this.campaignRepository.save(campaign);
  }

  async update(id: string, updateData: Partial<CreateCampaignDto>) {
    await this.campaignRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.campaignRepository.delete(id);
  }
}
