import api from './api';

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  flatId: string;
  propertyId: string;
  status: string;
  bookingDate: string;
  totalAmount: number;
  tokenAmount: number;
  agreementAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  tokenPaidDate?: string;
  tokenReceiptNumber?: string;
  tokenPaymentMode?: string;
  agreementNumber?: string;
  agreementDate?: string;
  agreementSignedDate?: string;
  expectedPossessionDate?: string;
  actualPossessionDate?: string;
  registrationDate?: string;
  discountAmount: number;
  stampDuty: number;
  registrationCharges: number;
  gstAmount: number;
  maintenanceDeposit: number;
  parkingCharges: number;
  otherCharges: number;
  isHomeLoan: boolean;
  bankName?: string;
  loanAmount?: number;
  loanApplicationNumber?: string;
  nominee1Name?: string;
  nominee1Relation?: string;
  nominee2Name?: string;
  nominee2Relation?: string;
  coApplicantName?: string;
  notes?: string;
  specialTerms?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  flat?: any;
  property?: any;
}

export interface BookingFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  customerId?: string;
  flatId?: string;
  propertyId?: string;
  bookingDateFrom?: string;
  bookingDateTo?: string;
  isHomeLoan?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedBookingsResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class BookingsService {
  private readonly baseUrl = '/bookings';

  async getBookings(filters?: BookingFilters): Promise<PaginatedBookingsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedBookingsResponse>(`${this.baseUrl}?${params.toString()}`);
    return response;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`${this.baseUrl}/${id}`);
    return response;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get<any>(`${this.baseUrl}/statistics`);
    return response;
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const response = await api.post<Booking>(this.baseUrl, data);
    return response;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const response = await api.put<Booking>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async deleteBooking(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async cancelBooking(id: string, reason: string, refundAmount?: number): Promise<Booking> {
    const response = await api.post<Booking>(`${this.baseUrl}/${id}/cancel`, { reason, refundAmount });
    return response;
  }
}

export const bookingsService = new BookingsService();
