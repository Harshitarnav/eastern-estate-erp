import { Property } from '../../properties/entities/property.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
export declare class ConstructionProject {
    id: string;
    propertyId: string;
    property: Property;
    projectName: string;
    startDate: Date;
    expectedCompletionDate: Date;
    actualCompletionDate: Date | null;
    status: string;
    overallProgress: number;
    budgetAllocated: number;
    budgetSpent: number;
    projectManagerId: string | null;
    projectManager: Employee;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    creator: User;
    updatedBy: string | null;
    updater: User;
}
