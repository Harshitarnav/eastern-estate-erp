import api from './api';

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstNumber?: string;
  panNumber?: string;
  rating: number;
  totalOrderValue: number;
  outstandingAmount: number;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  purchaseOrderId?: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  referenceNumber?: string;
  remarks?: string;
}

class VendorsService {
  private baseUrl = '/vendors';
  private paymentsUrl = '/vendor-payments';

  // Vendors
  async getAllVendors(filters?: { isActive?: boolean; rating?: number }) {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.rating) params.append('rating', filters.rating.toString());
    
    return await api.get<Vendor[]>(`${this.baseUrl}?${params.toString()}`);
  }

  async getVendor(id: string) {
    return await api.get<Vendor>(`${this.baseUrl}/${id}`);
  }

  async createVendor(data: Partial<Vendor>) {
    return await api.post<Vendor>(this.baseUrl, data);
  }

  async updateVendor(id: string, data: Partial<Vendor>) {
    return await api.patch<Vendor>(`${this.baseUrl}/${id}`, data);
  }

  async deleteVendor(id: string) {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async getTopVendors(limit: number = 10) {
    return await api.get<Vendor[]>(`${this.baseUrl}/top?limit=${limit}`);
  }

  async updateOutstanding(id: string, amount: number, operation: 'add' | 'subtract') {
    return await api.patch(`${this.baseUrl}/${id}/outstanding`, { amount, operation });
  }

  // Vendor Payments
  async getAllPayments(filters?: { vendorId?: string; poId?: string }) {
    const params = new URLSearchParams();
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    if (filters?.poId) params.append('poId', filters.poId);
    
    return await api.get<VendorPayment[]>(`${this.paymentsUrl}?${params.toString()}`);
  }

  async createPayment(data: Partial<VendorPayment>) {
    return await api.post<VendorPayment>(this.paymentsUrl, data);
  }

  async getTotalPaid(vendorId: string) {
    return await api.get(`${this.paymentsUrl}/vendor/${vendorId}/total`);
  }
}

export default new VendorsService();
