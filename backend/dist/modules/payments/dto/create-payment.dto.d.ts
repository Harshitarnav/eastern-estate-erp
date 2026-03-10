export declare class CreatePaymentDto {
    paymentCode?: string;
    bookingId?: string;
    customerId?: string;
    employeeId?: string;
    vendorId?: string;
    paymentType: string;
    paymentMethod?: string;
    paymentCategory?: string;
    amount: number;
    paymentDate: Date;
    bankName?: string;
    accountNumber?: string;
    transactionReference?: string;
    chequeNumber?: string;
    chequeDate?: Date;
    upiId?: string;
    status?: string;
    receiptNumber?: string;
    receiptUrl?: string;
    notes?: string;
    remarks?: string;
}
