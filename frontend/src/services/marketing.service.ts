import api from './api';

export interface Campaign {
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

export interface CampaignFilters {
  search?: string;
  type?: string;
  status?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCampaignResponse {
  data: Campaign[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const marketingService = {
  async getCampaigns(filters: CampaignFilters = {}): Promise<PaginatedCampaignResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/marketing/campaigns?${params.toString()}`);
    return response.data;
  },

  async getCampaign(id: string): Promise<Campaign> {
    const response = await api.get(`/marketing/campaigns/${id}`);
    return response.data;
  },

  async createCampaign(data: any): Promise<Campaign> {
    const response = await api.post('/marketing/campaigns', data);
    return response.data;
  },

  async updateCampaign(id: string, data: any): Promise<Campaign> {
    const response = await api.patch(`/marketing/campaigns/${id}`, data);
    return response.data;
  },

  async updateMetrics(id: string, metrics: any): Promise<Campaign> {
    const response = await api.patch(`/marketing/campaigns/${id}/metrics`, metrics);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/marketing/campaigns/${id}`);
  },

  async getStatistics(): Promise<any> {
    const response = await api.get('/marketing/campaigns/statistics');
    return response.data;
  },
};
