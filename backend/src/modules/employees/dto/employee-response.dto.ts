export class EmployeeResponseDto {
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedEmployeeResponseDto {
  data: EmployeeResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
