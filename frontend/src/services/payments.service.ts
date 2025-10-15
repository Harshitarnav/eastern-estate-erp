import api from './api';

export interface Payment {
  id: string;
  paymentNumber: string;
  receiptNumber?: string;
  bookingId: string;
  customerId: string;
  paymentType: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  status: string;
  bankName?: string;
  chequeNumber?: string;
  transactionId?: string;
  upiId?: string;
  installmentNumber?: number;
  tdsAmount: number;
  gstAmount: number;
  netAmount: number;
  receiptGenerated: boolean;
  isVerified: boolean;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  booking?: any;
  customer?: any;
}

export interface PaymentFilters {
  search?: string;
  paymentType?: string;
  paymentMode?: string;
  status?: string;
  bookingId?: string;
  customerId?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  isVerified?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedPaymentsResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class PaymentsService {
  private readonly baseUrl = '/payments';

  async getPayments(filters?: PaymentFilters): Promise<PaginatedPaymentsResponse> {
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

  async getPayment(id: string): Promise<Payment> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deletePayment(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async verifyPayment(id: string, verifiedBy: string): Promise<Payment> {
    const response = await api.post(`${this.baseUrl}/${id}/verify`, { verifiedBy });
    return response.data;
  }
}

export const paymentsService = new PaymentsService();
