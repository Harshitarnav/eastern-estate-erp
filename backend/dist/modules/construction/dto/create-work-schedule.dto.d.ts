import { WorkScheduleStatus } from '../entities/work-schedule.entity';
export declare class CreateWorkScheduleDto {
    constructionProjectId: string;
    taskName: string;
    taskDescription?: string;
    assignedTo: string;
    startDate: string;
    endDate: string;
    status?: WorkScheduleStatus;
    dependencies?: string[];
    progressPercentage?: number;
    notes?: string;
}
