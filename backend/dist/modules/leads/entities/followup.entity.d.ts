import { Lead } from './lead.entity';
import { User } from '../../users/entities/user.entity';
export declare enum FollowUpType {
    CALL = "CALL",
    EMAIL = "EMAIL",
    MEETING = "MEETING",
    WHATSAPP = "WHATSAPP",
    SMS = "SMS",
    SITE_VISIT = "SITE_VISIT",
    VIDEO_CALL = "VIDEO_CALL"
}
export declare enum FollowUpOutcome {
    INTERESTED = "INTERESTED",
    NOT_INTERESTED = "NOT_INTERESTED",
    CALLBACK_REQUESTED = "CALLBACK_REQUESTED",
    SITE_VISIT_SCHEDULED = "SITE_VISIT_SCHEDULED",
    DOCUMENTATION_REQUESTED = "DOCUMENTATION_REQUESTED",
    PRICE_NEGOTIATION = "PRICE_NEGOTIATION",
    NEEDS_TIME = "NEEDS_TIME",
    NOT_REACHABLE = "NOT_REACHABLE",
    WRONG_NUMBER = "WRONG_NUMBER",
    CONVERTED = "CONVERTED",
    LOST = "LOST"
}
export declare class FollowUp {
    id: string;
    leadId: string;
    lead: Lead;
    followUpDate: Date;
    followUpType: FollowUpType;
    durationMinutes: number;
    performedBy: string;
    performedByUser: User;
    outcome: FollowUpOutcome;
    feedback: string;
    customerResponse: string;
    actionsTaken: string;
    leadStatusBefore: string;
    leadStatusAfter: string;
    nextFollowUpDate: Date;
    nextFollowUpPlan: string;
    isSiteVisit: boolean;
    siteVisitProperty: string;
    siteVisitRating: number;
    siteVisitFeedback: string;
    interestLevel: number;
    budgetFit: number;
    timelineFit: number;
    reminderSent: boolean;
    reminderSentAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
