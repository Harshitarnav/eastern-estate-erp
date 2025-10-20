import { User } from '../../users/entities/user.entity';
import { Lead } from './lead.entity';
export declare enum TaskType {
    FOLLOWUP_CALL = "FOLLOWUP_CALL",
    SITE_VISIT = "SITE_VISIT",
    MEETING = "MEETING",
    DOCUMENTATION = "DOCUMENTATION",
    PROPERTY_TOUR = "PROPERTY_TOUR",
    CLIENT_MEETING = "CLIENT_MEETING",
    INTERNAL_MEETING = "INTERNAL_MEETING",
    EMAIL_FOLLOWUP = "EMAIL_FOLLOWUP",
    NEGOTIATION = "NEGOTIATION",
    OTHER = "OTHER"
}
export declare enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    OVERDUE = "OVERDUE"
}
export declare class SalesTask {
    id: string;
    title: string;
    description: string;
    taskType: TaskType;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo: string;
    assignedToUser: User;
    assignedBy: string;
    assignedByUser: User;
    dueDate: Date;
    dueTime: string;
    estimatedDurationMinutes: number;
    completedAt: Date;
    leadId: string;
    lead: Lead;
    customerId: string;
    propertyId: string;
    location: string;
    locationDetails: string;
    attendees: string[];
    meetingLink: string;
    sendReminder: boolean;
    reminderBeforeMinutes: number;
    reminderSent: boolean;
    reminderSentAt: Date;
    outcome: string;
    notes: string;
    attachments: string[];
    isRecurring: boolean;
    recurrencePattern: string;
    parentTaskId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
