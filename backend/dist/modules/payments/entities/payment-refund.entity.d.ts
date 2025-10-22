import { Payment } from './payment.entity';
import { User } from '../../users/entities/user.entity';
export declare enum RefundStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PROCESSED = "PROCESSED",
    REJECTED = "REJECTED"
}
export declare class PaymentRefund {
    id: string;
    paymentId: string;
    payment: Payment;
    refundAmount: number;
    refundReason: string;
    refundDate: Date;
    refundMethod: string;
    status: RefundStatus;
    approvedBy: string;
    approver: User;
    approvedAt: Date;
    processedBy: string;
    processor: User;
    processedAt: Date;
    bankDetails: string;
    transactionReference: string;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
