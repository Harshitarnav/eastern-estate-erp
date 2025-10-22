import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from './payment.entity';
export declare enum InstallmentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    WAIVED = "WAIVED",
    PARTIAL = "PARTIAL"
}
export declare class PaymentInstallment {
    id: string;
    bookingId: string;
    booking: Booking;
    installmentNumber: number;
    dueDate: Date;
    amount: number;
    status: InstallmentStatus;
    paymentId: string;
    payment: Payment;
    paidDate: Date;
    paidAmount: number;
    lateFee: number;
    lateFeeWaived: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
