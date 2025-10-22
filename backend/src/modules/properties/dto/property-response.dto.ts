export class PropertyResponseDto {
  id: string;
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
  areaUnit: string;
  numberOfTowers?: number;
  numberOfUnits?: number;
  floorsPerTower?: string;
  launchDate?: string | Date;
  expectedCompletionDate?: string | Date;
  actualCompletionDate?: string | Date;
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
  createdAt: string | Date;
  updatedAt: string | Date;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  
  // Calculated fields
  towers?: number;
  totalFlats?: number;
  soldFlats?: number;
  availableFlats?: number;
  fundsTarget?: number;
  fundsRealized?: number;
  fundsOutstanding?: number;
}

export class PaginatedPropertyResponseDto {
  data: PropertyResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    dataHash?: string;
  };
}
