export declare enum CustomerType {
    INDIVIDUAL = "INDIVIDUAL",
    CORPORATE = "CORPORATE",
    NRI = "NRI"
}
export declare enum KYCStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare enum CustomerRequirementType {
    END_USER = "END_USER",
    INVESTOR = "INVESTOR",
    BOTH = "BOTH"
}
export declare enum PropertyPreference {
    FLAT = "FLAT",
    DUPLEX = "DUPLEX",
    PENTHOUSE = "PENTHOUSE",
    VILLA = "VILLA",
    PLOT = "PLOT",
    COMMERCIAL = "COMMERCIAL",
    ANY = "ANY"
}
export declare class Customer {
    id: string;
    customerCode: string;
    fullName: string;
    get firstName(): string;
    get lastName(): string;
    get displayName(): string;
    email: string;
    phoneNumber: string;
    alternatePhone: string;
    dateOfBirth: Date;
    gender: string;
    occupation: string;
    companyName: string;
    get company(): string;
    addressLine1: string;
    get address(): string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    panNumber: string;
    aadharNumber: string;
    customerType: string;
    get type(): CustomerType;
    leadSource: string;
    assignedSalesPerson: string;
    creditLimit: number;
    outstandingBalance: number;
    totalBookings: number;
    totalPurchases: number;
    get totalSpent(): number;
    kycStatus: string;
    kycDocuments: any;
    isActive: boolean;
    notes: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
    requirementType: string;
    propertyPreference: string;
    tentativePurchaseTimeframe: string;
    get lastBookingDate(): Date;
    set lastBookingDate(value: Date);
    get isVIP(): boolean;
    get designation(): string;
    get annualIncome(): number;
}
