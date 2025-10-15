import { Booking } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
export declare enum PaymentType {
    TOKEN = "TOKEN",
    AGREEMENT = "AGREEMENT",
    INSTALLMENT = "INSTALLMENT",
    FINAL = "FINAL",
    ADVANCE = "ADVANCE",
    REFUND = "REFUND",
    OTHER = "OTHER"
}
export declare enum PaymentMode {
    CASH = "CASH",
    CHEQUE = "CHEQUE",
    BANK_TRANSFER = "BANK_TRANSFER",
    UPI = "UPI",
    CARD = "CARD",
    RTGS = "RTGS",
    NEFT = "NEFT",
    IMPS = "IMPS",
    DD = "DD",
    ONLINE = "ONLINE"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    CLEARED = "CLEARED",
    BOUNCED = "BOUNCED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare class Payment {
    id: string;
    paymentNumber: string;
    receiptNumber: string;
    bookingId: string;
    booking: Booking;
    customerId: string;
    customer: Customer;
    paymentType: PaymentType;
    amount: number;
    paymentDate: Date;
    paymentMode: PaymentMode;
    status: PaymentStatus;
    bankName: string;
    branchName: string;
    chequeNumber: string;
    chequeDate: Date;
    transactionId: string;
    clearanceDate: Date;
    upiId: string;
    onlinePaymentId: string;
    installmentNumber: number;
    dueDate: Date;
    lateFee: number;
    tdsAmount: number;
    tdsPercentage: number;
    gstAmount: number;
    gstPercentage: number;
    netAmount: number;
    receiptUrl: string;
    receiptGenerated: boolean;
    receiptDate: Date;
    isVerified: boolean;
    verifiedBy: string;
    verifiedAt: Date;
    bouncedDate: Date;
    bounceReason: string;
    cancellationDate: Date;
    cancellationReason: string;
    isRefund: boolean;
    refundForPaymentId: string;
    refundDate: Date;
    documents: string[];
    notes: string;
    internalNotes: string;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    receivedBy: string;
}
