/**
 * @file create-sales-task.dto.ts
 * @description DTO for creating a sales task
 * @module LeadsModule
 */

import { IsUUID, IsDate, IsEnum, IsInt, IsString, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskType, TaskPriority, TaskStatus } from '../entities/sales-task.entity';

export class CreateSalesTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskType)
  taskType: TaskType;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsUUID()
  assignedTo: string;

  @IsOptional()
  @IsUUID()
  assignedBy?: string;

  dueDate: string | Date;

  @IsOptional()
  @IsString()
  dueTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  locationDetails?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsBoolean()
  sendReminder?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  reminderBeforeMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrencePattern?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}



