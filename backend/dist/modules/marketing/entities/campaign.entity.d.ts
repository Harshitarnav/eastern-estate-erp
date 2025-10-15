import { User } from '../../users/entities/user.entity';
export declare enum CampaignType {
    DIGITAL = "DIGITAL",
    PRINT = "PRINT",
    OUTDOOR = "OUTDOOR",
    TV = "TV",
    RADIO = "RADIO",
    EMAIL = "EMAIL",
    SMS = "SMS",
    SOCIAL_MEDIA = "SOCIAL_MEDIA",
    EVENT = "EVENT",
    REFERRAL = "REFERRAL",
    OTHER = "OTHER"
}
export declare enum CampaignStatus {
    DRAFT = "DRAFT",
    PLANNED = "PLANNED",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum CampaignChannel {
    FACEBOOK = "FACEBOOK",
    INSTAGRAM = "INSTAGRAM",
    GOOGLE_ADS = "GOOGLE_ADS",
    LINKEDIN = "LINKEDIN",
    TWITTER = "TWITTER",
    YOUTUBE = "YOUTUBE",
    WHATSAPP = "WHATSAPP",
    NEWSPAPER = "NEWSPAPER",
    MAGAZINE = "MAGAZINE",
    BILLBOARD = "BILLBOARD",
    RADIO_FM = "RADIO_FM",
    TV_CHANNEL = "TV_CHANNEL",
    EMAIL_CAMPAIGN = "EMAIL_CAMPAIGN",
    SMS_CAMPAIGN = "SMS_CAMPAIGN",
    PROPERTY_PORTAL = "PROPERTY_PORTAL",
    REAL_ESTATE_WEBSITE = "REAL_ESTATE_WEBSITE",
    EVENT_EXHIBITION = "EVENT_EXHIBITION",
    OTHER = "OTHER"
}
export declare class Campaign {
    id: string;
    campaignCode: string;
    name: string;
    description: string;
    type: CampaignType;
    status: CampaignStatus;
    channel: CampaignChannel;
    startDate: Date;
    endDate: Date;
    actualStartDate: Date;
    actualEndDate: Date;
    totalBudget: number;
    amountSpent: number;
    remainingBudget: number;
    budgetUtilization: number;
    totalImpressions: number;
    totalClicks: number;
    clickThroughRate: number;
    totalLeads: number;
    qualifiedLeads: number;
    conversions: number;
    conversionRate: number;
    costPerLead: number;
    costPerConversion: number;
    revenueGenerated: number;
    roi: number;
    targetAudience: {
        ageRange?: string;
        gender?: string;
        location?: string[];
        income?: string;
        interests?: string[];
    };
    objectives: string;
    message: string;
    callToAction: string;
    landingPageUrl: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    creativeAssets: string[];
    adCopy: string;
    keywords: string[];
    vendorName: string;
    agencyName: string;
    vendorContact: string;
    vendorCost: number;
    managerId: string;
    manager: User;
    dailyMetrics: Array<{
        date: string;
        impressions: number;
        clicks: number;
        leads: number;
        spend: number;
    }>;
    channelPerformance: {
        [channel: string]: {
            impressions: number;
            clicks: number;
            leads: number;
            conversions: number;
            spend: number;
            roi: number;
        };
    };
    tags: string[];
    category: string;
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    creator: User;
    updatedBy: string;
    updater: User;
}
