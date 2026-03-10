import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Unit / Tower-wise outstanding report.
   * Query params: propertyId?, towerId?, status?
   */
  @Get('outstanding')
  async getOutstanding(
    @Query('propertyId') propertyId?: string,
    @Query('towerId') towerId?: string,
    @Query('status') status?: string,
  ) {
    return this.reportsService.getOutstandingReport({
      propertyId: propertyId || undefined,
      towerId: towerId || undefined,
      status: status || undefined,
    });
  }

  /**
   * Payment collection report.
   * Query params: propertyId?, towerId?, startDate?, endDate?, paymentMethod?
   */
  @Get('collection')
  async getCollection(
    @Query('propertyId') propertyId?: string,
    @Query('towerId') towerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.reportsService.getCollectionReport({
      propertyId: propertyId || undefined,
      towerId: towerId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      paymentMethod: paymentMethod || undefined,
    });
  }
}
