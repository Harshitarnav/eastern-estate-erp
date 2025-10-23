import { NotificationsService } from './notifications.service';
import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
export declare class SmartNotificationsService {
    private readonly notificationsService;
    private readonly leadsRepository;
    private readonly logger;
    constructor(notificationsService: NotificationsService, leadsRepository: Repository<Lead>);
    checkUpcomingFollowUps(): Promise<void>;
    checkColdLeads(): Promise<void>;
    checkOverdueFollowUps(): Promise<void>;
    notifyAchievement(userId: string, achievement: {
        name: string;
        description: string;
        icon: string;
        xp: number;
    }): Promise<void>;
    notifyMilestone(userId: string, milestone: string): Promise<void>;
}
