import api from './api';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  items: any[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string;
  paymentTerms: string;
  paidAmount: number;
  balanceAmount: number;
  paymentDueDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalItemsOrdered: number;
  totalItemsReceived: number;
  invoiceNumber?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  supplierId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedPurchaseOrdersResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class PurchaseOrdersService {
  private readonly baseUrl = '/purchase-orders';

  async getOrders(filters?: PurchaseOrderFilters): Promise<PaginatedPurchaseOrdersResponse> {
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

  async getOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async createOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async approveOrder(id: string, approvedBy: string, approvedByName: string): Promise<PurchaseOrder> {
    const response = await api.post(`${this.baseUrl}/${id}/approve`, { approvedBy, approvedByName });
    return response.data;
  }

  async rejectOrder(id: string, rejectedBy: string, rejectedByName: string, reason: string): Promise<PurchaseOrder> {
    const response = await api.post(`${this.baseUrl}/${id}/reject`, { rejectedBy, rejectedByName, reason });
    return response.data;
  }

  async receiveItems(id: string, receivedData: any): Promise<PurchaseOrder> {
    const response = await api.post(`${this.baseUrl}/${id}/receive`, receivedData);
    return response.data;
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
