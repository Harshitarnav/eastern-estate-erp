import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
export declare enum PaymentType {
    BOOKING = "BOOKING",
    SALARY = "SALARY",
    VENDOR = "VENDOR",
    EXPENSE = "EXPENSE",
    OTHER = "OTHER"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CHEQUE = "CHEQUE",
    BANK_TRANSFER = "BANK_TRANSFER",
    UPI = "UPI",
    CARD = "CARD",
    OTHER = "OTHER"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare class Payment {
    id: string;
    paymentCode: string;
    bookingId: string;
    booking: Booking;
    customerId: string;
    customer: Customer;
    paymentType: string;
    paymentMethod: string;
    amount: number;
    paymentDate: Date;
    bankName: string;
    transactionReference: string;
    chequeNumber: string;
    chequeDate: Date;
    upiId: string;
    status: string;
    receiptNumber: string;
}
