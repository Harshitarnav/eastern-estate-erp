import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { User } from '../users/entities/user.entity';
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
   * Generate unique lead code
   */
  private async generateLeadCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of leads this month to generate sequence
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const count = await this.leadsRepository.count({
      where: {
        createdAt: startOfMonth as any,
      },
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `LD${year}${month}${sequence}`;
  }

  /**
   * Create a new lead
   */
  async create(createLeadDto: CreateLeadDto): Promise<LeadResponseDto> {
    // Check for duplicate email or phone
    const existing = await this.leadsRepository.findOne({
      where: [
        { email: createLeadDto.email },
        { phoneNumber: createLeadDto.phone },
      ],
    });

    if (existing) {
      throw new ConflictException(
        'Lead with this email or phone already exists',
      );
    }

    // Generate unique lead code
    const leadCode = await this.generateLeadCode();

    // Map firstName and lastName to fullName
    const { firstName, lastName, phone, ...rest } = createLeadDto;
    const fullName = `${firstName} ${lastName}`.trim();

    const lead = this.leadsRepository.create({
      ...rest,
      leadCode,
      fullName,
      phoneNumber: phone,
    });
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
      .leftJoinAndMapOne(
        'lead.assignedUser',
        User,
        'assignedUser',
        '"assignedUser"."id"::text = "lead"."assigned_to"'
      );

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(lead.fullName ILIKE :search OR lead.email ILIKE :search OR lead.phoneNumber ILIKE :search)',
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

    if (assignedTo) {
      queryBuilder.andWhere('lead.assignedTo = :assignedTo', {
        assignedTo,
      });
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
    const lead = await this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndMapOne(
        'lead.assignedUser',
        User,
        'assignedUser',
        '"assignedUser"."id"::text = "lead"."assigned_to"'
      )
      .where('lead.id = :id', { id })
      .getOne();

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
          { phoneNumber: updateLeadDto.phone || lead.phoneNumber },
        ],
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Lead with this email or phone already exists',
        );
      }
    }

    // Map firstName and lastName to fullName if provided
    const { firstName, lastName, phone, ...rest } = updateLeadDto;
    
    if (firstName || lastName) {
      const newFirstName = firstName || lead.firstName;
      const newLastName = lastName || lead.lastName;
      lead.fullName = `${newFirstName} ${newLastName}`.trim();
    }
    
    if (phone) {
      lead.phoneNumber = phone;
    }

    Object.assign(lead, rest);
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
      lead.followUpNotes = lead.followUpNotes ? `${lead.followUpNotes}\n${notes}` : notes;
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
    const leads = await this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndMapOne(
        'lead.assignedUser',
        User,
        'assignedUser',
        '\"assignedUser\".\"id\"::text = \"lead\".\"assigned_to\"'
      )
      .where('lead.assignedTo = :userId', { userId })
      .andWhere('lead.isActive = true')
      .orderBy('lead.createdAt', 'DESC')
      .getMany();

    return LeadResponseDto.fromEntities(leads);
  }

  /**
   * Get leads due for follow-up
   */
  async getDueFollowUps(userId?: string): Promise<LeadResponseDto[]> {
    const queryBuilder = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndMapOne(
        'lead.assignedUser',
        User,
        'assignedUser',
        '\"assignedUser\".\"id\"::text = \"lead\".\"assigned_to\"'
      )
      .where('lead.nextFollowUpDate <= :today', { today: new Date() })
      .andWhere('lead.isActive = true');

    if (userId) {
      queryBuilder.andWhere('lead.assignedTo = :userId', { userId });
    }

    const leads = await queryBuilder.getMany();
    return LeadResponseDto.fromEntities(leads);
  }
}
