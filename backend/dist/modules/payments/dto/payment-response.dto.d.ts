import { Payment } from '../entities/payment.entity';
export declare class PaymentResponseDto {
    id: string;
    paymentNumber: string;
    receiptNumber?: string;
    bookingId: string;
    customerId: string;
    paymentType: string;
    amount: number;
    paymentDate: string;
    paymentMode: string;
    status: string;
    bankName?: string;
    branchName?: string;
    chequeNumber?: string;
    chequeDate?: string;
    transactionId?: string;
    clearanceDate?: string;
    upiId?: string;
    onlinePaymentId?: string;
    installmentNumber?: number;
    dueDate?: string;
    lateFee?: number;
    tdsAmount: number;
    tdsPercentage: number;
    gstAmount: number;
    gstPercentage: number;
    netAmount: number;
    receiptUrl?: string;
    receiptGenerated: boolean;
    receiptDate?: string;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    documents?: string[];
    notes?: string;
    internalNotes?: string;
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    booking?: any;
    customer?: any;
    static fromEntity(payment: Payment): PaymentResponseDto;
    static fromEntities(payments: Payment[]): PaymentResponseDto[];
}
export interface PaginatedPaymentsResponse {
    data: PaymentResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
