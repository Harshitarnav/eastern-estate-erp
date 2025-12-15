import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateLeadDto,
  UpdateLeadDto,
  QueryLeadDto,
  LeadResponseDto,
  PaginatedLeadsResponse,
  BulkAssignLeadsDto,
  CheckDuplicateLeadDto,
  DuplicateLeadResponseDto,
  AgentDashboardStatsDto,
  AdminDashboardStatsDto,
  TeamDashboardStatsDto,
  GetDashboardStatsDto,
  ExportLeadsDto,
  ImportLeadsDto,
  ImportLeadsResultDto,
  ImportLeadRowDto,
} from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../notifications/entities/notification.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Generate unique lead code
   */
  private async generateLeadCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Count leads in the current month to generate a sequential code
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const count = await this.leadsRepository.count({
      where: {
        createdAt: Between(startOfMonth as any, endOfMonth as any),
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
    const duplicateChecks = [];
    if (createLeadDto.email) {
      duplicateChecks.push({ email: createLeadDto.email });
    }
    if (createLeadDto.phone) {
      duplicateChecks.push({ phoneNumber: createLeadDto.phone });
    }
    if (duplicateChecks.length > 0) {
      const existing = await this.leadsRepository.findOne({
        where: duplicateChecks,
      });
      if (existing) {
        throw new ConflictException('Lead with this email or phone already exists');
      }
    }

    // Generate unique lead code
    const leadCode = await this.generateLeadCode();

    // Map firstName and lastName to fullName
    const { firstName, lastName, phone, email, ...rest } = createLeadDto;
    const fullName = `${firstName} ${lastName}`.trim();
    const normalizedEmail =
      (email || '').trim() ||
      `lead-${leadCode.toLowerCase()}-${(phone || '').replace(/\D/g, '') || 'noemail'}@lead.local`;

    const lead = this.leadsRepository.create({
      ...rest,
      leadCode,
      fullName,
      phoneNumber: phone,
      email: normalizedEmail,
    });
    const savedLead = await this.leadsRepository.save(lead);

    return LeadResponseDto.fromEntity(savedLead);
  }

  /**
   * Get all leads with filtering and pagination
   */
  async findAll(query: QueryLeadDto, user?: any): Promise<PaginatedLeadsResponse> {
    const {
      search,
      status,
      source,
      priority,
      assignedTo,
      propertyId,
      towerId,
      flatId,
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

    if (propertyId) {
      queryBuilder.andWhere('lead.propertyId = :propertyId', { propertyId });
    }

    if (towerId) {
      queryBuilder.andWhere('lead.towerId = :towerId', { towerId });
    }

    if (flatId) {
      queryBuilder.andWhere('lead.flatId = :flatId', { flatId });
    }

    const effectiveAssignedTo =
      this.isManager(user) && assignedTo ? assignedTo : !this.isManager(user) && user?.id ? user.id : undefined;
    if (effectiveAssignedTo) {
      queryBuilder.andWhere('lead.assignedTo = :assignedTo', {
        assignedTo: effectiveAssignedTo,
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
  async assignLead(id: string, userId: string, assignedBy?: string): Promise<LeadResponseDto> {
    const lead = await this.leadsRepository.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    lead.assignedTo = userId;
    lead.assignedAt = new Date();

    const history = Array.isArray(lead.assignmentHistory) ? lead.assignmentHistory : [];
    history.push({
      assignedBy: assignedBy || 'system',
      assignedTo: userId,
      at: new Date(),
    });
    lead.assignmentHistory = history;

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

  /**
   * Bulk assign leads to a user
   */
  async bulkAssignLeads(bulkAssignDto: BulkAssignLeadsDto): Promise<{ assigned: number }> {
    const { leadIds, assignedTo } = bulkAssignDto;

    // Verify leads exist
    const leads = await this.leadsRepository.find({
      where: { id: In(leadIds) },
    });

    if (leads.length !== leadIds.length) {
      throw new NotFoundException('Some leads not found');
    }

    // Update all leads
    await this.leadsRepository.update(
      { id: In(leadIds) },
      { assignedTo, assignedAt: new Date() },
    );

    // Create notification for the assigned user
    await this.notificationsService.create({
      userId: assignedTo,
      type: NotificationType.INFO,
      category: NotificationCategory.LEAD,
      title: 'New Leads Assigned',
      message: `You have been assigned ${leadIds.length} new lead(s)`,
      metadata: { leadIds },
    });

    return { assigned: leadIds.length };
  }

  /**
   * Check for duplicate lead
   */
  async checkDuplicateLead(checkDto: CheckDuplicateLeadDto): Promise<DuplicateLeadResponseDto> {
    const { email, phone } = checkDto;

    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    const conditions = [];
    if (phone) conditions.push({ phoneNumber: phone });
    if (email) conditions.push({ email });

    const existingLead = await this.leadsRepository.findOne({
      where: conditions,
      relations: ['assignedUser'],
    });

    if (existingLead) {
      return {
        isDuplicate: true,
        existingLead: {
          id: existingLead.id,
          fullName: existingLead.fullName,
          email: existingLead.email,
          phoneNumber: existingLead.phoneNumber,
          status: existingLead.status,
          source: existingLead.source,
          assignedTo: existingLead.assignedTo,
          createdAt: existingLead.createdAt,
        },
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Get agent dashboard statistics
   */
  async getAgentDashboardStats(agentId: string, query: GetDashboardStatsDto): Promise<AgentDashboardStatsDto> {
    const { startDate, endDate, propertyId, towerId, flatId } = query;

    const baseQuery = this.leadsRepository
      .createQueryBuilder('lead')
      .where('lead.assignedTo = :agentId', { agentId })
      .andWhere('lead.isActive = true');

    if (propertyId) baseQuery.andWhere('lead.propertyId = :propertyId', { propertyId });
    if (towerId) baseQuery.andWhere('lead.towerId = :towerId', { towerId });
    if (flatId) baseQuery.andWhere('lead.flatId = :flatId', { flatId });

    if (startDate) {
      baseQuery.andWhere('lead.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      baseQuery.andWhere('lead.createdAt <= :endDate', { endDate });
    }

    const leads = await baseQuery.getMany();

    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'NEW').length;
    const inProgress = leads.filter(l => ['CONTACTED', 'QUALIFIED', 'NEGOTIATION'].includes(l.status)).length;
    const converted = leads.filter(l => l.status === 'WON').length;
    const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

    // Get due follow-ups
    const dueFollowUps = leads.filter(l => 
      l.nextFollowUpDate && new Date(l.nextFollowUpDate) <= new Date()
    ).length;

    // Group by status
    const leadsByStatus = Object.entries(
      leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count }));

    // Group by source
    const leadsBySource = Object.entries(
      leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([source, count]) => ({ source, count }));

    return {
      totalLeads,
      newLeads,
      inProgress,
      converted,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dueFollowUps,
      scheduledTasks: 0, // Placeholder - would integrate with tasks system
      monthlyAchievement: {
        target: 10,
        achieved: converted,
        percentage: (converted / 10) * 100,
      },
      weeklyAchievement: {
        target: 3,
        achieved: Math.floor(converted / 4),
        percentage: (Math.floor(converted / 4) / 3) * 100,
      },
      leadsByStatus,
      leadsBySource,
    };
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminDashboardStats(query: GetDashboardStatsDto): Promise<AdminDashboardStatsDto> {
    const { startDate, endDate, propertyId, towerId, flatId } = query;

    const baseQuery = this.leadsRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assignedUser', 'assignedUser')
      .where('lead.isActive = true');

    if (propertyId) baseQuery.andWhere('lead.propertyId = :propertyId', { propertyId });
    if (towerId) baseQuery.andWhere('lead.towerId = :towerId', { towerId });
    if (flatId) baseQuery.andWhere('lead.flatId = :flatId', { flatId });

    if (startDate) {
      baseQuery.andWhere('lead.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      baseQuery.andWhere('lead.createdAt <= :endDate', { endDate });
    }

    const leads = await baseQuery.getMany();

    const totalLeads = leads.length;
    const converted = leads.filter(l => l.status === 'WON').length;
    const averageConversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

    // Get unique agents
    const uniqueAgents = new Set(leads.map(l => l.assignedTo).filter(Boolean));
    const totalAgents = uniqueAgents.size;

    // Group by status
    const leadsByStatus = Object.entries(
      leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count }));

    // Group by source
    const leadsBySource = Object.entries(
      leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([source, count]) => ({ source, count }));

    // Property-wise breakdown
    const propertyGroups = leads.reduce((acc, lead) => {
      const key = lead.propertyId || 'unassigned';
      if (!acc[key]) {
        acc[key] = { leads: 0, conversions: 0 };
      }
      acc[key].leads += 1;
      if (lead.status === 'WON') acc[key].conversions += 1;
      return acc;
    }, {} as Record<string, { leads: number; conversions: number }>);

    const propertyWiseBreakdown = Object.entries(propertyGroups).map(([propertyId, stats]) => ({
      propertyId,
      propertyName: propertyId,
      leads: stats.leads,
      conversions: stats.conversions,
      conversionRate: stats.leads > 0 ? (stats.conversions / stats.leads) * 100 : 0,
    }));

    // Top performers
    const agentStats = Array.from(uniqueAgents).map(agentId => {
      const agentLeads = leads.filter(l => l.assignedTo === agentId);
      const agentConversions = agentLeads.filter(l => l.status === 'WON').length;
      const agentConversionRate = agentLeads.length > 0 ? (agentConversions / agentLeads.length) * 100 : 0;
      
      const user = agentLeads[0]?.assignedUser;
      const agentName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown';
      
      return {
        agentId: agentId as string,
        agentName,
        totalLeads: agentLeads.length,
        conversions: agentConversions,
        conversionRate: Math.round(agentConversionRate * 100) / 100,
      };
    });

    const topPerformers = agentStats
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 5);

    return {
      totalLeads,
      totalAgents,
      averageConversionRate: Math.round(averageConversionRate * 100) / 100,
      totalRevenue: 0, // Placeholder - would integrate with bookings
      leadsByStatus,
      leadsBySource,
      propertyWiseBreakdown,
      topPerformers,
      recentActivity: [],
    };
  }

  /**
   * Get team dashboard statistics
   */
  async getTeamDashboardStats(gmId: string, query: GetDashboardStatsDto): Promise<TeamDashboardStatsDto> {
    // This would require a team structure in the database
    // For now, returning placeholder data
    const agentStats = await this.getAdminDashboardStats(query);

    return {
      teamLeads: agentStats.totalLeads,
      teamConversions: agentStats.topPerformers.reduce((sum, p) => sum + p.conversions, 0),
      teamConversionRate: agentStats.averageConversionRate,
      agentPerformance: agentStats.topPerformers.map(p => ({
        ...p,
        dueFollowUps: 0,
      })),
      propertyMetrics: [],
      taskOverview: {
        pending: 0,
        completed: 0,
        overdue: 0,
      },
    };
  }

  /**
   * Import leads from Excel data
   */
  async importLeads(importDto: ImportLeadsDto): Promise<ImportLeadsResultDto> {
    const { leads } = importDto;
    const result: ImportLeadsResultDto = {
      totalRows: leads.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdLeads: [],
    };

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i];
      try {
        // Check for duplicates
        const duplicate = await this.checkDuplicateLead({
          email: row.email,
          phone: row.phone,
        });

        if (duplicate.isDuplicate) {
          result.errorCount++;
          result.errors.push({
            row: i + 1,
            data: row,
            error: 'Duplicate lead found',
          });
          continue;
        }

        // Create lead
        const createDto: CreateLeadDto = {
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          email: row.email,
          source: row.source as any,
          status: (row.status as any) || 'NEW',
          notes: row.notes,
          propertyId: row.propertyId || importDto.propertyId,
          towerId: row.towerId || importDto.towerId,
          flatId: row.flatId || importDto.flatId,
        };

        const created = await this.create(createDto);
        result.successCount++;
        result.createdLeads.push(created.id);
      } catch (error) {
        result.errorCount++;
        result.errors.push({
          row: i + 1,
          data: row,
          error: error.message || 'Failed to create lead',
        });
      }
    }

    return result;
  }

  private isManager(user?: any): boolean {
    const roles: string[] = user?.roles?.map((r: any) => r.name) ?? [];
    return roles.some((r) =>
      ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r),
    );
  }
}
