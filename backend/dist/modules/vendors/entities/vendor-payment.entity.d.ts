import { Vendor } from './vendor.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
export declare enum PaymentMode {
    CASH = "CASH",
    CHEQUE = "CHEQUE",
    NEFT = "NEFT",
    RTGS = "RTGS",
    UPI = "UPI"
}
export declare class VendorPayment {
    id: string;
    vendorId: string;
    vendor: Vendor;
    purchaseOrderId: string;
    paymentDate: Date;
    amount: number;
    paymentMode: PaymentMode;
    transactionReference: string;
    notes: string;
    createdBy: string;
    creator: User;
    propertyId: string | null;
    property: Property;
    journalEntryId: string | null;
    createdAt: Date;
    updatedAt: Date;
    get isLinkedToPO(): boolean;
    get isRecent(): boolean;
    get isDigitalPayment(): boolean;
    get formattedPaymentMode(): string;
}
