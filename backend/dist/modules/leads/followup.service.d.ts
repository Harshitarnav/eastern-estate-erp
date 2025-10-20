import { Repository } from 'typeorm';
import { FollowUp } from './entities/followup.entity';
import { Lead } from './entities/lead.entity';
import { CreateFollowUpDto } from './dto/create-followup.dto';
export declare class FollowUpService {
    private followUpRepository;
    private leadRepository;
    private readonly logger;
    constructor(followUpRepository: Repository<FollowUp>, leadRepository: Repository<Lead>);
    create(createFollowUpDto: CreateFollowUpDto): Promise<FollowUp>;
    private updateLeadAfterFollowUp;
    findByLead(leadId: string): Promise<FollowUp[]>;
    findBySalesPerson(salesPersonId: string, startDate?: Date, endDate?: Date): Promise<FollowUp[]>;
    getUpcomingFollowUps(salesPersonId: string): Promise<FollowUp[]>;
    getFollowUpsNeedingReminders(): Promise<FollowUp[]>;
    markReminderSent(followUpId: string): Promise<void>;
    getStatistics(salesPersonId: string, startDate: Date, endDate: Date): Promise<any>;
    getSiteVisitStatistics(salesPersonId: string, startDate: Date, endDate: Date): Promise<any>;
    private calculateAverage;
    private groupByProperty;
    private calculateConversionRate;
    findOne(id: string): Promise<FollowUp>;
    update(id: string, updateData: Partial<CreateFollowUpDto>): Promise<FollowUp>;
    remove(id: string): Promise<void>;
}
