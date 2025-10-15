import api from './api';

export interface Flat {
  id: string;
  propertyId: string;
  towerId: string;
  flatNumber: string;
  name: string;
  description?: string;
  type: 'STUDIO' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'PENTHOUSE' | 'DUPLEX' | 'VILLA';
  floor: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  servantRoom: boolean;
  studyRoom: boolean;
  poojaRoom: boolean;
  superBuiltUpArea: number;
  builtUpArea: number;
  carpetArea: number;
  balconyArea?: number;
  basePrice: number;
  pricePerSqft?: number;
  registrationCharges?: number;
  maintenanceCharges?: number;
  parkingCharges?: number;
  totalPrice: number;
  discountAmount?: number;
  finalPrice: number;
  status: 'AVAILABLE' | 'BLOCKED' | 'BOOKED' | 'SOLD' | 'UNDER_CONSTRUCTION';
  isAvailable: boolean;
  availableFrom?: string;
  expectedPossession?: string;
  facing?: string;
  vastuCompliant: boolean;
  cornerUnit: boolean;
  roadFacing: boolean;
  parkFacing: boolean;
  parkingSlots: number;
  coveredParking: boolean;
  furnishingStatus?: string;
  amenities?: string[];
  specialFeatures?: string;
  floorPlanUrl?: string;
  images?: string[];
  virtualTourUrl?: string;
  customerId?: string;
  bookingDate?: string;
  soldDate?: string;
  tokenAmount?: number;
  paymentPlan?: string;
  remarks?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  property?: any;
  tower?: any;
}

export interface FlatFilters {
  search?: string;
  propertyId?: string;
  towerId?: string;
  type?: string;
  status?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  floor?: number;
  bedrooms?: number;
  vastuCompliant?: boolean;
  cornerUnit?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedFlatsResponse {
  data: Flat[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class FlatsService {
  private readonly baseUrl = '/flats';

  /**
   * Get all flats with filtering and pagination
   */
  async getFlats(filters?: FlatFilters): Promise<PaginatedFlatsResponse> {
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

  /**
   * Get flat by ID
   */
  async getFlat(id: string): Promise<Flat> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Get flats by tower ID
   */
  async getFlatsByTower(towerId: string): Promise<Flat[]> {
    const response = await api.get(`${this.baseUrl}/tower/${towerId}`);
    return response.data;
  }

  /**
   * Get flats by property ID
   */
  async getFlatsByProperty(propertyId: string): Promise<Flat[]> {
    const response = await api.get(`${this.baseUrl}/property/${propertyId}`);
    return response.data;
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(propertyId: string): Promise<any> {
    const response = await api.get(`${this.baseUrl}/property/${propertyId}/stats`);
    return response.data;
  }

  /**
   * Get tower statistics
   */
  async getTowerStats(towerId: string): Promise<any> {
    const response = await api.get(`${this.baseUrl}/tower/${towerId}/stats`);
    return response.data;
  }

  /**
   * Create a new flat
   */
  async createFlat(data: Partial<Flat>): Promise<Flat> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update flat
   */
  async updateFlat(id: string, data: Partial<Flat>): Promise<Flat> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete flat
   */
  async deleteFlat(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const flatsService = new FlatsService();
