import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignDto,
  PaginatedCampaignResponseDto,
} from './dto';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      remainingBudget: createCampaignDto.totalBudget,
    });

    return this.campaignsRepository.save(campaign);
  }

  async findAll(
    query: QueryCampaignDto,
  ): Promise<PaginatedCampaignResponseDto> {
    const { search, type, status, channel, page = 1, limit = 10 } = query;

    const queryBuilder = this.campaignsRepository.createQueryBuilder('campaign');

    if (search) {
      queryBuilder.andWhere(
        '(campaign.name LIKE :search OR campaign.campaignCode LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('campaign.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    if (channel) {
      queryBuilder.andWhere('campaign.channel = :channel', { channel });
    }

    queryBuilder
      .orderBy('campaign.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);

    // Recalculate metrics if needed
    if (updateCampaignDto.totalBudget !== undefined) {
      const remainingBudget = updateCampaignDto.totalBudget - campaign.amountSpent;
      const budgetUtilization = (campaign.amountSpent / updateCampaignDto.totalBudget) * 100;
      
      Object.assign(campaign, {
        ...updateCampaignDto,
        remainingBudget,
        budgetUtilization,
      });
    } else {
      Object.assign(campaign, updateCampaignDto);
    }

    return this.campaignsRepository.save(campaign);
  }

  async updateMetrics(
    id: string,
    metrics: {
      impressions?: number;
      clicks?: number;
      leads?: number;
      conversions?: number;
      spend?: number;
      revenue?: number;
    },
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (metrics.impressions !== undefined) {
      campaign.totalImpressions += metrics.impressions;
    }

    if (metrics.clicks !== undefined) {
      campaign.totalClicks += metrics.clicks;
    }

    if (metrics.leads !== undefined) {
      campaign.totalLeads += metrics.leads;
    }

    if (metrics.conversions !== undefined) {
      campaign.conversions += metrics.conversions;
    }

    if (metrics.spend !== undefined) {
      campaign.amountSpent += metrics.spend;
      campaign.remainingBudget = campaign.totalBudget - campaign.amountSpent;
      campaign.budgetUtilization = (campaign.amountSpent / campaign.totalBudget) * 100;
    }

    if (metrics.revenue !== undefined) {
      campaign.revenueGenerated += metrics.revenue;
    }

    // Calculate derived metrics
    if (campaign.totalImpressions > 0) {
      campaign.clickThroughRate = (campaign.totalClicks / campaign.totalImpressions) * 100;
    }

    if (campaign.totalLeads > 0) {
      campaign.conversionRate = (campaign.conversions / campaign.totalLeads) * 100;
      campaign.costPerLead = campaign.amountSpent / campaign.totalLeads;
    }

    if (campaign.conversions > 0) {
      campaign.costPerConversion = campaign.amountSpent / campaign.conversions;
    }

    if (campaign.amountSpent > 0) {
      campaign.roi = ((campaign.revenueGenerated - campaign.amountSpent) / campaign.amountSpent) * 100;
    }

    return this.campaignsRepository.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    campaign.isActive = false;
    await this.campaignsRepository.save(campaign);
  }

  async getStatistics() {
    const total = await this.campaignsRepository.count({
      where: { isActive: true },
    });

    const active = await this.campaignsRepository.count({
      where: { isActive: true, status: CampaignStatus.ACTIVE },
    });

    const completed = await this.campaignsRepository.count({
      where: { isActive: true, status: CampaignStatus.COMPLETED },
    });

    const totalBudget = await this.campaignsRepository
      .createQueryBuilder('campaign')
      .select('SUM(campaign.totalBudget)', 'total')
      .where('campaign.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalSpent = await this.campaignsRepository
      .createQueryBuilder('campaign')
      .select('SUM(campaign.amountSpent)', 'total')
      .where('campaign.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalLeads = await this.campaignsRepository
      .createQueryBuilder('campaign')
      .select('SUM(campaign.totalLeads)', 'total')
      .where('campaign.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalRevenue = await this.campaignsRepository
      .createQueryBuilder('campaign')
      .select('SUM(campaign.revenueGenerated)', 'total')
      .where('campaign.isActive = :isActive', { isActive: true })
      .getRawOne();

    const channelPerformance = await this.campaignsRepository
      .createQueryBuilder('campaign')
      .select('campaign.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(campaign.totalLeads)', 'leads')
      .addSelect('SUM(campaign.amountSpent)', 'spent')
      .where('campaign.isActive = :isActive', { isActive: true })
      .groupBy('campaign.channel')
      .getRawMany();

    return {
      total,
      active,
      completed,
      totalBudget: parseFloat(totalBudget?.total || '0'),
      totalSpent: parseFloat(totalSpent?.total || '0'),
      totalLeads: parseInt(totalLeads?.total || '0'),
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      channelPerformance,
      overallROI: totalSpent?.total > 0 
        ? ((parseFloat(totalRevenue?.total || '0') - parseFloat(totalSpent?.total || '0')) / parseFloat(totalSpent?.total || '0')) * 100
        : 0,
    };
  }
}
