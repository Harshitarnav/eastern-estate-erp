import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  QueryLeadDto,
  LeadResponseDto,
  PaginatedLeadsResponse,
} from './dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  /**
   * Create a new lead
   */
  async create(createLeadDto: CreateLeadDto): Promise<LeadResponseDto> {
    // Check for duplicate email or phone
    const existing = await this.leadsRepository.findOne({
      where: [
        { email: createLeadDto.email },
        { phone: createLeadDto.phone },
      ],
    });

    if (existing) {
      throw new ConflictException(
        'Lead with this email or phone already exists',
      );
    }

    const lead = this.leadsRepository.create(createLeadDto);
    const savedLead = await this.leadsRepository.save(lead);

    return LeadResponseDto.fromEntity(savedLead);
  }

  /**
   * Get all leads with filtering and pagination
   */
  async findAll(query: QueryLeadDto): Promise<PaginatedLeadsResponse> {
    const {
      search,
      status,
      source,
      priority,
      propertyId,
      assignedTo,
      isQualified,
      needsHomeLoan,
      hasSiteVisit,
      minBudget,
      maxBudget,
      createdFrom,
      createdTo,
      followUpDue,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.property', 'property')
      .leftJoinAndSelect('lead.assignedUser', 'assignedUser');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(lead.firstName ILIKE :search OR lead.lastName ILIKE :search OR lead.email ILIKE :search OR lead.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filters
    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('lead.source = :source', { source });
    }

    if (priority) {
      queryBuilder.andWhere('lead.priority = :priority', { priority });
    }

    if (propertyId) {
      queryBuilder.andWhere('lead.propertyId = :propertyId', { propertyId });
    }

    if (assignedTo) {
      queryBuilder.andWhere('lead.assignedTo = :assignedTo', { assignedTo });
    }

    if (isQualified !== undefined) {
      queryBuilder.andWhere('lead.isQualified = :isQualified', {
        isQualified,
      });
    }

    if (needsHomeLoan !== undefined) {
      queryBuilder.andWhere('lead.needsHomeLoan = :needsHomeLoan', {
        needsHomeLoan,
      });
    }

    if (hasSiteVisit !== undefined) {
      queryBuilder.andWhere('lead.hasSiteVisit = :hasSiteVisit', {
        hasSiteVisit,
      });
    }

    if (minBudget !== undefined) {
      queryBuilder.andWhere('lead.budgetMin >= :minBudget', { minBudget });
    }

    if (maxBudget !== undefined) {
      queryBuilder.andWhere('lead.budgetMax <= :maxBudget', { maxBudget });
    }

    if (createdFrom) {
      queryBuilder.andWhere('lead.createdAt >= :createdFrom', { createdFrom });
    }

    if (createdTo) {
      queryBuilder.andWhere('lead.createdAt <= :createdTo', { createdTo });
    }

    if (followUpDue) {
      queryBuilder.andWhere('lead.nextFollowUpDate <= :followUpDue', {
        followUpDue,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('lead.isActive = :isActive', { isActive });
    }

    // Sorting
    queryBuilder.orderBy(`lead.${sortBy}`, sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const leads = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: LeadResponseDto.fromEntities(leads),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get lead by ID
   */
  async findOne(id: string): Promise<LeadResponseDto> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['property', 'assignedUser'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return LeadResponseDto.fromEntity(lead);
  }

  /**
   * Update lead
   */
  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadsRepository.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Check for duplicate email/phone if updating
    if (updateLeadDto.email || updateLeadDto.phone) {
      const existing = await this.leadsRepository.findOne({
        where: [
          { email: updateLeadDto.email || lead.email },
          { phone: updateLeadDto.phone || lead.phone },
        ],
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Lead with this email or phone already exists',
        );
      }
    }

    Object.assign(lead, updateLeadDto);
    const updatedLead = await this.leadsRepository.save(lead);

    return LeadResponseDto.fromEntity(updatedLead);
  }

  /**
   * Delete lead (soft delete)
   */
  async remove(id: string): Promise<void> {
    const lead = await this.leadsRepository.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.isActive = false;
    await this.leadsRepository.save(lead);
  }

  /**
   * Assign lead to user
   */
  async assignLead(id: string, userId: string): Promise<LeadResponseDto> {
    const lead = await this.leadsRepository.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.assignedTo = userId;
    lead.assignedAt = new Date();

    const updatedLead = await this.leadsRepository.save(lead);
    return LeadResponseDto.fromEntity(updatedLead);
  }

  /**
   * Update lead status
   */
  async updateStatus(
    id: string,
    status: string,
    notes?: string,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadsRepository.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.status = status as any;
    if (notes) {
      lead.notes = lead.notes ? `${lead.notes}\n${notes}` : notes;
    }

    const updatedLead = await this.leadsRepository.save(lead);
    return LeadResponseDto.fromEntity(updatedLead);
  }

  /**
   * Get leads statistics
   */
  async getStatistics() {
    const leads = await this.leadsRepository.find({
      where: { isActive: true },
    });

    const total = leads.length;
    const newLeads = leads.filter((l) => l.status === 'NEW').length;
    const contacted = leads.filter((l) => l.status === 'CONTACTED').length;
    const qualified = leads.filter((l) => l.status === 'QUALIFIED').length;
    const won = leads.filter((l) => l.status === 'WON').length;
    const lost = leads.filter((l) => l.status === 'LOST').length;

    const conversionRate = total > 0 ? (won / total) * 100 : 0;

    return {
      total,
      newLeads,
      contacted,
      qualified,
      won,
      lost,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Get leads by assigned user
   */
  async getMyLeads(userId: string): Promise<LeadResponseDto[]> {
    const leads = await this.leadsRepository.find({
      where: { assignedTo: userId, isActive: true },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });

    return LeadResponseDto.fromEntities(leads);
  }

  /**
   * Get leads due for follow-up
   */
  async getDueFollowUps(userId?: string): Promise<LeadResponseDto[]> {
    const queryBuilder = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.property', 'property')
      .where('lead.nextFollowUpDate <= :today', { today: new Date() })
      .andWhere('lead.isActive = :isActive', { isActive: true });

    if (userId) {
      queryBuilder.andWhere('lead.assignedTo = :userId', { userId });
    }

    const leads = await queryBuilder.getMany();
    return LeadResponseDto.fromEntities(leads);
  }
}
