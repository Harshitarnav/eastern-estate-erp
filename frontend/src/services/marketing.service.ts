import api from './api';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  budget: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  attachments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignFilters {
  search?: string;
  type?: string;
  status?: string;
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
    return response;
  },

  async getCampaign(id: string): Promise<Campaign> {
    const response = await api.get(`/marketing/campaigns/${id}`);
    return response;
  },

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const response = await api.post('/marketing/campaigns', data);
    return response;
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const response = await api.patch(`/marketing/campaigns/${id}`, data);
    return response;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/marketing/campaigns/${id}`);
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};
