import { Customer } from '../../customers/entities/customer.entity';
import { Flat } from '../../flats/entities/flat.entity';
import { Property } from '../../properties/entities/property.entity';
export declare enum BookingStatus {
    TOKEN_PAID = "TOKEN_PAID",
    AGREEMENT_PENDING = "AGREEMENT_PENDING",
    AGREEMENT_SIGNED = "AGREEMENT_SIGNED",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    TRANSFERRED = "TRANSFERRED",
    COMPLETED = "COMPLETED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PARTIAL = "PARTIAL",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare class Booking {
    id: string;
    bookingNumber: string;
    customerId: string;
    customer: Customer;
    flatId: string;
    flat: Flat;
    propertyId: string;
    property: Property;
    status: BookingStatus;
    bookingDate: Date;
    totalAmount: number;
    tokenAmount: number;
    paidAmount: number;
    balanceAmount: number;
    tokenPaymentMode: string;
    rtgsNumber: string;
    utrNumber: string;
    chequeNumber: string;
    chequeDate: Date;
    paymentBank: string;
    paymentBranch: string;
    agreementNumber: string;
    agreementDate: Date;
    agreementSignedDate: Date;
    agreementDocumentUrl: string;
    expectedPossessionDate: Date;
    actualPossessionDate: Date;
    registrationDate: Date;
    discountAmount: number;
    discountReason: string;
    stampDuty: number;
    registrationCharges: number;
    gstAmount: number;
    maintenanceDeposit: number;
    parkingCharges: number;
    otherCharges: number;
    isHomeLoan: boolean;
    bankName: string;
    loanAmount: number;
    loanApplicationNumber: string;
    loanApprovalDate: Date;
    loanDisbursementDate: Date;
    nominee1Name: string;
    nominee1Relation: string;
    nominee2Name: string;
    nominee2Relation: string;
    coApplicantName: string;
    coApplicantEmail: string;
    coApplicantPhone: string;
    coApplicantRelation: string;
    cancellationDate: Date;
    cancellationReason: string;
    refundAmount: number;
    refundDate: Date;
    documents: string[];
    paymentPlan: string;
    towerId: string;
    notes: string;
    specialTerms: string;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
