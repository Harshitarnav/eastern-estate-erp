import { User } from '../../users/entities/user.entity';
export declare enum TargetPeriod {
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    HALF_YEARLY = "HALF_YEARLY",
    YEARLY = "YEARLY"
}
export declare enum TargetStatus {
    ACTIVE = "ACTIVE",
    ACHIEVED = "ACHIEVED",
    MISSED = "MISSED",
    IN_PROGRESS = "IN_PROGRESS"
}
export declare class SalesTarget {
    id: string;
    salesPersonId: string;
    salesPerson: User;
    targetPeriod: TargetPeriod;
    startDate: Date;
    endDate: Date;
    targetLeads: number;
    targetSiteVisits: number;
    targetConversions: number;
    targetBookings: number;
    targetRevenue: number;
    selfTargetBookings: number;
    selfTargetRevenue: number;
    selfTargetNotes: string;
    achievedLeads: number;
    achievedSiteVisits: number;
    achievedConversions: number;
    achievedBookings: number;
    achievedRevenue: number;
    leadsAchievementPct: number;
    siteVisitsAchievementPct: number;
    conversionsAchievementPct: number;
    bookingsAchievementPct: number;
    revenueAchievementPct: number;
    overallAchievementPct: number;
    baseIncentive: number;
    earnedIncentive: number;
    bonusIncentive: number;
    totalIncentive: number;
    incentivePaid: boolean;
    incentivePaidDate: Date;
    motivationalMessage: string;
    missedBy: number;
    status: TargetStatus;
    setBy: string;
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
}
