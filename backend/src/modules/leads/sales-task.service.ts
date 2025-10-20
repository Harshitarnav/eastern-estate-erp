/**
 * @file sales-task.service.ts
 * @description Service for managing sales tasks and personal scheduler
 * @module LeadsModule
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, In } from 'typeorm';
import { SalesTask, TaskStatus } from './entities/sales-task.entity';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
import { startOfDay, endOfDay, addDays, isBefore } from 'date-fns';

@Injectable()
export class SalesTaskService {
  private readonly logger = new Logger(SalesTaskService.name);

  constructor(
    @InjectRepository(SalesTask)
    private salesTaskRepository: Repository<SalesTask>,
  ) {}

  /**
   * Create a new sales task
   */
  async create(createTaskDto: CreateSalesTaskDto): Promise<SalesTask> {
    this.logger.log(`Creating task: ${createTaskDto.title} for ${createTaskDto.assignedTo}`);
    const task = this.salesTaskRepository.create(createTaskDto);
    return this.salesTaskRepository.save(task);
  }

  /**
   * Get all tasks for a specific user
   */
  async findByUser(userId: string, status?: TaskStatus): Promise<SalesTask[]> {
    const where: any = {
      assignedTo: userId,
      isActive: true,
    };

    if (status) {
      where.status = status;
    }

    return this.salesTaskRepository.find({
      where,
      order: { dueDate: 'ASC', dueTime: 'ASC' },
      relations: ['lead', 'assignedByUser'],
    });
  }

  /**
   * Get tasks for today
   */
  async getTodayTasks(userId: string): Promise<SalesTask[]> {
    const today = startOfDay(new Date());
    const endToday = endOfDay(new Date());

    return this.salesTaskRepository.find({
      where: {
        assignedTo: userId,
        dueDate: Between(today, endToday),
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        isActive: true,
      },
      order: { dueTime: 'ASC' },
      relations: ['lead'],
    });
  }

  /**
   * Get upcoming tasks (next 7 days)
   */
  async getUpcomingTasks(userId: string, days: number = 7): Promise<SalesTask[]> {
    const today = startOfDay(new Date());
    const futureDate = endOfDay(addDays(today, days));

    return this.salesTaskRepository.find({
      where: {
        assignedTo: userId,
        dueDate: Between(today, futureDate),
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        isActive: true,
      },
      order: { dueDate: 'ASC', dueTime: 'ASC' },
      relations: ['lead'],
    });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId: string): Promise<SalesTask[]> {
    const today = startOfDay(new Date());

    const tasks = await this.salesTaskRepository.find({
      where: {
        assignedTo: userId,
        dueDate: LessThan(today),
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        isActive: true,
      },
      order: { dueDate: 'ASC' },
      relations: ['lead'],
    });

    // Auto-mark as overdue
    const overdueIds = tasks.map(t => t.id);
    if (overdueIds.length > 0) {
      await this.salesTaskRepository.update(
        { id: In(overdueIds) },
        { status: TaskStatus.OVERDUE },
      );
    }

    return tasks;
  }

  /**
   * Get tasks needing reminders
   */
  async getTasksNeedingReminders(): Promise<SalesTask[]> {
    const now = new Date();

    // Find tasks where dueDate + reminderBeforeMinutes is approaching
    const tasks = await this.salesTaskRepository.find({
      where: {
        sendReminder: true,
        reminderSent: false,
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        isActive: true,
      },
      relations: ['assignedToUser', 'lead'],
    });

    // Filter tasks that need reminders based on reminderBeforeMinutes
    return tasks.filter(task => {
      const reminderTime = new Date(task.dueDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - task.reminderBeforeMinutes);
      return isBefore(reminderTime, now) && isBefore(now, task.dueDate);
    });
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(taskId: string): Promise<void> {
    await this.salesTaskRepository.update(taskId, {
      reminderSent: true,
      reminderSentAt: new Date(),
    });
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, outcome?: string, notes?: string): Promise<SalesTask> {
    const updateData: any = {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
    };

    if (outcome) updateData.outcome = outcome;
    if (notes) updateData.notes = notes;

    await this.salesTaskRepository.update(taskId, updateData);
    return this.findOne(taskId);
  }

  /**
   * Update task status
   */
  async updateStatus(taskId: string, status: TaskStatus): Promise<SalesTask> {
    const updateData: any = { status };

    if (status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    await this.salesTaskRepository.update(taskId, updateData);
    return this.findOne(taskId);
  }

  /**
   * Get task statistics for a user
   */
  async getStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = {
      assignedTo: userId,
      isActive: true,
    };

    if (startDate && endDate) {
      where.dueDate = Between(startDate, endDate);
    }

    const tasks = await this.salesTaskRepository.find({ where });

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      overdue: tasks.filter(t => t.status === TaskStatus.OVERDUE).length,
      cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED).length,
      byType: this.groupByType(tasks),
      completionRate: this.calculateCompletionRate(tasks),
      avgCompletionTime: this.calculateAvgCompletionTime(tasks),
    };
  }

  /**
   * Get tasks grouped by date
   */
  async getTasksByDateRange(userId: string, startDate: Date, endDate: Date): Promise<any> {
    const tasks = await this.salesTaskRepository.find({
      where: {
        assignedTo: userId,
        dueDate: Between(startDate, endDate),
        isActive: true,
      },
      order: { dueDate: 'ASC', dueTime: 'ASC' },
      relations: ['lead'],
    });

    // Group by date
    const groupedTasks: Record<string, SalesTask[]> = {};
    tasks.forEach(task => {
      const dateKey = task.dueDate.toISOString().split('T')[0];
      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = [];
      }
      groupedTasks[dateKey].push(task);
    });

    return groupedTasks;
  }

  /**
   * Find one task by ID
   */
  async findOne(id: string): Promise<SalesTask> {
    const task = await this.salesTaskRepository.findOne({
      where: { id, isActive: true },
      relations: ['lead', 'assignedToUser', 'assignedByUser'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(id: string, updateData: Partial<CreateSalesTaskDto>): Promise<SalesTask> {
    await this.salesTaskRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete (soft) a task
   */
  async remove(id: string): Promise<void> {
    await this.salesTaskRepository.update(id, { isActive: false });
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string, reason?: string): Promise<SalesTask> {
    const updateData: any = {
      status: TaskStatus.CANCELLED,
    };

    if (reason) {
      updateData.notes = reason;
    }

    await this.salesTaskRepository.update(id, updateData);
    return this.findOne(id);
  }

  // Helper methods
  private groupByType(tasks: SalesTask[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    tasks.forEach(task => {
      grouped[task.taskType] = (grouped[task.taskType] || 0) + 1;
    });
    return grouped;
  }

  private calculateCompletionRate(tasks: SalesTask[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return (completed / tasks.length) * 100;
  }

  private calculateAvgCompletionTime(tasks: SalesTask[]): number {
    const completedTasks = tasks.filter(t => t.completedAt);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const createdTime = new Date(task.createdAt).getTime();
      const completedTime = new Date(task.completedAt).getTime();
      return sum + (completedTime - createdTime);
    }, 0);

    return totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
  }
}



