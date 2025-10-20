import { FollowUpService } from './followup.service';
import { CreateFollowUpDto } from './dto/create-followup.dto';
export declare class FollowUpController {
    private readonly followUpService;
    constructor(followUpService: FollowUpService);
    create(createFollowUpDto: CreateFollowUpDto): Promise<import("./entities/followup.entity").FollowUp>;
    findByLead(leadId: string): Promise<import("./entities/followup.entity").FollowUp[]>;
    findBySalesPerson(salesPersonId: string, startDate?: string, endDate?: string): Promise<import("./entities/followup.entity").FollowUp[]>;
    getUpcomingFollowUps(salesPersonId: string): Promise<import("./entities/followup.entity").FollowUp[]>;
    getStatistics(salesPersonId: string, startDate: string, endDate: string): Promise<any>;
    getSiteVisitStatistics(salesPersonId: string, startDate: string, endDate: string): Promise<any>;
    findOne(id: string): Promise<import("./entities/followup.entity").FollowUp>;
    update(id: string, updateData: Partial<CreateFollowUpDto>): Promise<import("./entities/followup.entity").FollowUp>;
    markReminderSent(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}
