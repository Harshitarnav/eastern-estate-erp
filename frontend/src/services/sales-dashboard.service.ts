/**
 * @file sales-dashboard.service.ts
 * @description Service for Sales Dashboard API
 */

import { apiService } from './api';
import { DashboardMetrics } from '@/types/sales-crm.types';

type DashboardFilters = {
  agentId?: string;
  propertyId?: string;
  towerId?: string;
  flatId?: string;
  dateFrom?: string;
  dateTo?: string;
};

class SalesDashboardService {
  /**
   * Get comprehensive dashboard metrics for a sales person
   */
  async getDashboardMetrics(
    salesPersonId: string,
    filters: DashboardFilters = {},
  ): Promise<DashboardMetrics> {
    const query = new URLSearchParams();
    if (filters.agentId) query.set('agentId', filters.agentId);
    if (filters.propertyId) query.set('propertyId', filters.propertyId);
    if (filters.towerId) query.set('towerId', filters.towerId);
    if (filters.flatId) query.set('flatId', filters.flatId);
    if (filters.dateFrom) query.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) query.set('dateTo', filters.dateTo);

    const qs = query.toString();
    const url = qs
      ? `/sales-dashboard/${salesPersonId}?${qs}`
      : `/sales-dashboard/${salesPersonId}`;

    const response = await apiService.get<DashboardMetrics>(url);
    return response;
  }
}

export const salesDashboardService = new SalesDashboardService();


