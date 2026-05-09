import { Employee } from './employee.entity';
export declare enum EmployeeLeaveKind {
    PAID = "PAID",
    UNPAID = "UNPAID",
    ABSENT = "ABSENT"
}
export declare class EmployeeLeaveDay {
    id: string;
    employeeId: string;
    employee: Employee;
    leaveDate: Date;
    dayFraction: number;
    leaveKind: EmployeeLeaveKind;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
}
