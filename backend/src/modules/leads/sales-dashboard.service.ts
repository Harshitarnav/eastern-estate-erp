/**
 * @file sales-dashboard.service.ts
 * @description Service for sales person dashboard analytics and performance metrics
 * @module LeadsModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Lead, LeadStatus } from './entities/lead.entity';
import { FollowUp } from './entities/followup.entity';
import { SalesTask, TaskStatus } from './entities/sales-task.entity';
import { SalesTarget, TargetStatus } from '../employees/entities/sales-target.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { SiteVisitStatus } from './entities/lead.entity';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays } from 'date-fns';

export interface DashboardMetrics {
  // Performance Summary
  performance: {
    currentTarget: any;
    achievementPercentage: number;
    motivationalMessage: string;
    missedBy: number;
    daysRemaining: number;
  };

  // Lead Metrics
  leads: {
    total: number;
    new: number;
    active: number;
    hot: number;
    warm: number;
    cold: number;
    converted: number;
    bySource: Record<string, number>;
    conversionRate: number;
  };

  // Site Visit Metrics
  siteVisits: {
    pendingThisWeek: number;
    completedThisMonth: number;
    scheduledUpcoming: number;
    avgRating: number;
  };

  // Followup Metrics
  followups: {
    dueToday: number;
    dueThisWeek: number;
    overdue: number;
    completedThisMonth: number;
    avgResponseTime: number;
  };

  // Task Metrics
  tasks: {
    dueToday: number;
    dueThisWeek: number;
    overdue: number;
    completedToday: number;
    completionRate: number;
  };

  // Revenue Metrics
  revenue: {
    thisMonth: number;
    thisQuarter: number;
    avgDealSize: number;
    projectedMonthEnd: number;
  };

  // Activity Timeline
  recentActivities: any[];

  // Upcoming Events
  upcomingEvents: {
    followups: any[];
    tasks: any[];
    siteVisits: any[];
    meetings: any[];
  };
}

@Injectable()
export class SalesDashboardService {
  private readonly logger = new Logger(SalesDashboardService.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
    @InjectRepository(SalesTask)
    private salesTaskRepository: Repository<SalesTask>,
    @InjectRepository(SalesTarget)
    private salesTargetRepository: Repository<SalesTarget>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  /**
   * Get comprehensive dashboard metrics for a sales person
   */
  async getDashboardMetrics(salesPersonId: string): Promise<DashboardMetrics> {
    this.logger.log(`Generating dashboard metrics for ${salesPersonId}`);

    const today = new Date();
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    const startOfThisWeek = startOfWeek(today);
    const endOfThisWeek = endOfWeek(today);

    // Fetch all data in parallel for efficiency
    const [
      currentTarget,
      leads,
      siteVisits,
      followups,
      tasks,
      bookings,
    ] = await Promise.all([
      this.getCurrentTarget(salesPersonId),
      this.getLeadMetrics(salesPersonId, startOfThisMonth, endOfThisMonth),
      this.getSiteVisitMetrics(salesPersonId, startOfThisWeek, endOfThisWeek, startOfThisMonth, endOfThisMonth),
      this.getFollowUpMetrics(salesPersonId, today, startOfThisWeek, endOfThisWeek, startOfThisMonth, endOfThisMonth),
      this.getTaskMetrics(salesPersonId, today, startOfThisWeek, endOfThisWeek),
      this.getRevenueMetrics(salesPersonId, startOfThisMonth, endOfThisMonth),
    ]);

    // Get recent activities and upcoming events
    const [recentActivities, upcomingEvents] = await Promise.all([
      this.getRecentActivities(salesPersonId),
      this.getUpcomingEvents(salesPersonId),
    ]);

    return {
      performance: this.buildPerformanceMetrics(currentTarget),
      leads,
      siteVisits,
      followups,
      tasks,
      revenue: bookings,
      recentActivities,
      upcomingEvents,
    };
  }

  /**
   * Get current active target
   */
  private async getCurrentTarget(salesPersonId: string): Promise<SalesTarget | null> {
    const today = new Date();
    const targets = await this.salesTargetRepository.find({
      where: {
        salesPersonId,
        status: TargetStatus.IN_PROGRESS,
        isActive: true,
      },
      order: { startDate: 'DESC' },
    });

    return targets.find(t => t.startDate <= today && t.endDate >= today) || null;
  }

  /**
   * Build performance metrics
   */
  private buildPerformanceMetrics(target: SalesTarget | null): any {
    if (!target) {
      return {
        currentTarget: null,
        achievementPercentage: 0,
        motivationalMessage: '🎯 No active target set. Contact your sales manager!',
        missedBy: 0,
        daysRemaining: 0,
      };
    }

    const today = new Date();
    const daysRemaining = Math.ceil((target.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const motivationalMessage =
      target.motivationalMessage ||
      (target.missedBy > 0
        ? `You missed your incentive by ${target.missedBy} sale${target.missedBy > 1 ? 's' : ''}. One more push to unlock your Eastern Estate incentive!`
        : 'Fantastic momentum! Keep delighting families with Eastern Estate experiences.');

    return {
      currentTarget: {
        id: target.id,
        period: target.targetPeriod,
        status: target.status,
        targetBookings: target.targetBookings,
        achievedBookings: target.achievedBookings,
        targetLeads: target.targetLeads,
        achievedLeads: target.achievedLeads,
        targetSiteVisits: target.targetSiteVisits,
        achievedSiteVisits: target.achievedSiteVisits,
        targetConversions: target.targetConversions,
        achievedConversions: target.achievedConversions,
        targetRevenue: target.targetRevenue,
        achievedRevenue: target.achievedRevenue,
        baseIncentive: target.baseIncentive,
        earnedIncentive: target.earnedIncentive,
        bonusIncentive: target.bonusIncentive,
        totalIncentive: target.totalIncentive,
        incentivePaid: target.incentivePaid,
        incentivePaidDate: target.incentivePaidDate,
        selfTargetBookings: target.selfTargetBookings,
        selfTargetRevenue: target.selfTargetRevenue,
        selfTargetNotes: target.selfTargetNotes,
        notes: target.notes,
      },
      achievementPercentage: target.overallAchievementPct,
      motivationalMessage,
      missedBy: target.missedBy,
      daysRemaining,
    };
  }

  /**
   * Get lead metrics
   */
  private async getLeadMetrics(salesPersonId: string, startDate: Date, endDate: Date): Promise<any> {
    const allLeads = await this.leadRepository.find({
      where: {
        assignedTo: salesPersonId,
      },
    });

    const newLeads = allLeads.filter(l => l.createdAt >= startDate && l.createdAt <= endDate);

    const bySource: Record<string, number> = {};
    allLeads.forEach(l => {
      bySource[l.source] = (bySource[l.source] || 0) + 1;
    });

    const converted = allLeads.filter(l => l.convertedToCustomerId !== null).length;
    const conversionRate = allLeads.length > 0 ? (converted / allLeads.length) * 100 : 0;

    return {
      total: allLeads.length,
      new: newLeads.length,
      active: allLeads.filter(l => ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION'].includes(l.status)).length,
      hot: allLeads.filter(l => l.priority === 'HIGH' || l.priority === 'URGENT').length,
      warm: allLeads.filter(l => l.priority === 'MEDIUM').length,
      cold: allLeads.filter(l => l.priority === 'LOW').length,
      converted,
      bySource,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Get site visit metrics
   */
  private async getSiteVisitMetrics(
    salesPersonId: string,
    startOfWeek: Date,
    endOfWeek: Date,
    startOfMonth: Date,
    endOfMonth: Date,
  ): Promise<any> {
    // Since site_visit_date column doesn't exist, we can't filter by date range for pending
    const pendingThisWeek = await this.leadRepository.count({
      where: {
        assignedTo: salesPersonId,
        siteVisitStatus: SiteVisitStatus.PENDING,
      },
    });

    const completedThisMonth = await this.leadRepository.count({
      where: {
        assignedTo: salesPersonId,
        siteVisitStatus: SiteVisitStatus.DONE,
        lastSiteVisitDate: Between(startOfMonth, endOfMonth),
      },
    });

    const scheduledUpcoming = await this.leadRepository.count({
      where: {
        assignedTo: salesPersonId,
        siteVisitStatus: SiteVisitStatus.SCHEDULED,
      },
    });

    // Calculate average rating from followups
    const siteVisitFollowUps = await this.followUpRepository.find({
      where: {
        performedBy: salesPersonId,
        isSiteVisit: true,
      },
    });

    const avgRating = siteVisitFollowUps.length > 0
      ? siteVisitFollowUps.reduce((sum, f) => sum + (f.siteVisitRating || 0), 0) / siteVisitFollowUps.length
      : 0;

    return {
      pendingThisWeek,
      completedThisMonth,
      scheduledUpcoming,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }

  /**
   * Get followup metrics
   */
  private async getFollowUpMetrics(
    salesPersonId: string,
    today: Date,
    startOfWeek: Date,
    endOfWeek: Date,
    startOfMonth: Date,
    endOfMonth: Date,
  ): Promise<any> {
    const leads = await this.leadRepository.find({
      where: {
        assignedTo: salesPersonId,
      },
    });

    const dueToday = leads.filter(
      l => l.nextFollowUpDate && startOfDay(l.nextFollowUpDate).getTime() === startOfDay(today).getTime(),
    ).length;

    const dueThisWeek = leads.filter(
      l => l.nextFollowUpDate && l.nextFollowUpDate >= startOfWeek && l.nextFollowUpDate <= endOfWeek,
    ).length;

    const overdue = leads.filter(
      l => l.nextFollowUpDate && l.nextFollowUpDate < startOfDay(today),
    ).length;

    const completedThisMonth = await this.followUpRepository.count({
      where: {
        performedBy: salesPersonId,
        followUpDate: Between(startOfMonth, endOfMonth),
      },
    });

    return {
      dueToday,
      dueThisWeek,
      overdue,
      completedThisMonth,
      avgResponseTime: 0, // TODO: Calculate based on lead response times
    };
  }

  /**
   * Get task metrics
   */
  private async getTaskMetrics(
    salesPersonId: string,
    today: Date,
    startOfWeek: Date,
    endOfWeek: Date,
  ): Promise<any> {
    const allTasks = await this.salesTaskRepository.find({
      where: {
        assignedTo: salesPersonId,
        isActive: true,
      },
    });

    const dueToday = allTasks.filter(
      t => t.dueDate && startOfDay(t.dueDate).getTime() === startOfDay(today).getTime() && t.status !== TaskStatus.COMPLETED,
    ).length;

    const dueThisWeek = allTasks.filter(
      t => t.dueDate >= startOfWeek && t.dueDate <= endOfWeek && t.status !== TaskStatus.COMPLETED,
    ).length;

    const overdue = allTasks.filter(
      t => t.dueDate < startOfDay(today) && t.status !== TaskStatus.COMPLETED,
    ).length;

    const completedToday = allTasks.filter(
      t => t.completedAt && startOfDay(t.completedAt).getTime() === startOfDay(today).getTime(),
    ).length;

    const completed = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const completionRate = allTasks.length > 0 ? (completed / allTasks.length) * 100 : 0;

    return {
      dueToday,
      dueThisWeek,
      overdue,
      completedToday,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics(salesPersonId: string, startOfMonth: Date, endOfMonth: Date): Promise<any> {
    // Note: You might need to add salesPersonId to Booking entity
    const bookings = await this.bookingRepository.find({
      where: {
        bookingDate: Between(startOfMonth, endOfMonth),
      },
    });

    const thisMonth = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const avgDealSize = bookings.length > 0 ? thisMonth / bookings.length : 0;

    // Simple projection based on current pace
    const today = new Date();
    const daysInMonth = endOfMonth.getDate();
    const daysPassed = today.getDate();
    const projectedMonthEnd = (thisMonth / daysPassed) * daysInMonth;

    return {
      thisMonth,
      thisQuarter: thisMonth, // TODO: Calculate quarterly
      avgDealSize: Math.round(avgDealSize),
      projectedMonthEnd: Math.round(projectedMonthEnd),
    };
  }

  /**
   * Get recent activities
   */
  private async getRecentActivities(salesPersonId: string): Promise<any[]> {
    const limit = 20;

    const [followups, tasks] = await Promise.all([
      this.followUpRepository.find({
        where: { performedBy: salesPersonId },
        order: { followUpDate: 'DESC' },
        take: limit,
        relations: ['lead'],
      }),
      this.salesTaskRepository.find({
        where: { assignedTo: salesPersonId, status: TaskStatus.COMPLETED },
        order: { completedAt: 'DESC' },
        take: limit,
        relations: ['lead'],
      }),
    ]);

    const activities = [
      ...followups.map(f => ({
        type: 'followup',
        date: f.followUpDate ? new Date(f.followUpDate) : null,
        title: `${f.followUpType} with ${f.lead?.firstName || 'Lead'}`,
        outcome: f.outcome,
        feedback: f.feedback,
      })),
      ...tasks.map(t => ({
        type: 'task',
        date: t.completedAt ? new Date(t.completedAt) : null,
        title: t.title,
        outcome: t.outcome,
        taskType: t.taskType,
      })),
    ];

    return activities
      .filter(a => a.date !== null && a.date !== undefined && a.date instanceof Date && !isNaN(a.date.getTime()))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  /**
   * Get upcoming events
   */
  private async getUpcomingEvents(salesPersonId: string): Promise<any> {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    const [upcomingFollowUps, upcomingTasks, upcomingSiteVisits] = await Promise.all([
      this.followUpRepository.find({
        where: {
          performedBy: salesPersonId,
          nextFollowUpDate: Between(today, nextWeek),
        },
        order: { nextFollowUpDate: 'ASC' },
        relations: ['lead'],
      }),
      this.salesTaskRepository.find({
        where: {
          assignedTo: salesPersonId,
          dueDate: Between(today, nextWeek),
          status: TaskStatus.PENDING,
        },
        order: { dueDate: 'ASC', dueTime: 'ASC' },
        relations: ['lead'],
      }),
      this.leadRepository.find({
        where: {
          assignedTo: salesPersonId,
          siteVisitStatus: SiteVisitStatus.SCHEDULED,
        },
        // Note: Can't filter by date since site_visit_date column doesn't exist
        take: 10, // Limit to 10 upcoming site visits
      }),
    ]);

    return {
      followups: upcomingFollowUps.map(f => ({
        date: f.nextFollowUpDate,
        leadName: f.lead?.firstName,
        plan: f.nextFollowUpPlan,
      })),
      tasks: upcomingTasks.map(t => ({
        date: t.dueDate,
        time: t.dueTime,
        title: t.title,
        taskType: t.taskType,
        priority: t.priority,
      })),
      siteVisits: upcomingSiteVisits.map(l => ({
        date: null, // Will be available once site_visit_date column is added
        time: l.siteVisitTime,
        leadName: l.firstName,
        property: '', // l.interestedPropertyTypes?.join(', '), // Column doesn't exist in DB
      })),
      meetings: upcomingTasks.filter(t => t.taskType === 'MEETING' || t.taskType === 'CLIENT_MEETING'),
    };
  }
}
