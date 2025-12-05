"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("./entities/lead.entity");
const user_entity_1 = require("../users/entities/user.entity");
const dto_1 = require("./dto");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let LeadsService = class LeadsService {
    constructor(leadsRepository, notificationsService) {
        this.leadsRepository = leadsRepository;
        this.notificationsService = notificationsService;
    }
    async generateLeadCode() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        const count = await this.leadsRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
            },
        });
        const sequence = (count + 1).toString().padStart(4, '0');
        return `LD${year}${month}${sequence}`;
    }
    async create(createLeadDto) {
        const existing = await this.leadsRepository.findOne({
            where: [
                { email: createLeadDto.email },
                { phoneNumber: createLeadDto.phone },
            ],
        });
        if (existing) {
            throw new common_1.ConflictException('Lead with this email or phone already exists');
        }
        const leadCode = await this.generateLeadCode();
        const { firstName, lastName, phone, ...rest } = createLeadDto;
        const fullName = `${firstName} ${lastName}`.trim();
        const lead = this.leadsRepository.create({
            ...rest,
            leadCode,
            fullName,
            phoneNumber: phone,
        });
        const savedLead = await this.leadsRepository.save(lead);
        return dto_1.LeadResponseDto.fromEntity(savedLead);
    }
    async findAll(query, user) {
        const { search, status, source, priority, assignedTo, propertyId, towerId, flatId, isQualified, needsHomeLoan, hasSiteVisit, minBudget, maxBudget, createdFrom, createdTo, followUpDue, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '"assignedUser"."id"::text = "lead"."assigned_to"');
        if (search) {
            queryBuilder.andWhere('(lead.fullName ILIKE :search OR lead.email ILIKE :search OR lead.phoneNumber ILIKE :search)', { search: `%${search}%` });
        }
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
        const effectiveAssignedTo = this.isManager(user) && assignedTo ? assignedTo : !this.isManager(user) && user?.id ? user.id : undefined;
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
        queryBuilder.orderBy(`lead.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const leads = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.LeadResponseDto.fromEntities(leads),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const lead = await this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '"assignedUser"."id"::text = "lead"."assigned_to"')
            .where('lead.id = :id', { id })
            .getOne();
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return dto_1.LeadResponseDto.fromEntity(lead);
    }
    async update(id, updateLeadDto) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        if (updateLeadDto.email || updateLeadDto.phone) {
            const existing = await this.leadsRepository.findOne({
                where: [
                    { email: updateLeadDto.email || lead.email },
                    { phoneNumber: updateLeadDto.phone || lead.phoneNumber },
                ],
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Lead with this email or phone already exists');
            }
        }
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
        return dto_1.LeadResponseDto.fromEntity(updatedLead);
    }
    async remove(id) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        lead.isActive = false;
        await this.leadsRepository.save(lead);
    }
    async assignLead(id, userId, assignedBy) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
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
        return dto_1.LeadResponseDto.fromEntity(updatedLead);
    }
    async updateStatus(id, status, notes) {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        lead.status = status;
        if (notes) {
            lead.followUpNotes = lead.followUpNotes ? `${lead.followUpNotes}\n${notes}` : notes;
        }
        const updatedLead = await this.leadsRepository.save(lead);
        return dto_1.LeadResponseDto.fromEntity(updatedLead);
    }
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
    async getMyLeads(userId) {
        const leads = await this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '\"assignedUser\".\"id\"::text = \"lead\".\"assigned_to\"')
            .where('lead.assignedTo = :userId', { userId })
            .andWhere('lead.isActive = true')
            .orderBy('lead.createdAt', 'DESC')
            .getMany();
        return dto_1.LeadResponseDto.fromEntities(leads);
    }
    async getDueFollowUps(userId) {
        const queryBuilder = this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndMapOne('lead.assignedUser', user_entity_1.User, 'assignedUser', '\"assignedUser\".\"id\"::text = \"lead\".\"assigned_to\"')
            .where('lead.nextFollowUpDate <= :today', { today: new Date() })
            .andWhere('lead.isActive = true');
        if (userId) {
            queryBuilder.andWhere('lead.assignedTo = :userId', { userId });
        }
        const leads = await queryBuilder.getMany();
        return dto_1.LeadResponseDto.fromEntities(leads);
    }
    async bulkAssignLeads(bulkAssignDto) {
        const { leadIds, assignedTo } = bulkAssignDto;
        const leads = await this.leadsRepository.find({
            where: { id: (0, typeorm_2.In)(leadIds) },
        });
        if (leads.length !== leadIds.length) {
            throw new common_1.NotFoundException('Some leads not found');
        }
        await this.leadsRepository.update({ id: (0, typeorm_2.In)(leadIds) }, { assignedTo, assignedAt: new Date() });
        await this.notificationsService.create({
            userId: assignedTo,
            type: notification_entity_1.NotificationType.INFO,
            category: notification_entity_1.NotificationCategory.LEAD,
            title: 'New Leads Assigned',
            message: `You have been assigned ${leadIds.length} new lead(s)`,
            metadata: { leadIds },
        });
        return { assigned: leadIds.length };
    }
    async checkDuplicateLead(checkDto) {
        const { email, phone } = checkDto;
        if (!email && !phone) {
            throw new common_1.BadRequestException('Either email or phone must be provided');
        }
        const conditions = [];
        if (phone)
            conditions.push({ phoneNumber: phone });
        if (email)
            conditions.push({ email });
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
    async getAgentDashboardStats(agentId, query) {
        const { startDate, endDate, propertyId, towerId, flatId } = query;
        const baseQuery = this.leadsRepository
            .createQueryBuilder('lead')
            .where('lead.assignedTo = :agentId', { agentId })
            .andWhere('lead.isActive = true');
        if (propertyId)
            baseQuery.andWhere('lead.propertyId = :propertyId', { propertyId });
        if (towerId)
            baseQuery.andWhere('lead.towerId = :towerId', { towerId });
        if (flatId)
            baseQuery.andWhere('lead.flatId = :flatId', { flatId });
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
        const dueFollowUps = leads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) <= new Date()).length;
        const leadsByStatus = Object.entries(leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {})).map(([status, count]) => ({ status, count }));
        const leadsBySource = Object.entries(leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {})).map(([source, count]) => ({ source, count }));
        return {
            totalLeads,
            newLeads,
            inProgress,
            converted,
            conversionRate: Math.round(conversionRate * 100) / 100,
            dueFollowUps,
            scheduledTasks: 0,
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
    async getAdminDashboardStats(query) {
        const { startDate, endDate, propertyId, towerId, flatId } = query;
        const baseQuery = this.leadsRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.assignedUser', 'assignedUser')
            .where('lead.isActive = true');
        if (propertyId)
            baseQuery.andWhere('lead.propertyId = :propertyId', { propertyId });
        if (towerId)
            baseQuery.andWhere('lead.towerId = :towerId', { towerId });
        if (flatId)
            baseQuery.andWhere('lead.flatId = :flatId', { flatId });
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
        const uniqueAgents = new Set(leads.map(l => l.assignedTo).filter(Boolean));
        const totalAgents = uniqueAgents.size;
        const leadsByStatus = Object.entries(leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {})).map(([status, count]) => ({ status, count }));
        const leadsBySource = Object.entries(leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {})).map(([source, count]) => ({ source, count }));
        const propertyGroups = leads.reduce((acc, lead) => {
            const key = lead.propertyId || 'unassigned';
            if (!acc[key]) {
                acc[key] = { leads: 0, conversions: 0 };
            }
            acc[key].leads += 1;
            if (lead.status === 'WON')
                acc[key].conversions += 1;
            return acc;
        }, {});
        const propertyWiseBreakdown = Object.entries(propertyGroups).map(([propertyId, stats]) => ({
            propertyId,
            propertyName: propertyId,
            leads: stats.leads,
            conversions: stats.conversions,
            conversionRate: stats.leads > 0 ? (stats.conversions / stats.leads) * 100 : 0,
        }));
        const agentStats = Array.from(uniqueAgents).map(agentId => {
            const agentLeads = leads.filter(l => l.assignedTo === agentId);
            const agentConversions = agentLeads.filter(l => l.status === 'WON').length;
            const agentConversionRate = agentLeads.length > 0 ? (agentConversions / agentLeads.length) * 100 : 0;
            const user = agentLeads[0]?.assignedUser;
            const agentName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown';
            return {
                agentId: agentId,
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
            totalRevenue: 0,
            leadsByStatus,
            leadsBySource,
            propertyWiseBreakdown,
            topPerformers,
            recentActivity: [],
        };
    }
    async getTeamDashboardStats(gmId, query) {
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
    async importLeads(importDto) {
        const { leads } = importDto;
        const result = {
            totalRows: leads.length,
            successCount: 0,
            errorCount: 0,
            errors: [],
            createdLeads: [],
        };
        for (let i = 0; i < leads.length; i++) {
            const row = leads[i];
            try {
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
                const createDto = {
                    firstName: row.firstName,
                    lastName: row.lastName,
                    phone: row.phone,
                    email: row.email,
                    source: row.source,
                    status: row.status || 'NEW',
                    notes: row.notes,
                    propertyId: row.propertyId || importDto.propertyId,
                    towerId: row.towerId || importDto.towerId,
                    flatId: row.flatId || importDto.flatId,
                };
                const created = await this.create(createDto);
                result.successCount++;
                result.createdLeads.push(created.id);
            }
            catch (error) {
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
    isManager(user) {
        const roles = user?.roles?.map((r) => r.name) ?? [];
        return roles.some((r) => ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r));
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map