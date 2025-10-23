/**
 * @file sales-tasks.service.ts
 * @description Service for Sales Tasks API
 */

import { apiService } from './api';
import { SalesTask, CreateSalesTaskDto, TaskStatistics, TaskStatus } from '@/types/sales-crm.types';

class SalesTasksService {
  /**
   * Create a new task
   */
  async create(data: CreateSalesTaskDto): Promise<SalesTask> {
    const response = await apiService.post<SalesTask>('/sales-tasks', data);
    return response;
  }

  /**
   * Get all tasks for a user
   */
  async findByUser(userId: string, status?: TaskStatus): Promise<SalesTask[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiService.get<SalesTask[]>(`/sales-tasks/user/${userId}${params}`);
    return response;
  }

  /**
   * Get today's tasks
   */
  async getTodayTasks(userId: string): Promise<SalesTask[]> {
    const response = await apiService.get<SalesTask[]>(`/sales-tasks/user/${userId}/today`);
    return response;
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(userId: string, days: number = 7): Promise<SalesTask[]> {
    const response = await apiService.get<SalesTask[]>(
      `/sales-tasks/user/${userId}/upcoming?days=${days}`
    );
    return response;
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId: string): Promise<SalesTask[]> {
    const response = await apiService.get<SalesTask[]>(`/sales-tasks/user/${userId}/overdue`);
    return response;
  }

  /**
   * Get task statistics
   */
  async getStatistics(userId: string, startDate?: string, endDate?: string): Promise<TaskStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get<TaskStatistics>(
      `/sales-tasks/user/${userId}/statistics?${params.toString()}`
    );
    return response;
  }

  /**
   * Get tasks by date range
   */
  async getTasksByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, SalesTask[]>> {
    const response = await apiService.get<Record<string, SalesTask[]>>(
      `/sales-tasks/user/${userId}/by-date?startDate=${startDate}&endDate=${endDate}`
    );
    return response;
  }

  /**
   * Get a single task by ID
   */
  async findOne(id: string): Promise<SalesTask> {
    const response = await apiService.get<SalesTask>(`/sales-tasks/${id}`);
    return response;
  }

  /**
   * Update a task
   */
  async update(id: string, data: Partial<CreateSalesTaskDto>): Promise<SalesTask> {
    const response = await apiService.patch<SalesTask>(`/sales-tasks/${id}`, data);
    return response;
  }

  /**
   * Complete a task
   */
  async completeTask(id: string, outcome?: string, notes?: string): Promise<SalesTask> {
    const response = await apiService.patch<SalesTask>(`/sales-tasks/${id}/complete`, {
      outcome,
      notes,
    });
    return response;
  }

  /**
   * Update task status
   */
  async updateStatus(id: string, status: TaskStatus): Promise<SalesTask> {
    const response = await apiService.patch<SalesTask>(`/sales-tasks/${id}/status`, { status });
    return response;
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string, reason?: string): Promise<SalesTask> {
    const response = await apiService.patch<SalesTask>(`/sales-tasks/${id}/cancel`, { reason });
    return response;
  }

  /**
   * Delete a task
   */
  async remove(id: string): Promise<void> {
    await apiService.delete(`/sales-tasks/${id}`);
  }
}

export const salesTasksService = new SalesTasksService();



