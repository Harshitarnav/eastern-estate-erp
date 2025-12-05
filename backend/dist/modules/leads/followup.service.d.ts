import { Repository } from 'typeorm';
import { FollowUp } from './entities/followup.entity';
import { Lead } from './entities/lead.entity';
import { CreateFollowUpDto } from './dto/create-followup.dto';
export declare class FollowUpService {
    private followUpRepository;
    private leadRepository;
    private readonly logger;
    constructor(followUpRepository: Repository<FollowUp>, leadRepository: Repository<Lead>);
    private ensureDate;
    create(createFollowUpDto: CreateFollowUpDto, user?: any): Promise<FollowUp>;
    private updateLeadAfterFollowUp;
    findByLead(leadId: string, user?: any): Promise<FollowUp[]>;
    findBySalesPerson(salesPersonId: string, startDate?: Date, endDate?: Date, user?: any): Promise<FollowUp[]>;
    getUpcomingFollowUps(salesPersonId: string, user?: any): Promise<FollowUp[]>;
    getFollowUpsNeedingReminders(): Promise<FollowUp[]>;
    markReminderSent(followUpId: string, user?: any): Promise<void>;
    getStatistics(salesPersonId: string, startDate: Date, endDate: Date, user?: any): Promise<any>;
    getSiteVisitStatistics(salesPersonId: string, startDate: Date, endDate: Date, user?: any): Promise<any>;
    private calculateAverage;
    private groupByProperty;
    private calculateConversionRate;
    findOne(id: string, user?: any): Promise<FollowUp>;
    update(id: string, updateData: Partial<CreateFollowUpDto>, user?: any): Promise<FollowUp>;
    remove(id: string, user?: any): Promise<void>;
    private isManager;
}
