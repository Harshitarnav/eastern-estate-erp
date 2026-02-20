import { Flat } from '../../flats/entities/flat.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { PaymentPlanTemplate } from './payment-plan-template.entity';
import { User } from '../../users/entities/user.entity';
export declare enum FlatPaymentPlanStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface FlatPaymentMilestone {
    sequence: number;
    name: string;
    constructionPhase: 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER' | null;
    phasePercentage: number | null;
    amount: number;
    dueDate: string | null;
    status: 'PENDING' | 'TRIGGERED' | 'PAID' | 'OVERDUE';
    paymentScheduleId: string | null;
    constructionCheckpointId: string | null;
    demandDraftId: string | null;
    paymentId: string | null;
    completedAt: string | null;
    description: string;
}
export declare class FlatPaymentPlan {
    id: string;
    flatId: string;
    flat: Flat;
    bookingId: string;
    booking: Booking;
    customerId: string;
    customer: Customer;
    paymentPlanTemplateId: string;
    paymentPlanTemplate: PaymentPlanTemplate;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    milestones: FlatPaymentMilestone[];
    status: FlatPaymentPlanStatus;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    creator: User;
    updatedBy: string;
    updater: User;
}
