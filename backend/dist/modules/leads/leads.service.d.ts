import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto, QueryLeadDto, LeadResponseDto, PaginatedLeadsResponse } from './dto';
export declare class LeadsService {
    private leadsRepository;
    constructor(leadsRepository: Repository<Lead>);
    create(createLeadDto: CreateLeadDto): Promise<LeadResponseDto>;
    findAll(query: QueryLeadDto): Promise<PaginatedLeadsResponse>;
    findOne(id: string): Promise<LeadResponseDto>;
    update(id: string, updateLeadDto: UpdateLeadDto): Promise<LeadResponseDto>;
    remove(id: string): Promise<void>;
    assignLead(id: string, userId: string): Promise<LeadResponseDto>;
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
}
