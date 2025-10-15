import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, QueryLeadDto, LeadResponseDto, PaginatedLeadsResponse } from './dto';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(createLeadDto: CreateLeadDto): Promise<LeadResponseDto>;
    findAll(query: QueryLeadDto): Promise<PaginatedLeadsResponse>;
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
    findOne(id: string): Promise<LeadResponseDto>;
    update(id: string, updateLeadDto: UpdateLeadDto): Promise<LeadResponseDto>;
    assignLead(id: string, userId: string): Promise<LeadResponseDto>;
    updateStatus(id: string, status: string, notes?: string): Promise<LeadResponseDto>;
    remove(id: string): Promise<void>;
}
