import api from './api';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD';
  source: 'WEBSITE' | 'WALK_IN' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'EMAIL' | 'PHONE' | 'ADVERTISEMENT' | 'BROKER' | 'EXHIBITION' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  leadScore: number;
  notes?: string;
  propertyId?: string;
  interestedPropertyTypes?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  requirements?: string[];
  expectedPurchaseDate?: string;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  followUpNotes?: string;
  assignedTo?: string;
  assignedAt?: string;
  isQualified: boolean;
  isFirstTimeBuyer: boolean;
  hasExistingProperty: boolean;
  needsHomeLoan: boolean;
  hasApprovedLoan: boolean;
  currentOccupation?: string;
  annualIncome?: number;
  campaignName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  tags?: string[];
  referredBy?: string;
  referralName?: string;
  referralPhone?: string;
  hasSiteVisit: boolean;
  siteVisitDate?: string;
  siteVisitFeedback?: string;
  totalSiteVisits: number;
  totalCalls: number;
  totalEmails: number;
  totalMeetings: number;
  lastCallDate?: string;
  lastEmailDate?: string;
  lastMeetingDate?: string;
  convertedToCustomerId?: string;
  convertedAt?: string;
  lostReason?: string;
  lostAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  property?: any;
  assignedUser?: any;
}

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  priority?: string;
  propertyId?: string;
  assignedTo?: string;
  isQualified?: boolean;
  needsHomeLoan?: boolean;
  hasSiteVisit?: boolean;
  minBudget?: number;
  maxBudget?: number;
  createdFrom?: string;
  createdTo?: string;
  followUpDue?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedLeadsResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class LeadsService {
  private readonly baseUrl = '/leads';

  async getLeads(filters?: LeadFilters): Promise<PaginatedLeadsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response;
  }

  async getLead(id: string): Promise<Lead> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response;
  }

  async getMyLeads(userId: string): Promise<Lead[]> {
    const response = await api.get(`${this.baseUrl}/my-leads/${userId}`);
    return response;
  }

  async getDueFollowUps(userId?: string): Promise<Lead[]> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`${this.baseUrl}/due-followups${params}`);
    return response;
  }

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await api.post(this.baseUrl, data);
    return response;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async assignLead(id: string, userId: string): Promise<Lead> {
    const response = await api.patch(`${this.baseUrl}/${id}/assign`, { userId });
    return response;
  }

  async updateStatus(id: string, status: string, notes?: string): Promise<Lead> {
    const response = await api.patch(`${this.baseUrl}/${id}/status`, { status, notes });
    return response;
  }

  async deleteLead(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Bulk Operations
  async bulkAssignLeads(leadIds: string[], assignedTo: string): Promise<{ assigned: number }> {
    const response = await api.post(`${this.baseUrl}/bulk-assign`, { leadIds, assignedTo });
    return response;
  }

  async checkDuplicateLead(email?: string, phone?: string): Promise<{
    isDuplicate: boolean;
    existingLead?: any;
  }> {
    const response = await api.post(`${this.baseUrl}/check-duplicate`, { email, phone });
    return response;
  }

  // Dashboard Statistics
  async getAgentDashboard(agentId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    return this.getAgentDashboardStats(agentId, filters);
  }

  async getAgentDashboardStats(agentId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(
      `${this.baseUrl}/dashboard/agent/${agentId}?${params.toString()}`
    );
    return response;
  }

  async getAdminDashboardStats(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(
      `${this.baseUrl}/dashboard/admin?${params.toString()}`
    );
    return response;
  }

  async getTeamDashboardStats(gmId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(
      `${this.baseUrl}/dashboard/team/${gmId}?${params.toString()}`
    );
    return response;
  }

  async getTeamDashboard(gmId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    return this.getTeamDashboardStats(gmId, filters);
  }

  // Import/Export
  async importLeads(data: {
    leads: Array<{
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      source: string;
      status?: string;
      notes?: string;
    }>;
  }): Promise<{
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: any[];
    createdLeads: string[];
  }> {
    const response = await api.post(`${this.baseUrl}/import`, data);
    return response;
  }

  // Priority & Smart Features
  async getPrioritizedLeads(userId: string): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/prioritized?userId=${userId}`);
    return response;
  }

  async getTodaysTasks(userId: string): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/today-tasks?userId=${userId}`);
    return response;
  }

  async getSmartTips(userId: string): Promise<{ tips: string[]; timestamp: string }> {
    const response = await api.get(`${this.baseUrl}/smart-tips?userId=${userId}`);
    return response;
  }
}

export const leadsService = new LeadsService();
