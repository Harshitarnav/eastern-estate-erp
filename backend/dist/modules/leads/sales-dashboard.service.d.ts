import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { FollowUp } from './entities/followup.entity';
import { SalesTask } from './entities/sales-task.entity';
import { SalesTarget } from '../employees/entities/sales-target.entity';
import { Booking } from '../bookings/entities/booking.entity';
export interface DashboardFilter {
    salesPersonId: string;
    propertyId?: string;
    towerId?: string;
    flatId?: string;
    dateFrom?: string;
    dateTo?: string;
}
export interface DashboardMetrics {
    performance: {
        currentTarget: any;
        achievementPercentage: number;
        motivationalMessage: string;
        missedBy: number;
        daysRemaining: number;
    };
    leads: {
        total: number;
        new: number;
        active: number;
        hot: number;
        warm: number;
        cold: number;
        converted: number;
        bySource: Record<string, number>;
        conversionRate: number;
    };
    siteVisits: {
        pendingThisWeek: number;
        completedThisMonth: number;
        scheduledUpcoming: number;
        avgRating: number;
    };
    followups: {
        dueToday: number;
        dueThisWeek: number;
        overdue: number;
        completedThisMonth: number;
        avgResponseTime: number;
    };
    tasks: {
        dueToday: number;
        dueThisWeek: number;
        overdue: number;
        completedToday: number;
        completionRate: number;
    };
    revenue: {
        thisMonth: number;
        thisQuarter: number;
        avgDealSize: number;
        projectedMonthEnd: number;
    };
    recentActivities: any[];
    upcomingEvents: {
        followups: any[];
        tasks: any[];
        siteVisits: any[];
        meetings: any[];
    };
}
export declare class SalesDashboardService {
    private leadRepository;
    private followUpRepository;
    private salesTaskRepository;
    private salesTargetRepository;
    private bookingRepository;
    private readonly logger;
    constructor(leadRepository: Repository<Lead>, followUpRepository: Repository<FollowUp>, salesTaskRepository: Repository<SalesTask>, salesTargetRepository: Repository<SalesTarget>, bookingRepository: Repository<Booking>);
    private buildDateRange;
    private buildLeadWhere;
    getDashboardMetrics(filter: DashboardFilter): Promise<DashboardMetrics>;
    private getCurrentTarget;
    private buildPerformanceMetrics;
    private getLeadMetrics;
    private getSiteVisitMetrics;
    private getFollowUpMetrics;
    private getTaskMetrics;
    private getRevenueMetrics;
    private getRecentActivities;
    private getUpcomingEvents;
}
