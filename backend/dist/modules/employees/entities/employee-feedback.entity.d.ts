import { Employee } from './employee.entity';
export declare enum FeedbackType {
    PEER_TO_PEER = "PEER_TO_PEER",
    MANAGER_TO_EMPLOYEE = "MANAGER_TO_EMPLOYEE",
    EMPLOYEE_TO_MANAGER = "EMPLOYEE_TO_MANAGER",
    SUBORDINATE_TO_MANAGER = "SUBORDINATE_TO_MANAGER",
    SELF_ASSESSMENT = "SELF_ASSESSMENT",
    CLIENT_FEEDBACK = "CLIENT_FEEDBACK",
    EXIT_FEEDBACK = "EXIT_FEEDBACK"
}
export declare enum FeedbackStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    REVIEWED = "REVIEWED",
    ACKNOWLEDGED = "ACKNOWLEDGED"
}
export declare class EmployeeFeedback {
    id: string;
    employeeId: string;
    employee: Employee;
    providerId: string;
    providerName: string;
    providerDesignation: string;
    providerRelationship: string;
    feedbackType: FeedbackType;
    feedbackTitle: string;
    feedbackDate: Date;
    feedbackStatus: FeedbackStatus;
    positiveAspects: string;
    areasForImprovement: string;
    specificExamples: string;
    recommendations: string;
    generalComments: string;
    technicalSkillsRating: number;
    communicationRating: number;
    teamworkRating: number;
    leadershipRating: number;
    problemSolvingRating: number;
    reliabilityRating: number;
    professionalismRating: number;
    overallRating: number;
    isAnonymous: boolean;
    employeeAcknowledged: boolean;
    employeeAcknowledgedAt: Date;
    employeeResponse: string;
    managerReviewed: boolean;
    managerReviewedBy: string;
    managerReviewedAt: Date;
    managerComments: string;
    attachments: string[];
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
