import { Employee } from '../../employees/entities/employee.entity';
export declare enum ChatGroupType {
    GROUP = "GROUP",
    DIRECT = "DIRECT"
}
export declare class ChatGroup {
    id: string;
    name: string;
    description: string;
    groupType: ChatGroupType;
    avatarUrl: string;
    createdByEmployeeId: string;
    createdBy: Employee;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
