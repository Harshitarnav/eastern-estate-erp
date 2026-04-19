import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Dashboard summary - all KPIs in one call.
   */
  @Get('dashboard')
  async getDashboard(
    @Query('propertyId') propertyId: string | undefined,
    @Req() req: any,
  ) {
    const accessible: string[] | null | undefined = req?.accessiblePropertyIds;

    // If caller is scoped and passed a propertyId, enforce intersection.
    // If no propertyId and caller is scoped, fall back to the single
    // property in their list (most common case). If they have multiple,
    // we can't transparently aggregate yet — return the first to avoid
    // cross-project leakage until a proper multi-property aggregator
    // lands.
    let effective = propertyId;
    if (accessible && accessible.length > 0) {
      if (propertyId && !accessible.includes(propertyId)) {
        // Deny by scoping to a nonexistent property id.
        effective = '00000000-0000-0000-0000-000000000000';
      } else if (!propertyId) {
        effective = accessible[0];
      }
    }

    return this.reportsService.getDashboard(effective);
  }

  /**
   * Unit / Tower-wise outstanding report.
   * Query params: propertyId?, towerId?, status?
   */
  @Get('outstanding')
  async getOutstanding(
    @Query('propertyId') propertyId: string | undefined,
    @Query('towerId') towerId: string | undefined,
    @Query('status') status: string | undefined,
    @Req() req: any,
  ) {
    const accessible: string[] | null | undefined = req?.accessiblePropertyIds;
    let effective = propertyId;
    if (accessible && accessible.length > 0) {
      if (propertyId && !accessible.includes(propertyId)) {
        effective = '00000000-0000-0000-0000-000000000000';
      } else if (!propertyId) {
        effective = accessible[0];
      }
    }
    return this.reportsService.getOutstandingReport({
      propertyId: effective || undefined,
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
    @Query('propertyId') propertyId: string | undefined,
    @Query('towerId') towerId: string | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Query('paymentMethod') paymentMethod: string | undefined,
    @Req() req: any,
  ) {
    const accessible: string[] | null | undefined = req?.accessiblePropertyIds;
    let effective = propertyId;
    if (accessible && accessible.length > 0) {
      if (propertyId && !accessible.includes(propertyId)) {
        effective = '00000000-0000-0000-0000-000000000000';
      } else if (!propertyId) {
        effective = accessible[0];
      }
    }
    return this.reportsService.getCollectionReport({
      propertyId: effective || undefined,
      towerId: towerId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      paymentMethod: paymentMethod || undefined,
    });
  }

  /**
   * Stock inventory report.
   * Query params: propertyId?, towerId?, status?, flatType?
   */
  @Get('inventory')
  async getInventory(
    @Query('propertyId') propertyId: string | undefined,
    @Query('towerId') towerId: string | undefined,
    @Query('status') status: string | undefined,
    @Query('flatType') flatType: string | undefined,
    @Req() req: any,
  ) {
    const accessible: string[] | null | undefined = req?.accessiblePropertyIds;
    let effective = propertyId;
    if (accessible && accessible.length > 0) {
      if (propertyId && !accessible.includes(propertyId)) {
        effective = '00000000-0000-0000-0000-000000000000';
      } else if (!propertyId) {
        effective = accessible[0];
      }
    }
    return this.reportsService.getInventoryReport({
      propertyId: effective || undefined,
      towerId: towerId || undefined,
      status: status || undefined,
      flatType: flatType || undefined,
    });
  }
}
