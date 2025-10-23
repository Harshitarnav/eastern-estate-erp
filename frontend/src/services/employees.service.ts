import api from './api';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar?: string;
  employeeId?: string;
  isActive?: boolean;
}

class EmployeesService {
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

export default new EmployeesService();
