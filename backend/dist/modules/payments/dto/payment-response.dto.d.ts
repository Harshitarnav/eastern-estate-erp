import { Payment } from '../entities/payment.entity';
export declare class PaymentResponseDto {
    id: string;
    paymentCode: string;
    bookingId: string;
    customerId: string;
    paymentType: string;
    paymentMethod: string;
    amount: number;
    paymentDate: string;
    bankName?: string;
    transactionReference?: string;
    chequeNumber?: string;
    chequeDate?: string;
    upiId?: string;
    status: string;
    receiptNumber?: string;
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
