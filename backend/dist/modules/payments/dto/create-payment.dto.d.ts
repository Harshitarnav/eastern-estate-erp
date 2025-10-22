import { PaymentType, PaymentMethod, PaymentStatus } from '../entities/payment.entity';
export declare class CreatePaymentDto {
    paymentCode?: string;
    bookingId?: string;
    customerId?: string;
    employeeId?: string;
    vendorId?: string;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod;
    paymentCategory: string;
    amount: number;
    paymentDate: Date;
    bankName?: string;
    accountNumber?: string;
    transactionReference?: string;
    chequeNumber?: string;
    chequeDate?: Date;
    upiId?: string;
    status?: PaymentStatus;
    receiptNumber?: string;
    receiptUrl?: string;
    notes?: string;
    remarks?: string;
}
