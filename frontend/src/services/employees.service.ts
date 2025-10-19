import api from './api';

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  department: string;
  designation: string;
  employmentType: string;
  employmentStatus: string;
  joiningDate: Date;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  casualLeaveBalance?: number;
  sickLeaveBalance?: number;
  earnedLeaveBalance?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  employmentStatus?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedEmployeeResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const employeesService = {
  async getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedEmployeeResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/employees?${params.toString()}`);
    return response;
  },

  async getEmployee(id: string): Promise<Employee> {
    const response = await api.get(`/employees/${id}`);
    return response;
  },

  async createEmployee(data: any): Promise<Employee> {
    const response = await api.post('/employees', data);
    return response;
  },

  async updateEmployee(id: string, data: any): Promise<Employee> {
    const response = await api.patch(`/employees/${id}`, data);
    return response;
  },

  async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async getStatistics(): Promise<any> {
    const response = await api.get('/employees/statistics');
    return response;
  },
};
