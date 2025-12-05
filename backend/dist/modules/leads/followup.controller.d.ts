import { FollowUpService } from './followup.service';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { Request } from 'express';
export declare class FollowUpController {
    private readonly followUpService;
    constructor(followUpService: FollowUpService);
    create(createFollowUpDto: CreateFollowUpDto, req: Request): Promise<import("./entities/followup.entity").FollowUp>;
    findByLead(leadId: string, req: Request): Promise<import("./entities/followup.entity").FollowUp[]>;
    findBySalesPerson(salesPersonId: string, startDate?: string, endDate?: string, req?: Request): Promise<import("./entities/followup.entity").FollowUp[]>;
    getUpcomingFollowUps(salesPersonId: string, req: Request): Promise<import("./entities/followup.entity").FollowUp[]>;
    getStatistics(salesPersonId: string, startDate: string, endDate: string, req: Request): Promise<any>;
    getSiteVisitStatistics(salesPersonId: string, startDate: string, endDate: string, req: Request): Promise<any>;
    findOne(id: string, req: Request): Promise<import("./entities/followup.entity").FollowUp>;
    update(id: string, updateData: Partial<CreateFollowUpDto>, req: Request): Promise<import("./entities/followup.entity").FollowUp>;
    markReminderSent(id: string, req: Request): Promise<void>;
    remove(id: string, req: Request): Promise<void>;
    private isManager;
    private getEffectiveUserId;
}
