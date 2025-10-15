export declare enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ORDERED = "ORDERED",
    PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
    RECEIVED = "RECEIVED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    UNPAID = "UNPAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare enum PaymentTerms {
    IMMEDIATE = "IMMEDIATE",
    NET_7 = "NET_7",
    NET_15 = "NET_15",
    NET_30 = "NET_30",
    NET_60 = "NET_60",
    NET_90 = "NET_90",
    ADVANCE_50 = "ADVANCE_50",
    ADVANCE_100 = "ADVANCE_100"
}
export declare class PurchaseOrder {
    id: string;
    orderNumber: string;
    orderDate: Date;
    orderStatus: OrderStatus;
    supplierId: string;
    supplierName: string;
    supplierEmail: string;
    supplierPhone: string;
    supplierAddress: string;
    supplierGSTIN: string;
    items: {
        itemId: string;
        itemCode: string;
        itemName: string;
        category: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        discount: number;
        taxPercent: number;
        taxAmount: number;
        totalAmount: number;
    }[];
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    taxAmount: number;
    shippingCost: number;
    otherCharges: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentTerms: PaymentTerms;
    paidAmount: number;
    balanceAmount: number;
    paymentDueDate: Date;
    expectedDeliveryDate: Date;
    actualDeliveryDate: Date;
    deliveryAddress: string;
    deliveryContact: string;
    deliveryPhone: string;
    trackingNumber: string;
    courierService: string;
    requestedBy: string;
    requestedByName: string;
    approvedBy: string;
    approvedByName: string;
    approvedAt: Date;
    rejectedBy: string;
    rejectedByName: string;
    rejectedAt: Date;
    rejectionReason: string;
    receivedItems: {
        itemId: string;
        quantityOrdered: number;
        quantityReceived: number;
        receivedDate: string;
        receivedBy: string;
        condition: string;
        remarks?: string;
    }[];
    totalItemsOrdered: number;
    totalItemsReceived: number;
    attachments: string[];
    invoiceNumber: string;
    invoiceDate: Date;
    notes: string;
    termsAndConditions: string;
    tags: string[];
    projectReference: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
