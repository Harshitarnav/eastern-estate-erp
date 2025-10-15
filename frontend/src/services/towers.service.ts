import api from './api';

export interface Tower {
  id: string;
  name: string;
  towerNumber: string;
  description?: string;
  totalFloors: number;
  totalUnits: number;
  basementLevels: number;
  unitsPerFloor?: string;
  amenities?: string[];
  constructionStatus: 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'READY_TO_MOVE';
  constructionStartDate?: string;
  completionDate?: string;
  reraNumber?: string;
  builtUpArea?: number;
  carpetArea?: number;
  ceilingHeight?: number;
  numberOfLifts: number;
  vastuCompliant: boolean;
  facing?: string;
  specialFeatures?: string;
  isActive: boolean;
  displayOrder: number;
  images?: string[];
  floorPlans?: Record<string, string>;
  propertyId: string;
  property?: {
    id: string;
    name: string;
    propertyCode: string;
    city: string;
    state: string;
  };
  createdAt: string;
  updatedAt: string;
  availableUnits?: number;
  soldUnits?: number;
  occupancyRate?: number;
}

export interface TowerFilters {
  page?: number;
  limit?: number;
  search?: string;
  propertyId?: string;
  constructionStatus?: string;
  vastuCompliant?: boolean;
  facing?: string;
  minFloors?: number;
  maxFloors?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TowersResponse {
  data: Tower[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const towersService = {
  // Get all towers with filters
  async getTowers(filters?: TowerFilters): Promise<TowersResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/towers?${params.toString()}`);
    return response.data;
  },

  // Get single tower by ID
  async getTower(id: string): Promise<Tower> {
    const response = await api.get(`/towers/${id}`);
    return response.data;
  },

  // Get towers by property
  async getTowersByProperty(propertyId: string): Promise<Tower[]> {
    const response = await api.get(`/towers/property/${propertyId}`);
    return response.data;
  },

  // Get tower statistics
  async getTowerStatistics(id: string): Promise<any> {
    const response = await api.get(`/towers/${id}/statistics`);
    return response.data;
  },

  // Create tower
  async createTower(data: Partial<Tower>): Promise<Tower> {
    const response = await api.post('/towers', data);
    return response.data;
  },

  // Update tower
  async updateTower(id: string, data: Partial<Tower>): Promise<Tower> {
    const response = await api.put(`/towers/${id}`, data);
    return response.data;
  },

  // Delete tower
  async deleteTower(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/towers/${id}`);
    return response.data;
  },
};
