export declare class CreateConstructionProjectDto {
    propertyId: string;
    projectName: string;
    startDate: string;
    expectedCompletionDate: string;
    actualCompletionDate?: string;
    status?: string;
    overallProgress?: number;
    budgetAllocated?: number;
    budgetSpent?: number;
    projectManagerId?: string;
}
