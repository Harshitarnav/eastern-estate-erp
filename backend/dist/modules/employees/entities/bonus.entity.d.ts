import { Employee } from './employee.entity';
export declare enum BonusType {
    PERFORMANCE = "PERFORMANCE",
    FESTIVAL = "FESTIVAL",
    ANNUAL = "ANNUAL",
    PROJECT_COMPLETION = "PROJECT_COMPLETION",
    RETENTION = "RETENTION",
    REFERRAL = "REFERRAL",
    SPOT_AWARD = "SPOT_AWARD",
    SALES_INCENTIVE = "SALES_INCENTIVE",
    OTHER = "OTHER"
}
export declare enum BonusStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare class Bonus {
    id: string;
    employeeId: string;
    employee: Employee;
    bonusType: BonusType;
    bonusTitle: string;
    bonusDescription: string;
    bonusAmount: number;
    bonusDate: Date;
    paymentDate: Date;
    performanceRating: number;
    targetAmount: number;
    achievedAmount: number;
    achievementPercentage: number;
    bonusStatus: BonusStatus;
    approvedBy: string;
    approvedByName: string;
    approvedAt: Date;
    approvalRemarks: string;
    rejectedBy: string;
    rejectedAt: Date;
    rejectionReason: string;
    transactionReference: string;
    paymentMode: string;
    paymentRemarks: string;
    taxDeduction: number;
    netBonusAmount: number;
    notes: string;
    attachments: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
