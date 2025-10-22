import { ConstructionProject } from './construction-project.entity';
import { Employee } from '../../employees/entities/employee.entity';
export declare enum WorkScheduleStatus {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DELAYED = "DELAYED",
    CANCELLED = "CANCELLED"
}
export declare class WorkSchedule {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    taskName: string;
    taskDescription: string;
    assignedTo: string;
    assignedEngineer: Employee;
    startDate: Date;
    endDate: Date;
    status: WorkScheduleStatus;
    dependencies: string[];
    progressPercentage: number;
    actualStartDate: Date;
    actualEndDate: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    get isStarted(): boolean;
    get isCompleted(): boolean;
    get isDelayed(): boolean;
    get hasDependencies(): boolean;
    get plannedDuration(): number;
    get actualDuration(): number | null;
    get daysRemaining(): number;
    get delayInDays(): number;
}
