import api from './api';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  vendorId: string;
  vendorName?: string;
  propertyId?: string;
  propertyName?: string;
  constructionProjectId?: string;
  status: 'DRAFT' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  paymentTerms?: string;
  deliveryAddress?: string;
  deliveryContact?: string;
  deliveryPhone?: string;
  notes?: string;
  termsAndConditions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  discountPercentage: number;
  totalAmount: number;
  notes?: string;
}

export interface POQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class PurchaseOrdersService {
  private baseUrl = '/purchase-orders';
  private itemsUrl = '/purchase-order-items';

  // Purchase Orders
  async getAll(params?: POQueryParams) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return await api.get(`${this.baseUrl}?${queryParams.toString()}`);
  }

  async getOne(id: string) {
    return await api.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<PurchaseOrder>) {
    return await api.post<PurchaseOrder>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<PurchaseOrder>) {
    return await api.patch<PurchaseOrder>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: PurchaseOrder['status']) {
    return await api.patch(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string) {
    return await api.delete(`${this.baseUrl}/${id}`);
  }

  async getStats() {
    return await api.get(`${this.baseUrl}/stats`);
  }

  // PO Items
  async getItemsByPO(purchaseOrderId: string) {
    return await api.get<PurchaseOrderItem[]>(`${this.itemsUrl}/purchase-order/${purchaseOrderId}`);
  }

  async getItemTotal(purchaseOrderId: string) {
    return await api.get(`${this.itemsUrl}/purchase-order/${purchaseOrderId}/total`);
  }

  async createItem(data: Partial<PurchaseOrderItem>) {
    return await api.post<PurchaseOrderItem>(this.itemsUrl, data);
  }

  async updateItem(id: string, data: Partial<PurchaseOrderItem>) {
    return await api.patch<PurchaseOrderItem>(`${this.itemsUrl}/${id}`, data);
  }

  async deleteItem(id: string) {
    return await api.delete(`${this.itemsUrl}/${id}`);
  }
}

export default new PurchaseOrdersService();
