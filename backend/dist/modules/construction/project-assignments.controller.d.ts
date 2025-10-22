import { ProjectAssignmentsService } from './project-assignments.service';
import { CreateProjectAssignmentDto } from './dto/create-project-assignment.dto';
export declare class ProjectAssignmentsController {
    private readonly projectAssignmentsService;
    constructor(projectAssignmentsService: ProjectAssignmentsService);
    assignEngineer(projectId: string, createDto: CreateProjectAssignmentDto, req: any): Promise<import("./entities/construction-project-assignment.entity").ConstructionProjectAssignment>;
    getProjectAssignments(projectId: string): Promise<import("./entities/construction-project-assignment.entity").ConstructionProjectAssignment[]>;
    getMyProjects(req: any): Promise<import("./entities/construction-project-assignment.entity").ConstructionProjectAssignment[]>;
    getAssignment(assignmentId: string): Promise<import("./entities/construction-project-assignment.entity").ConstructionProjectAssignment>;
    deactivateAssignment(assignmentId: string): Promise<import("./entities/construction-project-assignment.entity").ConstructionProjectAssignment>;
    removeAssignment(assignmentId: string): Promise<import("./entities/construction-project-assignment.entity").ConstructionProjectAssignment>;
    checkAccess(projectId: string, employeeId: string): Promise<{
        hasAccess: boolean;
    }>;
    getEmployeeRole(projectId: string, employeeId: string): Promise<{
        role: import("./entities/construction-project-assignment.entity").AssignmentRole;
    }>;
}
