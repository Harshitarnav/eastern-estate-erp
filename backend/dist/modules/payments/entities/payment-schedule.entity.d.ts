import { Booking } from '../../bookings/entities/booking.entity';
export declare enum ScheduleStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    WAIVED = "WAIVED",
    PARTIAL = "PARTIAL"
}
export declare class PaymentSchedule {
    id: string;
    bookingId: string;
    booking: Booking;
    scheduleNumber: string;
    installmentNumber: number;
    totalInstallments: number;
    dueDate: Date;
    amount: number;
    description: string;
    milestone: string;
    status: ScheduleStatus;
    paidAmount: number;
    paidDate: Date;
    paymentId: string;
    isOverdue: boolean;
    overdueDays: number;
    penaltyAmount: number;
    isWaived: boolean;
    waiverReason: string;
    waivedDate: Date;
    waivedBy: string;
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
