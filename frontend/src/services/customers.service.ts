import api from './api';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  type: 'INDIVIDUAL' | 'CORPORATE' | 'NRI';
  occupation?: string;
  annualIncome?: number;
  company?: string;
  designation?: string;
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';
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

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const customersService = new CustomersService();
