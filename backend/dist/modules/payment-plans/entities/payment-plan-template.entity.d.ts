import { User } from '../../users/entities/user.entity';
export declare enum PaymentPlanType {
    CONSTRUCTION_LINKED = "CONSTRUCTION_LINKED",
    TIME_LINKED = "TIME_LINKED",
    DOWN_PAYMENT = "DOWN_PAYMENT"
}
export interface PaymentMilestone {
    sequence: number;
    name: string;
    constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
    phasePercentage: number | null;
    paymentPercentage: number;
    description: string;
}
export declare class PaymentPlanTemplate {
    id: string;
    name: string;
    type: PaymentPlanType;
    description: string;
    milestones: PaymentMilestone[];
    totalPercentage: number;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    creator: User;
    updatedBy: string;
    updater: User;
}
