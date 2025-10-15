import api from './api';

export interface ConstructionProject {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  propertyId: string;
  towerId?: string;
  projectPhase: string;
  projectStatus: string;
  overallProgress: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedCompletionDate?: string;
  delayDays: number;
  mainContractorName?: string;
  mainContractorPhone?: string;
  estimatedBudget: number;
  actualCost: number;
  materialCost: number;
  laborCost: number;
  projectManager?: string;
  siteEngineer?: string;
  workersCount: number;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  safetyCompliant: boolean;
  allPermitsObtained: boolean;
  photos?: string[];
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  property?: any;
  tower?: any;
  milestones?: any[];
  inspections?: any[];
}

export interface ConstructionFilters {
  search?: string;
  projectPhase?: string;
  projectStatus?: string;
  propertyId?: string;
  towerId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedConstructionResponse {
  data: ConstructionProject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ConstructionService {
  private readonly baseUrl = '/construction';

  async getProjects(filters?: ConstructionFilters): Promise<PaginatedConstructionResponse> {
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

  async getProject(id: string): Promise<ConstructionProject> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getStatistics(): Promise<any> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async createProject(data: Partial<ConstructionProject>): Promise<ConstructionProject> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<ConstructionProject>): Promise<ConstructionProject> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async updateProgress(id: string, phase: string, progress: number): Promise<ConstructionProject> {
    const response = await api.post(`${this.baseUrl}/${id}/progress`, { phase, progress });
    return response.data;
  }
}

export const constructionService = new ConstructionService();
