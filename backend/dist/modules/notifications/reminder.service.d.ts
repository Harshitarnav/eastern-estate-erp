import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { SalesTask } from '../leads/entities/sales-task.entity';
import { EmailService } from './email.service';
export declare class ReminderService {
    private leadRepository;
    private salesTaskRepository;
    private emailService;
    private readonly logger;
    constructor(leadRepository: Repository<Lead>, salesTaskRepository: Repository<SalesTask>, emailService: EmailService);
    sendFollowUpReminders(): Promise<void>;
    sendTaskReminders(): Promise<void>;
    sendSiteVisitReminders(): Promise<void>;
    resetReminderFlags(): Promise<void>;
    private sendFollowUpReminderEmail;
    private sendTaskReminderEmail;
    private sendSiteVisitConfirmationEmail;
    sendManualReminder(leadId: string, type: 'followup' | 'sitevisit'): Promise<void>;
}
