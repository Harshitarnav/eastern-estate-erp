import { Property } from '../../properties/entities/property.entity';
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
export declare class Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: LeadStatus;
    source: LeadSource;
    priority: LeadPriority;
    leadScore: number;
    notes: string;
    propertyId: string;
    property: Property;
    interestedPropertyTypes: string[];
    budgetMin: number;
    budgetMax: number;
    preferredLocation: string;
    requirements: string[];
    expectedPurchaseDate: Date;
    lastContactedAt: Date;
    nextFollowUpDate: Date;
    followUpNotes: string;
    assignedTo: string;
    assignedUser: User;
    assignedAt: Date;
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
    siteVisitDate: Date;
    siteVisitFeedback: string;
    totalSiteVisits: number;
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
