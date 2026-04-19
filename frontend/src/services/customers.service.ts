import api from './api';

export interface Customer {
  id: string;
  customerCode?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  type: 'INDIVIDUAL' | 'CORPORATE' | 'NRI';
  occupation?: string;
  annualIncome?: number;
  company?: string;
  companyName?: string;
  designation?: string;
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';
  propertyId?: string;
  panNumber?: string;
  aadharNumber?: string;
  needsHomeLoan: boolean;
  hasApprovedLoan: boolean;
  bankName?: string;
  approvedLoanAmount?: number;
  totalBookings: number;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  isVIP: boolean;
  isBlacklisted: boolean;
  /**
   * Tri-state per-customer override for milestone-DD auto-send.
   *   null  → inherit from property / company default
   *   true  → always auto-send (skip review) for this customer
   *   false → always require human review for this customer
   */
  autoSendMilestoneDemandDrafts?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  type?: string;
  kycStatus?: string;
  needsHomeLoan?: boolean;
  isVIP?: boolean;
  city?: string;
  createdFrom?: string;
  createdTo?: string;
  isActive?: boolean;
  propertyId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedCustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class CustomersService {
  private readonly baseUrl = '/customers';

  async getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomersResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedCustomersResponse>(`${this.baseUrl}?${params.toString()}`);
    return response;
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`${this.baseUrl}/${id}`);
    return response;
  }

  async getStatistics(params?: { propertyId?: string }): Promise<any> {
    const qs = new URLSearchParams();
    if (params?.propertyId) qs.append('propertyId', params.propertyId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const response = await api.get<any>(`${this.baseUrl}/statistics${suffix}`);
    return response;
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post<Customer>(this.baseUrl, data);
    return response;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put<Customer>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const customersService = new CustomersService();
