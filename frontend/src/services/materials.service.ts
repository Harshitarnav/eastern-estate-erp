import api from './api';

export interface Material {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStockLevel: number;
  unitPrice: number;
  gstPercentage?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialEntry {
  id: string;
  materialId: string;
  vendorId: string;
  purchaseOrderId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gstAmount?: number;
  entryDate: string;
  invoiceNumber?: string;
  remarks?: string;
}

export interface MaterialExit {
  id: string;
  materialId: string;
  constructionProjectId?: string;
  quantity: number;
  purpose: string;
  issuedTo: string;
  exitDate: string;
  returnExpected: boolean;
  remarks?: string;
}

class MaterialsService {
  private baseUrl = '/materials';
  private entriesUrl = '/material-entries';
  private exitsUrl = '/material-exits';

  // Materials
  async getAllMaterials(filters?: { category?: string; isActive?: boolean; lowStock?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.lowStock) params.append('lowStock', filters.lowStock.toString());
    
    return await api.get<Material[]>(`${this.baseUrl}?${params.toString()}`);
  }

  async getMaterial(id: string) {
    return await api.get<Material>(`${this.baseUrl}/${id}`);
  }

  async createMaterial(data: Partial<Material>) {
    return await api.post<Material>(this.baseUrl, data);
  }

  async updateMaterial(id: string, data: Partial<Material>) {
    return await api.patch<Material>(`${this.baseUrl}/${id}`, data);
  }

  async deleteMaterial(id: string) {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async getLowStockMaterials() {
    return await api.get<Material[]>(`${this.baseUrl}/low-stock`);
  }

  async getStatistics() {
    return await api.get(`${this.baseUrl}/statistics`);
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract') {
    return await api.patch(`${this.baseUrl}/${id}/stock`, { quantity, operation });
  }

  // Material Entries
  async getAllEntries(filters?: { materialId?: string; vendorId?: string }) {
    const params = new URLSearchParams();
    if (filters?.materialId) params.append('materialId', filters.materialId);
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    
    return await api.get<MaterialEntry[]>(`${this.entriesUrl}?${params.toString()}`);
  }

  async createEntry(data: Partial<MaterialEntry>) {
    return await api.post<MaterialEntry>(this.entriesUrl, data);
  }

  // Material Exits
  async getAllExits(filters?: { materialId?: string; projectId?: string }) {
    const params = new URLSearchParams();
    if (filters?.materialId) params.append('materialId', filters.materialId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    
    return await api.get<MaterialExit[]>(`${this.exitsUrl}?${params.toString()}`);
  }

  async createExit(data: Partial<MaterialExit>) {
    return await api.post<MaterialExit>(this.exitsUrl, data);
  }
}

export default new MaterialsService();
