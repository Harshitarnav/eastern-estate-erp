import { Material } from './material.entity';
import { Employee } from '../../employees/entities/employee.entity';
export declare class MaterialExit {
    id: string;
    materialId: string;
    material: Material;
    constructionProjectId: string;
    quantity: number;
    purpose: string;
    issuedTo: string;
    issuedToEmployee: Employee;
    approvedBy: string;
    approvedByEmployee: Employee;
    exitDate: Date;
    returnExpected: boolean;
    returnDate: Date;
    returnQuantity: number;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
    get isReturned(): boolean;
    get isOverdueForReturn(): boolean;
    get pendingReturnQuantity(): number;
}
