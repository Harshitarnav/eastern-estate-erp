/**
 * @file sales-task.controller.ts
 * @description Controller for managing sales tasks and personal scheduler
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
import { SalesTaskService } from './sales-task.service';
import { CreateSalesTaskDto } from './dto/create-sales-task.dto';
import { TaskStatus } from './entities/sales-task.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('sales-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesTaskController {
  constructor(private readonly salesTaskService: SalesTaskService) {}

  @Post()
  create(@Body() createSalesTaskDto: CreateSalesTaskDto, @Req() req: Request) {
    const user = req.user as any;
    const isManager = this.isManager(user);
    const effectiveAssignee = isManager && createSalesTaskDto.assignedTo
      ? createSalesTaskDto.assignedTo
      : user?.id;

    return this.salesTaskService.create({
      ...createSalesTaskDto,
      assignedTo: effectiveAssignee,
      assignedBy: user?.id,
      createdBy: user?.id,
    });
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('status') status: TaskStatus, @Req() req: Request) {
    const effectiveUserId = this.getEffectiveUserId(req, userId);
    return this.salesTaskService.findByUser(effectiveUserId, status, req.user as any);
  }

  @Get('user/:userId/today')
  getTodayTasks(@Param('userId') userId: string, @Req() req: Request) {
    const effectiveUserId = this.getEffectiveUserId(req, userId);
    return this.salesTaskService.getTodayTasks(effectiveUserId, req.user as any);
  }

  @Get('user/:userId/upcoming')
  getUpcomingTasks(@Param('userId') userId: string, @Query('days') days: number, @Req() req: Request) {
    const effectiveUserId = this.getEffectiveUserId(req, userId);
    return this.salesTaskService.getUpcomingTasks(effectiveUserId, days ? Number(days) : 7, req.user as any);
  }

  @Get('user/:userId/overdue')
  getOverdueTasks(@Param('userId') userId: string, @Req() req: Request) {
    const effectiveUserId = this.getEffectiveUserId(req, userId);
    return this.salesTaskService.getOverdueTasks(effectiveUserId, req.user as any);
  }

  @Get('user/:userId/statistics')
  getStatistics(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: Request,
  ) {
    const effectiveUserId = this.getEffectiveUserId(req, userId);
    return this.salesTaskService.getStatistics(
      effectiveUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      req?.user as any,
    );
  }

  @Get('user/:userId/by-date')
  getTasksByDateRange(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request,
  ) {
    const effectiveUserId = this.getEffectiveUserId(req, userId);
    return this.salesTaskService.getTasksByDateRange(
      effectiveUserId,
      new Date(startDate),
      new Date(endDate),
      req.user as any,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.salesTaskService.findOne(id, req.user as any);
  }

  @Patch(':id')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateSalesTaskDto>, @Req() req: Request) {
    return this.salesTaskService.update(id, updateData, req.user as any);
  }

  @Patch(':id/complete')
  completeTask(
    @Param('id') id: string,
    @Body() body: { outcome?: string; notes?: string },
    @Req() req: Request,
  ) {
    return this.salesTaskService.completeTask(id, body.outcome, body.notes, req.user as any);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: TaskStatus }, @Req() req: Request) {
    return this.salesTaskService.updateStatus(id, body.status, req.user as any);
  }

  @Patch(':id/cancel')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  cancelTask(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: Request) {
    return this.salesTaskService.cancelTask(id, body.reason, req.user as any);
  }

  @Patch(':id/reminder-sent')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  markReminderSent(@Param('id') id: string, @Req() req: Request) {
    return this.salesTaskService.markReminderSent(id, req.user as any);
  }

  @Delete(':id')
  @Roles('super_admin', 'sales_manager', 'sales_gm')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.salesTaskService.remove(id, req.user as any);
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

