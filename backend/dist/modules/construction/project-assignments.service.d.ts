import { Repository } from 'typeorm';
import { ConstructionProjectAssignment } from './entities/construction-project-assignment.entity';
import { CreateProjectAssignmentDto } from './dto/create-project-assignment.dto';
export declare class ProjectAssignmentsService {
    private readonly assignmentsRepo;
    constructor(assignmentsRepo: Repository<ConstructionProjectAssignment>);
    create(createDto: CreateProjectAssignmentDto, createdBy: string): Promise<ConstructionProjectAssignment>;
    findByProject(projectId: string): Promise<ConstructionProjectAssignment[]>;
    findByEmployee(employeeId: string): Promise<ConstructionProjectAssignment[]>;
    findOne(id: string): Promise<ConstructionProjectAssignment>;
    deactivate(id: string): Promise<ConstructionProjectAssignment>;
    remove(id: string): Promise<ConstructionProjectAssignment>;
    getEmployeeProjects(employeeId: string): Promise<string[]>;
    hasAccess(employeeId: string, projectId: string): Promise<boolean>;
    getEmployeeRole(employeeId: string, projectId: string): Promise<import("./entities/construction-project-assignment.entity").AssignmentRole>;
}
