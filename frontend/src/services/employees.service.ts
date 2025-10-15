import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    const response = await axios.get(`${API_URL}/employees`, { params: filters });
    return response.data;
  },

  async getEmployee(id: string): Promise<Employee> {
    const response = await axios.get(`${API_URL}/employees/${id}`);
    return response.data;
  },

  async createEmployee(data: any): Promise<Employee> {
    const response = await axios.post(`${API_URL}/employees`, data);
    return response.data;
  },

  async updateEmployee(id: string, data: any): Promise<Employee> {
    const response = await axios.patch(`${API_URL}/employees/${id}`, data);
    return response.data;
  },

  async deleteEmployee(id: string): Promise<void> {
    await axios.delete(`${API_URL}/employees/${id}`);
  },

  async getStatistics(): Promise<any> {
    const response = await axios.get(`${API_URL}/employees/statistics`);
    return response.data;
  },
};
