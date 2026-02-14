import { EmploymentType, Department } from '../entities/employee.entity';
export declare class CreateEmployeeDto {
    employeeCode: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    alternatePhone?: string;
    profilePicture?: string;
    dateOfBirth?: string | Date;
    gender?: string;
    currentAddress?: string;
    department?: Department;
    designation?: string;
    employmentType?: EmploymentType;
    joiningDate?: string | Date;
    basicSalary?: number;
    houseRentAllowance?: number;
    transportAllowance?: number;
    medicalAllowance?: number;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    aadharNumber?: string;
    panNumber?: string;
    notes?: string;
}
