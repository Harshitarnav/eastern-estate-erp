import { User } from '../../users/entities/user.entity';
export declare enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    QUALIFIED = "QUALIFIED",
    NEGOTIATION = "NEGOTIATION",
    WON = "WON",
    LOST = "LOST",
    ON_HOLD = "ON_HOLD"
}
export declare enum LeadSource {
    WEBSITE = "WEBSITE",
    WALK_IN = "WALK_IN",
    REFERRAL = "REFERRAL",
    SOCIAL_MEDIA = "SOCIAL_MEDIA",
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    ADVERTISEMENT = "ADVERTISEMENT",
    BROKER = "BROKER",
    EXHIBITION = "EXHIBITION",
    OTHER = "OTHER"
}
export declare enum LeadPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum SiteVisitStatus {
    NOT_SCHEDULED = "NOT_SCHEDULED",
    SCHEDULED = "SCHEDULED",
    PENDING = "PENDING",
    DONE = "DONE",
    CANCELLED = "CANCELLED"
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
export declare class Lead {
    id: string;
    leadCode: string;
    fullName: string;
    get firstName(): string;
    get lastName(): string;
    email: string;
    phoneNumber: string;
    get phone(): string;
    alternatePhone: string;
    address: string;
    city: string;
    state: string;
    status: LeadStatus;
    source: LeadSource;
    priority: LeadPriority;
    interestedPropertyTypes: string;
    requirementType: CustomerRequirementType;
    propertyPreference: PropertyPreference;
    budgetMin: number;
    budgetMax: number;
    preferredLocation: string;
    requirements: string[];
    tentativePurchaseTimeframe: string;
    expectedPurchaseDate: Date;
    lastContactedAt: Date;
    nextFollowUpDate: Date;
    followUpNotes: string;
    get notes(): string;
    lastFollowUpFeedback: string;
    totalFollowUps: number;
    sendFollowUpReminder: boolean;
    reminderSent: boolean;
    reminderSentAt: Date;
    assignedTo: string;
    assignedAt: Date;
    assignedUser: User;
    isQualified: boolean;
    isFirstTimeBuyer: boolean;
    hasExistingProperty: boolean;
    needsHomeLoan: boolean;
    hasApprovedLoan: boolean;
    currentOccupation: string;
    annualIncome: number;
    campaignName: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    tags: string[];
    referredBy: string;
    referralName: string;
    referralPhone: string;
    hasSiteVisit: boolean;
    siteVisitStatus: SiteVisitStatus;
    siteVisitTime: string;
    siteVisitFeedback: string;
    totalSiteVisits: number;
    lastSiteVisitDate: Date;
    totalCalls: number;
    totalEmails: number;
    totalMeetings: number;
    lastCallDate: Date;
    lastEmailDate: Date;
    lastMeetingDate: Date;
    convertedToCustomerId: string;
    convertedAt: Date;
    lostReason: string;
    lostAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
