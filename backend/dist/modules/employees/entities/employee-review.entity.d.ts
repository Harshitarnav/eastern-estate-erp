import { Employee } from './employee.entity';
export declare enum ReviewType {
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    HALF_YEARLY = "HALF_YEARLY",
    ANNUAL = "ANNUAL",
    PROBATION = "PROBATION",
    PROJECT_BASED = "PROJECT_BASED"
}
export declare enum ReviewStatus {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class EmployeeReview {
    id: string;
    employeeId: string;
    employee: Employee;
    reviewType: ReviewType;
    reviewTitle: string;
    reviewDate: Date;
    reviewPeriodStart: Date;
    reviewPeriodEnd: Date;
    reviewStatus: ReviewStatus;
    reviewerId: string;
    reviewerName: string;
    reviewerDesignation: string;
    technicalSkillsRating: number;
    communicationRating: number;
    teamworkRating: number;
    leadershipRating: number;
    problemSolvingRating: number;
    initiativeRating: number;
    punctualityRating: number;
    qualityOfWorkRating: number;
    productivityRating: number;
    attendanceRating: number;
    overallRating: number;
    achievements: string;
    strengths: string;
    areasOfImprovement: string;
    goals: string;
    trainingNeeds: string;
    developmentPlan: string;
    reviewerComments: string;
    employeeComments: string;
    targetAchievement: number;
    actualAchievement: number;
    kpiAchievementPercentage: number;
    recommendedForPromotion: boolean;
    recommendedForIncrement: boolean;
    recommendedIncrementPercentage: number;
    recommendedForBonus: boolean;
    recommendedBonusAmount: number;
    recommendedForTraining: boolean;
    trainingRecommendations: string;
    actionItems: string;
    nextReviewDate: Date;
    employeeAcknowledged: boolean;
    employeeAcknowledgedAt: Date;
    managerApproved: boolean;
    managerApprovedBy: string;
    managerApprovedAt: Date;
    attachments: string[];
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
