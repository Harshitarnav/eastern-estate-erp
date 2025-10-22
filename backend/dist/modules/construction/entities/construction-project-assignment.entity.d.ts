import { ConstructionProject } from './construction-project.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
export declare enum AssignmentRole {
    PROJECT_MANAGER = "PROJECT_MANAGER",
    SITE_ENGINEER = "SITE_ENGINEER",
    SUPERVISOR = "SUPERVISOR",
    FOREMAN = "FOREMAN",
    QUALITY_INSPECTOR = "QUALITY_INSPECTOR"
}
export declare class ConstructionProjectAssignment {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    employeeId: string;
    employee: Employee;
    role: AssignmentRole;
    assignedDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    creator: User;
}
