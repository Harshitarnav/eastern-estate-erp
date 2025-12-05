import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto, QueryLeadDto, LeadResponseDto, PaginatedLeadsResponse, BulkAssignLeadsDto, CheckDuplicateLeadDto, DuplicateLeadResponseDto, AgentDashboardStatsDto, AdminDashboardStatsDto, TeamDashboardStatsDto, GetDashboardStatsDto, ImportLeadsDto, ImportLeadsResultDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LeadsService {
    private leadsRepository;
    private notificationsService;
    constructor(leadsRepository: Repository<Lead>, notificationsService: NotificationsService);
    private generateLeadCode;
    create(createLeadDto: CreateLeadDto): Promise<LeadResponseDto>;
    findAll(query: QueryLeadDto, user?: any): Promise<PaginatedLeadsResponse>;
    findOne(id: string): Promise<LeadResponseDto>;
    update(id: string, updateLeadDto: UpdateLeadDto): Promise<LeadResponseDto>;
    remove(id: string): Promise<void>;
    assignLead(id: string, userId: string, assignedBy?: string): Promise<LeadResponseDto>;
    updateStatus(id: string, status: string, notes?: string): Promise<LeadResponseDto>;
    getStatistics(): Promise<{
        total: number;
        newLeads: number;
        contacted: number;
        qualified: number;
        won: number;
        lost: number;
        conversionRate: number;
    }>;
    getMyLeads(userId: string): Promise<LeadResponseDto[]>;
    getDueFollowUps(userId?: string): Promise<LeadResponseDto[]>;
    bulkAssignLeads(bulkAssignDto: BulkAssignLeadsDto): Promise<{
        assigned: number;
    }>;
    checkDuplicateLead(checkDto: CheckDuplicateLeadDto): Promise<DuplicateLeadResponseDto>;
    getAgentDashboardStats(agentId: string, query: GetDashboardStatsDto): Promise<AgentDashboardStatsDto>;
    getAdminDashboardStats(query: GetDashboardStatsDto): Promise<AdminDashboardStatsDto>;
    getTeamDashboardStats(gmId: string, query: GetDashboardStatsDto): Promise<TeamDashboardStatsDto>;
    importLeads(importDto: ImportLeadsDto): Promise<ImportLeadsResultDto>;
    private isManager;
}
