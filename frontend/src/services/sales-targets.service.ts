/**
 * @file sales-targets.service.ts
 * @description Service for Sales Targets API
 */

import { apiService } from './api';
import { SalesTarget, CreateSalesTargetDto, TargetPeriod } from '@/types/sales-crm.types';

class SalesTargetsService {
  /**
   * Create a new sales target
   */
  async create(data: CreateSalesTargetDto): Promise<SalesTarget> {
    const response = await apiService.post<SalesTarget>('/sales-targets', data);
    return response;
  }

  /**
   * Get all targets for a salesperson
   */
  async findBySalesPerson(salesPersonId: string): Promise<SalesTarget[]> {
    const response = await apiService.get<SalesTarget[]>(`/sales-targets/salesperson/${salesPersonId}`);
    return response;
  }

  /**
   * Get active target for a salesperson
   */
  async getActiveTarget(salesPersonId: string, period?: TargetPeriod): Promise<SalesTarget> {
    const params = period ? `?period=${period}` : '';
    const response = await apiService.get<SalesTarget>(
      `/sales-targets/salesperson/${salesPersonId}/active${params}`
    );
    return response;
  }

  /**
   * Get team performance summary
   */
  async getTeamPerformanceSummary(teamMemberIds: string[]): Promise<any> {
    const response = await apiService.get(
      `/sales-targets/team/performance-summary?teamMemberIds=${teamMemberIds.join(',')}`
    );
    return response;
  }

  /**
   * Get team targets
   */
  async getTeamTargets(teamMemberIds: string[], period?: TargetPeriod): Promise<SalesTarget[]> {
    const params = new URLSearchParams({ teamMemberIds: teamMemberIds.join(',') });
    if (period) params.append('period', period);

    const response = await apiService.get<SalesTarget[]>(
      `/sales-targets/team/targets?${params.toString()}`
    );
    return response;
  }

  /**
   * Get a single target by ID
   */
  async findOne(id: string): Promise<SalesTarget> {
    const response = await apiService.get<SalesTarget>(`/sales-targets/${id}`);
    return response;
  }

  /**
   * Update a target
   */
  async update(id: string, data: Partial<CreateSalesTargetDto>): Promise<SalesTarget> {
    const response = await apiService.patch<SalesTarget>(`/sales-targets/${id}`, data);
    return response;
  }

  /**
   * Update achievement (recalculate from actual performance)
   */
  async updateAchievement(id: string): Promise<SalesTarget> {
    const response = await apiService.patch<SalesTarget>(`/sales-targets/${id}/update-achievement`, {});
    return response;
  }

  /**
   * Update self-target
   */
  async updateSelfTarget(
    id: string,
    selfTargetBookings: number,
    selfTargetRevenue: number,
    notes?: string
  ): Promise<SalesTarget> {
    const response = await apiService.patch<SalesTarget>(`/sales-targets/${id}/self-target`, {
      selfTargetBookings,
      selfTargetRevenue,
      notes,
    });
    return response;
  }

  /**
   * Mark incentive as paid
   */
  async markIncentivePaid(id: string): Promise<SalesTarget> {
    const response = await apiService.patch<SalesTarget>(`/sales-targets/${id}/mark-incentive-paid`, {});
    return response;
  }

  /**
   * Delete a target
   */
  async remove(id: string): Promise<void> {
    await apiService.delete(`/sales-targets/${id}`);
  }
}

export const salesTargetsService = new SalesTargetsService();


