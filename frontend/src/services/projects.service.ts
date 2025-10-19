import api from './api';

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  status?: string;
  city?: string;
  state?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueryProjectDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
}

export interface PaginatedProjectsResponse {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProjectDto {
  projectCode: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  gstNumber?: string;
  panNumber?: string;
  financeEntityName?: string;
  isActive?: boolean;
}

export const projectsService = {
  async getProjects(query?: QueryProjectDto): Promise<PaginatedProjectsResponse> {
    const response = await api.get('/projects', { params: query });
    return response;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post('/projects', data);
    return response;
  },
};

export default projectsService;
