import { ConstructionProject } from './construction-project.entity';
import { Employee } from '../../employees/entities/employee.entity';
export declare class DailyProgressReport {
    id: string;
    constructionProjectId: string;
    constructionProject: ConstructionProject;
    reportDate: Date;
    reportedBy: string;
    reporter: Employee;
    workCompleted: string;
    workPlannedForNextDay: string;
    progressPercentage: number;
    workersPresent: number;
    workersAbsent: number;
    weatherConditions: string;
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
    get totalWorkers(): number;
    get attendancePercentage(): number;
    get isRecent(): boolean;
    get hasPhotos(): boolean;
    get photoCount(): number;
}
