import api from './api';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeCode: string;
  designation: string;
  department: string;
  employmentType: string;
  employmentStatus: string;
  joiningDate: string;
  grossSalary: number;
  casualLeaveBalance?: number;
  sickLeaveBalance?: number;
  earnedLeaveBalance?: number;
  [key: string]: any;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  employmentStatus?: string;
}

interface EmployeesResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class EmployeesService {
  /**
   * Get employees with filters and pagination
   */
  async getEmployees(filters: EmployeeFilters = {}): Promise<EmployeesResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.employmentStatus) params.append('status', filters.employmentStatus);

    const response = await api.get<EmployeesResponse>(`/employees?${params.toString()}`);
    return response.data;
  }

  /**
   * Get all employees
   */
  async getAll(): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees');
    return response.data || [];
  }

  /**
   * Search employees by name, email, or position
   */
  async search(query: string): Promise<Employee[]> {
    if (!query.trim()) {
      return this.getAll();
    }
    const response = await api.get<Employee[]>(`/employees/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  }

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);
    return response.data;
  }

  /**
   * Get active employees only
   */
  async getActive(): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees?isActive=true');
    return response.data || [];
  }
}

export const employeesService = new EmployeesService();
export default employeesService;
