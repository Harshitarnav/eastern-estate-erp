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
  profilePicture?: string;
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
   isActive?: boolean;
}

/** Salary rows used to show month-wise leave on the employee profile */
export interface EmployeePayrollLeaveRow {
  id: string;
  paymentMonth: string;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  presentDays?: number;
  workingDays?: number;
  paymentStatus: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Per-calendar-day leave entries (full or half day); kept as long-term history. */
export interface EmployeeLeaveDayRow {
  id: string;
  leaveDate: string;
  dayFraction: number;
  leaveKind: 'PAID' | 'UNPAID' | 'ABSENT';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function mapLeaveDayRow(r: any): EmployeeLeaveDayRow {
  const d = r.leaveDate;
  const leaveDate =
    typeof d === 'string'
      ? d.slice(0, 10)
      : d instanceof Date
        ? d.toISOString().slice(0, 10)
        : String(d).slice(0, 10);
  return {
    id: r.id,
    leaveDate,
    dayFraction: Number(r.dayFraction),
    leaveKind: r.leaveKind,
    notes: r.notes ?? null,
    createdAt: r.createdAt ? String(r.createdAt) : undefined,
    updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
  };
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
    if (filters.employmentStatus) params.append('employmentStatus', filters.employmentStatus);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const response = await api.get<EmployeesResponse>(`/employees?${params.toString()}`);
    return response;
  }

  /**
   * Get all employees
   */
  async getAll(): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees');
    return response || [];
  }

  /**
   * Search employees by name, email, or position
   */
  async search(query: string): Promise<Employee[]> {
    if (!query.trim()) {
      return this.getAll();
    }
    const response = await api.get<Employee[]>(`/employees/search?q=${encodeURIComponent(query)}`);
    return response || [];
  }

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);
    // api.get already returns the data payload, so return directly
    return response;
  }

  /**
   * Alias for getById (backward compatibility)
   */
  async getEmployee(id: string): Promise<Employee> {
    return this.getById(id);
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    return api.post<Employee>('/employees', data);
  }

  /**
   * Update employee by ID
   */
  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return api.put<Employee>(`/employees/${id}`, data);
  }

  /**
   * Get active employees only
   */
  async getActive(): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees?isActive=true');
    return response || [];
  }

  /**
   * Payroll / salary records for an employee (used for month-wise leave taken).
   */
  async getPayrollLeaveRecords(employeeId: string): Promise<EmployeePayrollLeaveRow[]> {
    const params = new URLSearchParams({ employeeId });
    const rows = await api.get<any[]>(`/employees/salary-payments?${params.toString()}`);
    const list = Array.isArray(rows) ? rows : [];
    return list.map((r) => ({
      id: r.id,
      paymentMonth: r.paymentMonth,
      paidLeaveDays: Number(r.paidLeaveDays ?? 0),
      unpaidLeaveDays: Number(r.unpaidLeaveDays ?? 0),
      absentDays: Number(r.absentDays ?? 0),
      presentDays: r.presentDays !== undefined ? Number(r.presentDays) : undefined,
      workingDays: r.workingDays !== undefined ? Number(r.workingDays) : undefined,
      paymentStatus: String(r.paymentStatus ?? ''),
      notes: r.notes ?? null,
      createdAt: r.createdAt ? String(r.createdAt) : undefined,
      updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
    }));
  }

  /** Calendar leave ledger (exact dates). */
  async getLeaveDays(employeeId: string): Promise<EmployeeLeaveDayRow[]> {
    const rows = await api.get<any[]>(`/employees/${employeeId}/leave-days`);
    const list = Array.isArray(rows) ? rows : [];
    return list.map(mapLeaveDayRow);
  }

  async createLeaveDay(
    employeeId: string,
    body: { leaveDate: string; dayFraction: number; leaveKind: string; notes?: string },
  ): Promise<EmployeeLeaveDayRow> {
    const r = await api.post<any>(`/employees/${employeeId}/leave-days`, body);
    return mapLeaveDayRow(r);
  }

  async updateLeaveDay(
    employeeId: string,
    leaveDayId: string,
    body: { leaveDate?: string; dayFraction?: number; leaveKind?: string; notes?: string },
  ): Promise<EmployeeLeaveDayRow> {
    const r = await api.patch<any>(`/employees/${employeeId}/leave-days/${leaveDayId}`, body);
    return mapLeaveDayRow(r);
  }

  async deleteLeaveDay(employeeId: string, leaveDayId: string): Promise<void> {
    await api.delete(`/employees/${employeeId}/leave-days/${leaveDayId}`);
  }
}

export const employeesService = new EmployeesService();
export default employeesService;
