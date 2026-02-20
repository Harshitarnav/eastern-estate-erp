import { PaymentPlanType, PaymentMilestone } from '../entities/payment-plan-template.entity';
export declare class PaymentMilestoneDto implements PaymentMilestone {
    sequence: number;
    name: string;
    constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
    phasePercentage: number | null;
    paymentPercentage: number;
    description: string;
}
export declare class CreatePaymentPlanTemplateDto {
    name: string;
    type: PaymentPlanType;
    description?: string;
    milestones: PaymentMilestoneDto[];
    isActive?: boolean;
    isDefault?: boolean;
}
