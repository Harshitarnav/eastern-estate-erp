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

// New Phase 5 Interfaces
export type ConstructionPhase = 'FOUNDATION' | 'STRUCTURE' | 'MEP' | 'FINISHING' | 'HANDOVER';
export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
export type ProjectRole = 'PROJECT_MANAGER' | 'SITE_ENGINEER' | 'SUPERVISOR' | 'FOREMAN' | 'QUALITY_INSPECTOR';
export type UpdateVisibility = 'ALL' | 'INTERNAL' | 'MANAGEMENT_ONLY';

export interface ProjectAssignment {
  id: string;
  constructionProjectId: string;
  employeeId: string;
  role: ProjectRole;
  assignedDate: string;
  isActive: boolean;
  employee?: any;
  constructionProject?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TowerProgress {
  id: string;
  constructionProjectId: string;
  towerId: string;
  phase: ConstructionPhase;
  phaseProgress: number;
  overallProgress: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status: PhaseStatus;
  notes?: string;
  tower?: any;
  constructionProject?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FlatProgress {
  id: string;
  constructionProjectId: string;
  flatId: string;
  phase: ConstructionPhase;
  phaseProgress: number;
  overallProgress: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status: PhaseStatus;
  notes?: string;
  flat?: any;
  constructionProject?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DevelopmentUpdate {
  id: string;
  constructionProjectId: string;
  updateDate: string;
  updateTitle: string;
  updateDescription: string;
  feedbackNotes?: string;
  images?: string[];
  attachments?: string[];
  visibility: UpdateVisibility;
  createdBy: string;
  creator?: any;
  constructionProject?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TowerProgressSummary {
  towerId: string;
  towerName: string;
  averageProgress: number;
  phasesStarted: number;
  phasesCompleted: number;
}

export interface FlatProgressSummary {
  flatId: string;
  flatNumber: string;
  towerName: string;
  averageProgress: number;
  phasesStarted: number;
  phasesCompleted: number;
}

export interface UpdateStatistics {
  totalUpdates: number;
  updatesWithImages: number;
  updatesWithAttachments: number;
  recentUpdates: number;
  totalImages: number;
  totalAttachments: number;
}

export interface UpdateTimeline {
  month: string;
  updates: DevelopmentUpdate[];
  count: number;
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

  // ===== NEW PHASE 5 METHODS =====

  // Project Assignments
  async assignEngineer(projectId: string, data: Partial<ProjectAssignment>) {
    return await api.post<ProjectAssignment>(`${this.projectsUrl}/${projectId}/assignments`, data);
  }

  async getProjectAssignments(projectId: string) {
    return await api.get<ProjectAssignment[]>(`${this.projectsUrl}/${projectId}/assignments`);
  }

  async getMyProjects() {
    return await api.get<ProjectAssignment[]>(`${this.projectsUrl}/my-projects`);
  }

  async getAssignment(assignmentId: string) {
    return await api.get<ProjectAssignment>(`${this.projectsUrl}/assignments/${assignmentId}`);
  }

  async deactivateAssignment(assignmentId: string) {
    return await api.patch<ProjectAssignment>(`${this.projectsUrl}/assignments/${assignmentId}/deactivate`);
  }

  async removeAssignment(assignmentId: string) {
    return await api.delete(`${this.projectsUrl}/assignments/${assignmentId}`);
  }

  async checkAccess(projectId: string, employeeId: string) {
    return await api.get<{ hasAccess: boolean }>(`${this.projectsUrl}/${projectId}/check-access/${employeeId}`);
  }

  async getEmployeeRole(projectId: string, employeeId: string) {
    return await api.get<{ role: ProjectRole | null }>(`${this.projectsUrl}/${projectId}/role/${employeeId}`);
  }

  // Tower Progress
  async createTowerProgress(projectId: string, towerId: string, data: Partial<TowerProgress>) {
    return await api.post<TowerProgress>(`${this.projectsUrl}/${projectId}/towers/${towerId}/progress`, data);
  }

  async updateTowerProgress(progressId: string, data: Partial<TowerProgress>) {
    return await api.put<TowerProgress>(`${this.projectsUrl}/tower-progress/${progressId}`, data);
  }

  async getTowerProgress(projectId: string, towerId: string, phase?: ConstructionPhase) {
    const url = phase
      ? `${this.projectsUrl}/${projectId}/towers/${towerId}/progress?phase=${phase}`
      : `${this.projectsUrl}/${projectId}/towers/${towerId}/progress`;
    return await api.get<TowerProgress | TowerProgress[]>(url);
  }

  async getTowerPhaseProgress(towerId: string, phase: ConstructionPhase) {
    return await api.get<TowerProgress>(`${this.projectsUrl}/towers/${towerId}/progress/${phase}`);
  }

  async getTowerSummary(projectId: string) {
    return await api.get<TowerProgressSummary[]>(`${this.projectsUrl}/${projectId}/tower-summary`);
  }

  async initializeTowerPhases(projectId: string, towerId: string) {
    return await api.post<TowerProgress[]>(`${this.projectsUrl}/${projectId}/towers/${towerId}/initialize`);
  }

  async calculateTowerProgress(towerId: string, projectId: string) {
    return await api.post<{ overallProgress: number }>(`${this.projectsUrl}/towers/${towerId}/calculate-progress?projectId=${projectId}`);
  }

  async getProjectTowersCompletion(projectId: string) {
    return await api.get<{ completion: number }>(`${this.projectsUrl}/${projectId}/towers-completion`);
  }

  async deleteTowerProgress(progressId: string) {
    return await api.delete(`${this.projectsUrl}/tower-progress/${progressId}`);
  }

  async getAllTowerProgress(projectId: string) {
    return await api.get<TowerProgress[]>(`${this.projectsUrl}/${projectId}/all-tower-progress`);
  }

  // Flat Progress
  async createFlatProgress(projectId: string, flatId: string, data: Partial<FlatProgress>) {
    return await api.post<FlatProgress>(`${this.projectsUrl}/${projectId}/flats/${flatId}/progress`, data);
  }

  async updateFlatProgress(progressId: string, data: Partial<FlatProgress>) {
    return await api.put<FlatProgress>(`${this.projectsUrl}/flat-progress/${progressId}`, data);
  }

  async getFlatProgress(projectId: string, flatId: string, phase?: ConstructionPhase) {
    const url = phase
      ? `${this.projectsUrl}/${projectId}/flats/${flatId}/progress?phase=${phase}`
      : `${this.projectsUrl}/${projectId}/flats/${flatId}/progress`;
    return await api.get<FlatProgress | FlatProgress[]>(url);
  }

  async getFlatPhaseProgress(flatId: string, phase: ConstructionPhase) {
    return await api.get<FlatProgress>(`${this.projectsUrl}/flats/${flatId}/progress/${phase}`);
  }

  async getFlatSummary(projectId: string) {
    return await api.get<FlatProgressSummary[]>(`${this.projectsUrl}/${projectId}/flat-summary`);
  }

  async getFlatsReadyForHandover(projectId: string) {
    return await api.get<FlatProgress[]>(`${this.projectsUrl}/${projectId}/flats-ready-for-handover`);
  }

  async getFlatProgressByTower(projectId: string, towerId: string) {
    return await api.get<FlatProgress[]>(`${this.projectsUrl}/${projectId}/towers/${towerId}/flats-progress`);
  }

  async initializeFlatPhases(projectId: string, flatId: string) {
    return await api.post<FlatProgress[]>(`${this.projectsUrl}/${projectId}/flats/${flatId}/initialize`);
  }

  async calculateFlatProgress(flatId: string, projectId: string) {
    return await api.post<{ overallProgress: number }>(`${this.projectsUrl}/flats/${flatId}/calculate-progress?projectId=${projectId}`);
  }

  async getProjectFlatsCompletion(projectId: string) {
    return await api.get<{ completion: number }>(`${this.projectsUrl}/${projectId}/flats-completion`);
  }

  async deleteFlatProgress(progressId: string) {
    return await api.delete(`${this.projectsUrl}/flat-progress/${progressId}`);
  }

  async getAllFlatProgress(projectId: string) {
    return await api.get<FlatProgress[]>(`${this.projectsUrl}/${projectId}/all-flat-progress`);
  }

  // Development Updates
  async createDevelopmentUpdate(projectId: string, data: Partial<DevelopmentUpdate>) {
    return await api.post<DevelopmentUpdate>(`${this.projectsUrl}/${projectId}/development-updates`, data);
  }

  async getDevelopmentUpdates(projectId: string) {
    return await api.get<DevelopmentUpdate[]>(`${this.projectsUrl}/${projectId}/development-updates`);
  }

  async getDevelopmentUpdate(updateId: string) {
    return await api.get<DevelopmentUpdate>(`${this.projectsUrl}/development-updates/${updateId}`);
  }

  async updateDevelopmentUpdate(updateId: string, data: Partial<DevelopmentUpdate>) {
    return await api.put<DevelopmentUpdate>(`${this.projectsUrl}/development-updates/${updateId}`, data);
  }

  async deleteDevelopmentUpdate(updateId: string) {
    return await api.delete(`${this.projectsUrl}/development-updates/${updateId}`);
  }

  async addImagesToUpdate(updateId: string, images: string[]) {
    return await api.post<DevelopmentUpdate>(`${this.projectsUrl}/development-updates/${updateId}/images`, { images });
  }

  async removeImageFromUpdate(updateId: string, imageUrl: string) {
    return await api.delete<DevelopmentUpdate>(`${this.projectsUrl}/development-updates/${updateId}/images`, { data: { imageUrl } });
  }

  async addAttachmentsToUpdate(updateId: string, attachments: string[]) {
    return await api.post<DevelopmentUpdate>(`${this.projectsUrl}/development-updates/${updateId}/attachments`, { attachments });
  }

  async getRecentUpdates(projectId: string, days: number = 7) {
    return await api.get<DevelopmentUpdate[]>(`${this.projectsUrl}/${projectId}/development-updates/recent?days=${days}`);
  }

  async getUpdatesWithImages(projectId: string) {
    return await api.get<DevelopmentUpdate[]>(`${this.projectsUrl}/${projectId}/development-updates/with-images`);
  }

  async getUpdatesByVisibility(projectId: string, visibility: UpdateVisibility) {
    return await api.get<DevelopmentUpdate[]>(`${this.projectsUrl}/${projectId}/development-updates/visibility/${visibility}`);
  }

  async getUpdatesTimeline(projectId: string) {
    return await api.get<UpdateTimeline[]>(`${this.projectsUrl}/${projectId}/development-updates/timeline`);
  }

  async getUpdateStatistics(projectId: string) {
    return await api.get<UpdateStatistics>(`${this.projectsUrl}/${projectId}/development-updates/statistics`);
  }
}

// Expose both default and named exports for convenience
export const constructionService = new ConstructionService();
export default constructionService;
