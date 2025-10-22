import api from './api';

export interface ConstructionProject {
  id: string;
  projectCode: string;
  projectName: string;
  propertyId: string;
  status: string;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  estimatedBudget: number;
  budgetSpent: number;
  progress: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgressReport {
  id: string;
  constructionProjectId: string;
  reportDate: string;
  reportedBy: string;
  workCompleted: string;
  materialsUsed?: string;
  workersPresent: number;
  progressPercentage: number;
  remarks?: string;
}

export interface PainPoint {
  id: string;
  constructionProjectId: string;
  issueTitle: string;
  description: string;
  severity: string;
  status: string;
  reportedDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
}

export interface MaterialShortage {
  id: string;
  constructionProjectId: string;
  materialId: string;
  requiredQuantity: number;
  shortageDate: string;
  priority: string;
  status: string;
  estimatedDelay?: number;
}

export interface WorkSchedule {
  id: string;
  constructionProjectId: string;
  taskName: string;
  description?: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  dependencies?: string[];
}

class ConstructionService {
  private projectsUrl = '/construction-projects';
  private reportsUrl = '/daily-progress-reports';
  private painPointsUrl = '/pain-points';
  private shortagesUrl = '/material-shortages';
  private schedulesUrl = '/work-schedules';

  // Construction Projects
  async getAllProjects(filters?: { status?: string; propertyId?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    
    return await api.get<ConstructionProject[]>(`${this.projectsUrl}?${params.toString()}`);
  }

  async getProject(id: string) {
    return await api.get<ConstructionProject>(`${this.projectsUrl}/${id}`);
  }

  async createProject(data: Partial<ConstructionProject>) {
    return await api.post<ConstructionProject>(this.projectsUrl, data);
  }

  async updateProject(id: string, data: Partial<ConstructionProject>) {
    return await api.patch<ConstructionProject>(`${this.projectsUrl}/${id}`, data);
  }

  async getStatistics() {
    return await api.get(`${this.projectsUrl}/statistics`);
  }

  async getOverdueProjects() {
    return await api.get<ConstructionProject[]>(`${this.projectsUrl}/overdue`);
  }

  async updateProgress(id: string, progress: number) {
    return await api.patch(`${this.projectsUrl}/${id}/progress`, { progress });
  }

  async updateBudget(id: string, amount: number) {
    return await api.patch(`${this.projectsUrl}/${id}/budget`, { amount });
  }

  // Daily Progress Reports
  async getAllReports(filters?: { projectId?: string; fromDate?: string; toDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    
    return await api.get<DailyProgressReport[]>(`${this.reportsUrl}?${params.toString()}`);
  }

  async createReport(data: Partial<DailyProgressReport>) {
    return await api.post<DailyProgressReport>(this.reportsUrl, data);
  }

  async getAttendanceSummary(projectId: string, month: number, year: number) {
    return await api.get(`${this.reportsUrl}/attendance/${projectId}/${month}/${year}`);
  }

  // Pain Points
  async getAllPainPoints(filters?: { projectId?: string; status?: string; severity?: string }) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    
    return await api.get<PainPoint[]>(`${this.painPointsUrl}?${params.toString()}`);
  }

  async createPainPoint(data: Partial<PainPoint>) {
    return await api.post<PainPoint>(this.painPointsUrl, data);
  }

  async getOpenIssues(projectId: string) {
    return await api.get<PainPoint[]>(`${this.painPointsUrl}/project/${projectId}/open`);
  }

  async resolvePainPoint(id: string, resolutionNotes: string) {
    return await api.patch(`${this.painPointsUrl}/${id}/resolve`, { resolutionNotes });
  }

  // Material Shortages
  async getAllShortages(filters?: { projectId?: string; status?: string; priority?: string }) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    
    return await api.get<MaterialShortage[]>(`${this.shortagesUrl}?${params.toString()}`);
  }

  async createShortage(data: Partial<MaterialShortage>) {
    return await api.post<MaterialShortage>(this.shortagesUrl, data);
  }

  async getCriticalShortages(projectId: string) {
    return await api.get<MaterialShortage[]>(`${this.shortagesUrl}/project/${projectId}/critical`);
  }

  async resolveShortage(id: string) {
    return await api.patch(`${this.shortagesUrl}/${id}/resolve`);
  }

  // Work Schedules
  async getAllSchedules(filters?: { projectId?: string; assignedTo?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.status) params.append('status', filters.status);
    
    return await api.get<WorkSchedule[]>(`${this.schedulesUrl}?${params.toString()}`);
  }

  async createSchedule(data: Partial<WorkSchedule>) {
    return await api.post<WorkSchedule>(this.schedulesUrl, data);
  }

  async getUpcomingTasks(projectId: string, days: number = 7) {
    return await api.get<WorkSchedule[]>(`${this.schedulesUrl}/project/${projectId}/upcoming?days=${days}`);
  }

  async getOverdueTasks(projectId: string) {
    return await api.get<WorkSchedule[]>(`${this.schedulesUrl}/project/${projectId}/overdue`);
  }

  async getTasksByEngineer(engineerId: string) {
    return await api.get<WorkSchedule[]>(`${this.schedulesUrl}/engineer/${engineerId}`);
  }

  async updateScheduleProgress(id: string, progress: number) {
    return await api.patch(`${this.schedulesUrl}/${id}/progress`, { progress });
  }
}

export default new ConstructionService();
