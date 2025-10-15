export class CampaignResponseDto {
  id: string;
  campaignCode: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  channel: string;
  startDate: Date;
  endDate: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedCampaignResponseDto {
  data: CampaignResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
