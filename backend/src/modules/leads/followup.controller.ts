/**
 * @file followup.controller.ts
 * @description Controller for managing lead followups
 * @module LeadsModule
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FollowUpService } from './followup.service';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Request } from 'express';

@Controller('followups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Post()
  create(@Body() createFollowUpDto: CreateFollowUpDto, @Req() req: Request) {
    const user = req.user as any;
    const effectiveUserId = this.isManager(user) && createFollowUpDto.performedBy
      ? createFollowUpDto.performedBy
      : user?.id;

    return this.followUpService.create(
      { ...createFollowUpDto, performedBy: effectiveUserId },
      user,
    );
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string, @Req() req: Request) {
    return this.followUpService.findByLead(leadId, req.user as any);
  }

  @Get('salesperson/:salesPersonId')
  findBySalesPerson(
    @Param('salesPersonId') salesPersonId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: Request,
  ) {
    const effectiveUserId = this.getEffectiveUserId(req, salesPersonId);
    return this.followUpService.findBySalesPerson(
      effectiveUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      req?.user as any,
    );
  }

  @Get('salesperson/:salesPersonId/upcoming')
  getUpcomingFollowUps(@Param('salesPersonId') salesPersonId: string, @Req() req: Request) {
    return this.followUpService.getUpcomingFollowUps(
      this.getEffectiveUserId(req, salesPersonId),
      req.user as any,
    );
  }

  @Get('salesperson/:salesPersonId/statistics')
  getStatistics(
    @Param('salesPersonId') salesPersonId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request,
  ) {
    return this.followUpService.getStatistics(
      this.getEffectiveUserId(req, salesPersonId),
      new Date(startDate),
      new Date(endDate),
      req.user as any,
    );
  }

  @Get('salesperson/:salesPersonId/site-visit-statistics')
  getSiteVisitStatistics(
    @Param('salesPersonId') salesPersonId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request,
  ) {
    return this.followUpService.getSiteVisitStatistics(
      this.getEffectiveUserId(req, salesPersonId),
      new Date(startDate),
      new Date(endDate),
      req.user as any,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.followUpService.findOne(id, req.user as any);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateFollowUpDto>,
    @Req() req: Request,
  ) {
    return this.followUpService.update(id, updateData, req.user as any);
  }

  @Patch(':id/reminder-sent')
  markReminderSent(@Param('id') id: string, @Req() req: Request) {
    return this.followUpService.markReminderSent(id, req.user as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.followUpService.remove(id, req.user as any);
  }

  private isManager(user?: any): boolean {
    const roles: string[] = user?.roles?.map((r: any) => r.name) ?? [];
    return roles.some((r) =>
      ['super_admin', 'admin', 'sales_manager', 'sales_gm'].includes(r),
    );
  }

  private getEffectiveUserId(req?: Request, requestedUserId?: string): string {
    const user = req?.user as any;
    if (this.isManager(user) && requestedUserId) return requestedUserId;
    return user?.id;
  }
}



