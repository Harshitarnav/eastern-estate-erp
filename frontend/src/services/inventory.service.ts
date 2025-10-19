import api from './api';

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  reorderPoint: number;
  stockStatus: string;
  unitPrice: number;
  totalValue: number;
  supplierName?: string;
  warehouseLocation?: string;
  totalIssued: number;
  totalReceived: number;
  isActive: boolean;
  createdAt: string;
  property?: any;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  stockStatus?: string;
  propertyId?: string;
  supplierName?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedInventoryResponse {
  data: InventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class InventoryService {
  private readonly baseUrl = '/inventory';

  async getItems(filters?: InventoryFilters): Promise<PaginatedInventoryResponse> {
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

  async getItem(id: string): Promise<InventoryItem> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response;
  }

  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.post(this.baseUrl, data);
    return response;
  }

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async deleteItem(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async issueItem(id: string, quantity: number): Promise<InventoryItem> {
    const response = await api.post(`${this.baseUrl}/${id}/issue`, { quantity });
    return response;
  }

  async receiveItem(id: string, quantity: number): Promise<InventoryItem> {
    const response = await api.post(`${this.baseUrl}/${id}/receive`, { quantity });
    return response;
  }
}

export const inventoryService = new InventoryService();
