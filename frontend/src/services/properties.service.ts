import api from './api';

export interface Property {
  id: string;
  propertyCode: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  areaUnit: string;
  launchDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  reraNumber?: string;
  projectType?: string;
  status: string;
  images?: any;
  documents?: any;
  amenities?: any;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDto {
  propertyCode: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  areaUnit?: string;
  launchDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  reraNumber?: string;
  projectType?: string;
  status?: string;
  images?: any;
  documents?: any;
  amenities?: any;
  isActive?: boolean;
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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const propertiesService = {
  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyDto): Promise<Property> {
    const response = await api.post('/properties', data);
    return response.data;
  },

  /**
   * Get all properties with pagination and filters
   */
  async getProperties(query?: QueryPropertyDto): Promise<PaginatedPropertyResponse> {
    const response = await api.get('/properties', { params: query });
    return response.data;
  },

  /**
   * Get a single property by ID
   */
  async getPropertyById(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  /**
   * Get a property by property code
   */
  async getPropertyByCode(code: string): Promise<Property> {
    const response = await api.get(`/properties/code/${code}`);
    return response.data;
  },

  /**
   * Get property statistics
   */
  async getPropertyStats(): Promise<any> {
    const response = await api.get('/properties/stats');
    return response.data;
  },

  /**
   * Update a property
   */
  async updateProperty(id: string, data: UpdatePropertyDto): Promise<Property> {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  /**
   * Delete a property
   */
  async deleteProperty(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  /**
   * Toggle property active status
   */
  async togglePropertyActive(id: string): Promise<Property> {
    const response = await api.put(`/properties/${id}/toggle-active`);
    return response.data;
  },
};
