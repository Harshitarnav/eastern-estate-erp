export declare enum DocumentCategory {
    AGREEMENT = "AGREEMENT",
    KYC_AADHAR = "KYC_AADHAR",
    KYC_PAN = "KYC_PAN",
    KYC_PHOTO = "KYC_PHOTO",
    KYC_OTHER = "KYC_OTHER",
    BANK_DOCUMENT = "BANK_DOCUMENT",
    LOAN_DOCUMENT = "LOAN_DOCUMENT",
    PAYMENT_PROOF = "PAYMENT_PROOF",
    POSSESSION_LETTER = "POSSESSION_LETTER",
    NOC = "NOC",
    OTHER = "OTHER"
}
export declare enum DocumentEntityType {
    BOOKING = "BOOKING",
    CUSTOMER = "CUSTOMER",
    PAYMENT = "PAYMENT",
    EMPLOYEE = "EMPLOYEE",
    PROPERTY = "PROPERTY",
    TOWER = "TOWER",
    FLAT = "FLAT"
}
export declare class Document {
    id: string;
    name: string;
    category: DocumentCategory;
    entityType: DocumentEntityType;
    entityId: string;
    customerId: string | null;
    bookingId: string | null;
    fileUrl: string;
    fileName: string;
    mimeType: string | null;
    fileSize: number | null;
    notes: string | null;
    uploadedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
