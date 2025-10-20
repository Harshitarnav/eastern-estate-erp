/**
 * @file sales-dashboard.controller.ts
 * @description Controller for sales person dashboard
 * @module LeadsModule
 */

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SalesDashboardService } from './sales-dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales-dashboard')
@UseGuards(JwtAuthGuard)
export class SalesDashboardController {
  constructor(private readonly salesDashboardService: SalesDashboardService) {}

  /**
   * Get comprehensive dashboard metrics for a sales person
   */
  @Get(':salesPersonId')
  getDashboardMetrics(@Param('salesPersonId') salesPersonId: string) {
    return this.salesDashboardService.getDashboardMetrics(salesPersonId);
  }
}



