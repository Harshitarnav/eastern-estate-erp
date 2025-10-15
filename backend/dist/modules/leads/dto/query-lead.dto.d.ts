import { LeadStatus, LeadSource, LeadPriority } from '../entities/lead.entity';
export declare class QueryLeadDto {
    search?: string;
    status?: LeadStatus;
    source?: LeadSource;
    priority?: LeadPriority;
    propertyId?: string;
    assignedTo?: string;
    isQualified?: boolean;
    needsHomeLoan?: boolean;
    hasSiteVisit?: boolean;
    minBudget?: number;
    maxBudget?: number;
    createdFrom?: string;
    createdTo?: string;
    followUpDue?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
