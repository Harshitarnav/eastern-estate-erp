import api from './api';

export type DevelopmentUpdateScope = 'PROPERTY' | 'TOWER' | 'COMMON_AREA';
export type DevelopmentUpdateCategory =
  | 'BEAUTIFICATION'
  | 'LIFT'
  | 'HALLWAY_LOBBY'
  | 'LANDSCAPING'
  | 'FACADE_PAINT'
  | 'AMENITY'
  | 'SECURITY_GATES'
  | 'UTILITIES_EXTERNAL'
  | 'SIGNAGE'
  | 'CLEANING'
  | 'SAFETY'
  | 'OTHER';

export type UpdateVisibility = 'ALL' | 'INTERNAL' | 'MANAGEMENT_ONLY';

export interface DevelopmentUpdate {
  id: string;
  propertyId: string | null;
  towerId: string | null;
  constructionProjectId: string | null;
  scopeType: DevelopmentUpdateScope | null;
  category: DevelopmentUpdateCategory | null;
  commonAreaLabel: string | null;
  updateDate: string;
  updateTitle: string;
  updateDescription: string;
  feedbackNotes?: string | null;
  images?: string[];
  attachments?: string[];
  visibility: UpdateVisibility;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; name: string } | null;
  tower?: { id: string; name: string; towerNumber?: string } | null;
  creator?: { id: string; firstName?: string; lastName?: string; email?: string } | null;
}

export interface ListFilters {
  propertyId?: string;
  towerId?: string;
  scopeType?: DevelopmentUpdateScope;
  category?: DevelopmentUpdateCategory;
  limit?: number;
  offset?: number;
}

export interface CreateDevelopmentUpdatePayload {
  propertyId?: string;
  towerId?: string;
  constructionProjectId?: string;
  scopeType?: DevelopmentUpdateScope;
  category?: DevelopmentUpdateCategory;
  commonAreaLabel?: string;
  updateDate?: string;
  updateTitle: string;
  updateDescription: string;
  feedbackNotes?: string;
  images?: string[];
  attachments?: string[];
  visibility?: UpdateVisibility;
}

function toQs(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const developmentUpdatesService = {
  async list(filters: ListFilters = {}): Promise<DevelopmentUpdate[]> {
    return await api.get<DevelopmentUpdate[]>(
      `/development-updates${toQs(filters as Record<string, unknown>)}`,
    );
  },
  async getOne(id: string): Promise<DevelopmentUpdate> {
    return await api.get<DevelopmentUpdate>(`/development-updates/${id}`);
  },
  async create(payload: CreateDevelopmentUpdatePayload): Promise<DevelopmentUpdate> {
    return await api.post<DevelopmentUpdate>('/development-updates', payload);
  },
  async remove(id: string): Promise<{ success: true }> {
    return await api.delete(`/development-updates/${id}`);
  },
  async uploadImages(files: File[]): Promise<{ urls: string[] }> {
    const fd = new FormData();
    files.slice(0, 10).forEach((f) => fd.append('images', f));
    return await api.post<{ urls: string[] }>(
      '/development-updates/upload/images',
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

export const SCOPE_LABEL: Record<DevelopmentUpdateScope, string> = {
  PROPERTY: 'Property-wide',
  TOWER: 'Tower',
  COMMON_AREA: 'Common area',
};

export const CATEGORY_LABEL: Record<DevelopmentUpdateCategory, string> = {
  BEAUTIFICATION: 'Beautification',
  LIFT: 'Lifts',
  HALLWAY_LOBBY: 'Hallway / Lobby',
  LANDSCAPING: 'Landscaping',
  FACADE_PAINT: 'Facade / Paint',
  AMENITY: 'Amenity',
  SECURITY_GATES: 'Security / Gates',
  UTILITIES_EXTERNAL: 'External utilities',
  SIGNAGE: 'Signage',
  CLEANING: 'Cleaning',
  SAFETY: 'Safety',
  OTHER: 'Other',
};
