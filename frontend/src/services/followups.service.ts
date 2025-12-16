/**
 * @file followups.service.ts
 * @description Service for FollowUps API
 */

import { apiService } from './api';
import { FollowUp, CreateFollowUpDto, FollowUpStatistics } from '@/types/sales-crm.types';

class FollowUpsService {
  /**
   * Create a new followup
   */
  async create(data: CreateFollowUpDto): Promise<FollowUp> {
    const response = await apiService.post<FollowUp>('/followups', data);
    return response;
  }

  /**
   * Get all followups for a lead
   */
  async findByLead(leadId: string): Promise<FollowUp[]> {
    const response = await apiService.get<FollowUp[]>(`/followups/lead/${leadId}`);
    return response;
  }

  /**
   * Get all followups for a lead (alias for findByLead)
   */
  async getFollowupsByLead(leadId: string): Promise<FollowUp[]> {
    return this.findByLead(leadId);
  }

  /**
   * Get followups by salesperson
   */
  async findBySalesPerson(
    salesPersonId: string,
    startDate?: string,
    endDate?: string
  ): Promise<FollowUp[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get<FollowUp[]>(
      `/followups/salesperson/${salesPersonId}?${params.toString()}`
    );
    return response;
  }

  /**
   * Get upcoming followups for a salesperson
   */
  async getUpcomingFollowUps(salesPersonId: string): Promise<FollowUp[]> {
    const response = await apiService.get<FollowUp[]>(
      `/followups/salesperson/${salesPersonId}/upcoming`
    );
    return response;
  }

  /**
   * Get followup statistics
   */
  async getStatistics(
    salesPersonId: string,
    startDate: string,
    endDate: string
  ): Promise<FollowUpStatistics> {
    const response = await apiService.get<FollowUpStatistics>(
      `/followups/salesperson/${salesPersonId}/statistics?startDate=${startDate}&endDate=${endDate}`
    );
    return response;
  }

  /**
   * Get site visit statistics
   */
  async getSiteVisitStatistics(
    salesPersonId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const response = await apiService.get(
      `/followups/salesperson/${salesPersonId}/site-visit-statistics?startDate=${startDate}&endDate=${endDate}`
    );
    return response;
  }

  /**
   * Get a single followup by ID
   */
  async findOne(id: string): Promise<FollowUp> {
    const response = await apiService.get<FollowUp>(`/followups/${id}`);
    return response;
  }

  /**
   * Update a followup
   */
  async update(id: string, data: Partial<CreateFollowUpDto>): Promise<FollowUp> {
    const response = await apiService.patch<FollowUp>(`/followups/${id}`, data);
    return response;
  }

  /**
   * Delete a followup
   */
  async remove(id: string): Promise<void> {
    await apiService.delete(`/followups/${id}`);
  }
}

export const followupsService = new FollowUpsService();


