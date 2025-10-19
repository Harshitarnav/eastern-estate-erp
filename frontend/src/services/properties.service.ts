import api from './api';

export interface Property {
  id: string;
  propertyCode: string;
  name: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  description?: string;
  country?: string;
  address: string;
  location?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  builtUpArea?: number;
  areaUnit: string;
  numberOfTowers?: number;
  numberOfUnits?: number;
  floorsPerTower?: string;
  launchDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  reraNumber?: string;
  reraStatus?: string;
  projectType?: string;
  propertyType?: string;
  status: string;
  images?: any;
  documents?: any;
  amenities?: any;
  bhkTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  expectedRevenue?: number;
  nearbyLandmarks?: string;
  isActive: boolean;
  isFeatured?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  towers?: number;
  totalFlats?: number;
  soldFlats?: number;
  availableFlats?: number;
}

export interface CreatePropertyDto {
  projectId: string;
  propertyCode: string;
  name: string;
  description?: string;
  country?: string;
  address: string;
  location?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  builtUpArea?: number;
  areaUnit?: string;
  numberOfTowers?: number;
  numberOfUnits?: number;
  floorsPerTower?: string;
  launchDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  reraNumber?: string;
  reraStatus?: string;
  projectType?: string;
  propertyType?: string;
  status?: string;
  images?: any;
  documents?: any;
  amenities?: any;
  bhkTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  expectedRevenue?: number;
  nearbyLandmarks?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {}

export interface QueryPropertyDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  state?: string;
  projectType?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedPropertyResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type DataCompletenessStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'NEEDS_REVIEW' | 'COMPLETE';

export interface FlatSalesBreakdown {
  available: number;
  onHold: number;
  booked: number;
  sold: number;
  blocked: number;
  underConstruction: number;
  total: number;
}

export interface TowersCompletenessBreakdown {
  notStarted: number;
  inProgress: number;
  needsReview: number;
  complete: number;
}

export interface TowerInventorySummary {
  id: string;
  name: string;
  towerNumber: string;
  towerCode: string;
  totalFloors: number;
  totalUnits: number;
  unitsPlanned: number;
  unitsDefined: number;
  missingUnits: number;
  dataCompletionPct: number;
  dataCompletenessStatus: DataCompletenessStatus;
  issuesCount: number;
  salesBreakdown: FlatSalesBreakdown;
}

export interface PropertyInventorySummary {
  propertyId: string;
  propertyName: string;
  propertyCode: string;
  dataCompletionPct: number;
  dataCompletenessStatus: DataCompletenessStatus;
  towersPlanned: number;
  towersDefined: number;
  missingTowers: number;
  unitsPlanned: number;
  unitsDefined: number;
  missingUnits: number;
  towersCompleteness: TowersCompletenessBreakdown;
  salesBreakdown: FlatSalesBreakdown;
  towers: TowerInventorySummary[];
  generatedAt: string;
}

export const propertiesService = {
  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyDto): Promise<Property> {
    const response = await api.post('/properties', data);
    return response;
  },

  /**
   * Get all properties with pagination and filters
   */
  async getProperties(query?: QueryPropertyDto): Promise<PaginatedPropertyResponse> {
    const response = await api.get('/properties', { params: query });
    return response;
  },

  /**
   * Get a single property by ID
   */
  async getPropertyById(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response;
  },

  /**
   * Get a property by property code
   */
  async getPropertyByCode(code: string): Promise<Property> {
    const response = await api.get(`/properties/code/${code}`);
    return response;
  },

  /**
   * Get property statistics
   */
  async getPropertyStats(): Promise<any> {
    const response = await api.get('/properties/stats');
    return response;
  },

  /**
   * Back-compat alias used by dashboard code
   */
  async getStatistics(): Promise<any> {
    return this.getPropertyStats();
  },

  /**
   * Update a property
   */
  async updateProperty(id: string, data: UpdatePropertyDto): Promise<Property> {
    const response = await api.put(`/properties/${id}`, data);
    return response;
  },

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/properties/${id}`);
    return response;
  },

  /**
   * Toggle property active status
   */
  async togglePropertyActive(id: string): Promise<Property> {
    const response = await api.put(`/properties/${id}/toggle-active`);
    return response;
  },

  async getInventorySummary(id: string): Promise<PropertyInventorySummary> {
    const response = await api.get(`/properties/${id}/inventory/summary`);
    return response;
  },
};
