export declare class CreateDailyProgressReportDto {
    constructionProjectId: string;
    reportedBy: string;
    reportDate: string;
    workCompleted: string;
    workPlannedForNextDay?: string;
    progressPercentage?: number;
    workersPresent?: number;
    workersAbsent?: number;
    weatherConditions?: string;
    photos?: string[];
}
