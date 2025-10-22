import { RefundStatus } from '../entities/payment-refund.entity';
export declare class CreateRefundDto {
    paymentId: string;
    refundAmount: number;
    refundReason: string;
    refundDate: string | Date;
    refundMethod: string;
    status?: RefundStatus;
    bankDetails?: string;
    transactionReference?: string;
}
export declare class ApproveRefundDto {
    approvalNotes?: string;
}
export declare class ProcessRefundDto {
    transactionReference: string;
    processingNotes?: string;
}
