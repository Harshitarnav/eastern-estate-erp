import { BookingStatus, PaymentStatus } from '../entities/booking.entity';
export declare class QueryBookingDto {
    search?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
    flatId?: string;
    propertyId?: string;
    bookingDateFrom?: string;
    bookingDateTo?: string;
    isHomeLoan?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
