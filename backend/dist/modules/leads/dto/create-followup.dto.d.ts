import { FollowUpType, FollowUpOutcome } from '../entities/followup.entity';
export declare class CreateFollowUpDto {
    leadId: string;
    followUpDate: Date;
    followUpType: FollowUpType;
    durationMinutes?: number;
    performedBy: string;
    outcome: FollowUpOutcome;
    feedback: string;
    customerResponse?: string;
    actionsTaken?: string;
    leadStatusBefore?: string;
    leadStatusAfter?: string;
    nextFollowUpDate?: Date;
    nextFollowUpPlan?: string;
    isSiteVisit?: boolean;
    siteVisitProperty?: string;
    siteVisitRating?: number;
    siteVisitFeedback?: string;
    interestLevel?: number;
    budgetFit?: number;
    timelineFit?: number;
}
