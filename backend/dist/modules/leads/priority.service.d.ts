import { Lead } from './entities/lead.entity';
export interface PriorityScore {
    score: number;
    urgency: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    reasons: string[];
    color: string;
    emoji: string;
}
export interface PrioritizedTask {
    id: string;
    type: 'FOLLOW_UP' | 'FIRST_CONTACT' | 'SITE_VISIT' | 'CALLBACK';
    lead: Lead;
    dueDate: Date;
    priority: PriorityScore;
    action: string;
    quickActions: Array<{
        label: string;
        icon: string;
        action: string;
    }>;
}
export declare class PriorityService {
    calculateLeadPriority(lead: Lead, now?: Date): PriorityScore;
    prioritizeLeads(leads: Lead[]): Lead[];
    getTodaysPrioritizedTasks(leads: Lead[]): Promise<PrioritizedTask[]>;
    getMotivationalMessage(stats: {
        achievementPercentage: number;
        daysRemaining: number;
        missedBy: number;
    }): string;
    getSmartTips(leads: Lead[]): string[];
}
