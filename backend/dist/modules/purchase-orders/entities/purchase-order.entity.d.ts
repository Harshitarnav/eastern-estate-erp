import { Vendor } from '../../vendors/entities/vendor.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
export declare enum PurchaseOrderStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    ORDERED = "ORDERED",
    PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
    RECEIVED = "RECEIVED",
    CANCELLED = "CANCELLED"
}
export declare class PurchaseOrder {
    id: string;
    poNumber: string;
    poDate: Date;
    vendorId: string;
    vendor: Vendor;
    propertyId: string | null;
    property: Property;
    constructionProjectId: string | null;
    status: PurchaseOrderStatus;
    expectedDeliveryDate: Date | null;
    actualDeliveryDate: Date | null;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentTerms: string | null;
    advancePaid: number;
    balanceAmount: number;
    approvedBy: string | null;
    approver: User;
    approvedAt: Date | null;
    deliveryAddress: string | null;
    deliveryContact: string | null;
    deliveryPhone: string | null;
    notes: string | null;
    termsAndConditions: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    creator: User;
    updatedBy: string | null;
    updater: User;
}
