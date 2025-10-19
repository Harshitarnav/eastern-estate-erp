import { BaseCachedService } from './base-cached.service';
import type {
  DataCompletenessStatus,
  FlatSalesBreakdown,
} from './properties.service';

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
  status: 'AVAILABLE' | 'ON_HOLD' | 'BLOCKED' | 'BOOKED' | 'SOLD' | 'UNDER_CONSTRUCTION';
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
  flatChecklist?: Record<string, boolean> | null;
  dataCompletionPct?: number;
  completenessStatus?: DataCompletenessStatus;
  issues?: string[];
  issuesCount?: number;
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

export interface FlatCompletenessBreakdown {
  notStarted: number;
  inProgress: number;
  needsReview: number;
  complete: number;
}

export interface FlatInventoryUnit {
  id: string;
  flatNumber: string;
  floor: number;
  type: Flat['type'];
  carpetArea: number;
  superBuiltUpArea: number;
  builtUpArea: number;
  facing?: string;
  basePrice: number;
  pricePerSqft?: number;
  status: Flat['status'];
  dataCompletionPct: number;
  completenessStatus: DataCompletenessStatus;
  checklist: Record<string, boolean> | null;
  issues: string[];
  issuesCount: number;
}

export interface FlatInventorySummary {
  towerId: string;
  towerName: string;
  towerNumber: string;
  propertyId: string;
  propertyName?: string;
  propertyCode?: string;
  unitsPlanned: number;
  unitsDefined: number;
  missingUnits: number;
  averageCompletionPct: number;
  completeness: FlatCompletenessBreakdown;
  issuesCount: number;
  salesBreakdown: FlatSalesBreakdown;
  units: FlatInventoryUnit[];
  generatedAt: string;
}

class FlatsService extends BaseCachedService {
  private readonly baseUrl = '/flats';
  private readonly cachePrefix = 'flats';

  /**
   * Get all flats with filtering and pagination
   * Uses caching with hash comparison for optimal performance
   */
  async getFlats(filters?: FlatFilters, options?: { forceRefresh?: boolean }): Promise<PaginatedFlatsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const cacheKey = this.createKey(this.cachePrefix, 'list', queryString || 'default');

    return this.fetchWithCache(
      cacheKey,
      () => this.get<PaginatedFlatsResponse>(`${this.baseUrl}?${queryString}`),
      options
    );
  }

  /**
   * Get flat by ID
   * Uses caching for faster subsequent loads
   */
  async getFlat(id: string, options?: { forceRefresh?: boolean }): Promise<Flat> {
    const cacheKey = this.createKey(this.cachePrefix, 'detail', id);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<Flat>(`${this.baseUrl}/${id}`),
      options
    );
  }

  /**
   * Get flats by tower ID
   * Uses caching for tower-specific flat lists
   */
  async getFlatsByTower(towerId: string, options?: { forceRefresh?: boolean }): Promise<Flat[]> {
    const cacheKey = this.createKey(this.cachePrefix, 'by-tower', towerId);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<Flat[]>(`${this.baseUrl}/tower/${towerId}`),
      options
    );
  }

  /**
   * Get flats by property ID
   * Uses caching for property-specific flat lists
   */
  async getFlatsByProperty(propertyId: string, options?: { forceRefresh?: boolean }): Promise<Flat[]> {
    const cacheKey = this.createKey(this.cachePrefix, 'by-property', propertyId);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<Flat[]>(`${this.baseUrl}/property/${propertyId}`),
      options
    );
  }

  /**
   * Get property statistics
   * Uses caching for stats
   */
  async getPropertyStats(propertyId: string, options?: { forceRefresh?: boolean }): Promise<any> {
    const cacheKey = this.createKey(this.cachePrefix, 'property-stats', propertyId);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<any>(`${this.baseUrl}/property/${propertyId}/stats`),
      options
    );
  }

  /**
   * Get tower statistics
   * Uses caching for stats
   */
  async getTowerStats(towerId: string, options?: { forceRefresh?: boolean }): Promise<any> {
    const cacheKey = this.createKey(this.cachePrefix, 'tower-stats', towerId);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<any>(`${this.baseUrl}/tower/${towerId}/stats`),
      options
    );
  }

  async getTowerInventorySummary(
    towerId: string,
    options?: { forceRefresh?: boolean },
  ): Promise<FlatInventorySummary> {
    const cacheKey = this.createKey(this.cachePrefix, 'tower-inventory-summary', towerId);

    return this.fetchWithCache(
      cacheKey,
      () => this.get<FlatInventorySummary>(`${this.baseUrl}/tower/${towerId}/inventory/summary`),
      options,
    );
  }

  async getStatistics(options?: { forceRefresh?: boolean }): Promise<any> {
    const cacheKey = this.createKey(this.cachePrefix, 'global-stats', 'all');

    return this.fetchWithCache(
      cacheKey,
      () => this.get<any>(`${this.baseUrl}/stats`),
      options,
    );
  }

  /**
   * Create a new flat
   * Invalidates all flat-related caches
   */
  async createFlat(data: Partial<Flat>): Promise<Flat> {
    const result = await this.post<Flat>(
      this.baseUrl,
      data,
      `cache_${this.cachePrefix}_.*`
    );
    return result;
  }

  /**
   * Update flat
   * Invalidates related caches
   */
  async updateFlat(id: string, data: Partial<Flat>): Promise<Flat> {
    const result = await this.put<Flat>(
      `${this.baseUrl}/${id}`,
      data,
      `cache_${this.cachePrefix}_.*`
    );
    return result;
  }

  /**
   * Delete flat
   * Invalidates related caches
   */
  async deleteFlat(id: string): Promise<void> {
    await this.delete<void>(
      `${this.baseUrl}/${id}`,
      `cache_${this.cachePrefix}_.*`
    );
  }
}

export const flatsService = new FlatsService();
