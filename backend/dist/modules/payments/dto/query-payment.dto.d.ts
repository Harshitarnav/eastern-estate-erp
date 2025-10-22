import { PaymentType, PaymentMethod, PaymentStatus } from '../entities/payment.entity';
export declare class QueryPaymentDto {
    search?: string;
    paymentType?: PaymentType;
    paymentMode?: PaymentMethod;
    status?: PaymentStatus;
    bookingId?: string;
    customerId?: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
    isVerified?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
