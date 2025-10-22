import { InstallmentStatus } from '../entities/payment-installment.entity';
export declare class CreateInstallmentDto {
    bookingId: string;
    installmentNumber: number;
    dueDate: string | Date;
    amount: number;
    status?: InstallmentStatus;
    paymentId?: string;
    paidDate?: string | Date;
    paidAmount?: number;
    lateFee?: number;
    lateFeeWaived?: boolean;
    notes?: string;
}
export declare class CreateInstallmentScheduleDto {
    bookingId: string;
    numberOfInstallments: number;
    totalAmount: number;
    startDate: string | Date;
    intervalDays: number;
}
