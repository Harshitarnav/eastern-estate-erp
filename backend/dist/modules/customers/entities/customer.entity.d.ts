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
export declare class Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone: string;
    dateOfBirth: Date;
    gender: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    type: CustomerType;
    occupation: string;
    annualIncome: number;
    company: string;
    designation: string;
    kycStatus: KYCStatus;
    panNumber: string;
    aadharNumber: string;
    passportNumber: string;
    voterIdNumber: string;
    drivingLicenseNumber: string;
    panCardUrl: string;
    aadharCardUrl: string;
    photoUrl: string;
    otherDocuments: string[];
    convertedFromLeadId: string;
    convertedAt: Date;
    referredBy: string;
    interestedPropertyTypes: string[];
    budgetMin: number;
    budgetMax: number;
    preferredLocations: string[];
    needsHomeLoan: boolean;
    hasApprovedLoan: boolean;
    bankName: string;
    approvedLoanAmount: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    totalBookings: number;
    totalPurchases: number;
    totalSpent: number;
    lastPurchaseDate: Date;
    notes: string;
    tags: string[];
    isActive: boolean;
    isVIP: boolean;
    isBlacklisted: boolean;
    blacklistReason: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
