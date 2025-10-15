import { Department, EmploymentStatus } from '../entities/employee.entity';
export declare class QueryEmployeeDto {
    search?: string;
    department?: Department;
    employmentStatus?: EmploymentStatus;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
