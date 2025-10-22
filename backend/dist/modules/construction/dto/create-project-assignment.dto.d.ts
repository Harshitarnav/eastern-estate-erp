import { AssignmentRole } from '../entities/construction-project-assignment.entity';
export declare class CreateProjectAssignmentDto {
    constructionProjectId: string;
    employeeId: string;
    role: AssignmentRole;
    assignedDate?: string;
    isActive?: boolean;
}
