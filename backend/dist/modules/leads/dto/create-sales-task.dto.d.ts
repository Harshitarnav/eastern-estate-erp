import { TaskType, TaskPriority, TaskStatus } from '../entities/sales-task.entity';
export declare class CreateSalesTaskDto {
    title: string;
    description?: string;
    taskType: TaskType;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedTo: string;
    assignedBy?: string;
    dueDate: Date;
    dueTime?: string;
    estimatedDurationMinutes?: number;
    leadId?: string;
    customerId?: string;
    propertyId?: string;
    location?: string;
    locationDetails?: string;
    attendees?: string[];
    meetingLink?: string;
    sendReminder?: boolean;
    reminderBeforeMinutes?: number;
    notes?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
    createdBy?: string;
}
