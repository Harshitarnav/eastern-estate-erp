/**
 * @file sales-dashboard.service.ts
 * @description Service for Sales Dashboard API
 */

import { apiService } from './api';
import { DashboardMetrics } from '@/types/sales-crm.types';

class SalesDashboardService {
  /**
   * Get comprehensive dashboard metrics for a sales person
   */
  async getDashboardMetrics(salesPersonId: string): Promise<DashboardMetrics> {
    const response = await apiService.get<DashboardMetrics>(`/sales-dashboard/${salesPersonId}`);
    return response;
  }
}

export const salesDashboardService = new SalesDashboardService();


