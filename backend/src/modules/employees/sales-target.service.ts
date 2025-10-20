/**
 * @file sales-target.service.ts
 * @description Service for managing sales targets and performance tracking
 * @module EmployeesModule
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { SalesTarget, TargetStatus, TargetPeriod } from './entities/sales-target.entity';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { Lead, LeadStatus } from '../leads/entities/lead.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class SalesTargetService {
  private readonly logger = new Logger(SalesTargetService.name);

  constructor(
    @InjectRepository(SalesTarget)
    private salesTargetRepository: Repository<SalesTarget>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a new sales target
   */
  async create(createTargetDto: CreateSalesTargetDto): Promise<SalesTarget> {
    this.logger.log(`Creating sales target for ${createTargetDto.salesPersonId}`);

    // Validate dates
    if (createTargetDto.startDate >= createTargetDto.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping targets
    const existing = await this.salesTargetRepository.findOne({
      where: {
        salesPersonId: createTargetDto.salesPersonId,
        targetPeriod: createTargetDto.targetPeriod,
        status: TargetStatus.ACTIVE,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Active ${createTargetDto.targetPeriod} target already exists for this sales person`,
      );
    }

    const target = this.salesTargetRepository.create(createTargetDto);
    return this.salesTargetRepository.save(target);
  }

  /**
   * Get target by ID
   */
  async findOne(id: string): Promise<SalesTarget> {
    const target = await this.salesTargetRepository.findOne({
      where: { id, isActive: true },
      relations: ['salesPerson'],
    });

    if (!target) {
      throw new NotFoundException(`Sales target with ID ${id} not found`);
    }

    return target;
  }

  /**
   * Get all targets for a sales person
   */
  async findBySalesPerson(salesPersonId: string): Promise<SalesTarget[]> {
    return this.salesTargetRepository.find({
      where: { salesPersonId, isActive: true },
      order: { startDate: 'DESC' },
    });
  }

  /**
   * Get active target for a sales person
   */
  async getActiveTarget(salesPersonId: string, period?: TargetPeriod): Promise<SalesTarget | null> {
    const where: any = {
      salesPersonId,
      status: TargetStatus.IN_PROGRESS,
      isActive: true,
    };

    if (period) {
      where.targetPeriod = period;
    }

    const today = new Date();
    const targets = await this.salesTargetRepository.find({
      where,
      order: { startDate: 'DESC' },
    });

    // Return target that is currently active (today is between startDate and endDate)
    return targets.find(t => t.startDate <= today && t.endDate >= today) || null;
  }

  /**
   * Update target achievement based on actual performance
   */
  async updateAchievement(targetId: string): Promise<SalesTarget> {
    const target = await this.findOne(targetId);

    this.logger.log(`Updating achievement for target ${targetId}`);

    // Fetch actual performance data
    const performance = await this.fetchPerformanceData(
      target.salesPersonId,
      target.startDate,
      target.endDate,
    );

    // Update achievement values
    target.achievedLeads = performance.totalLeads;
    target.achievedSiteVisits = performance.totalSiteVisits;
    target.achievedConversions = performance.totalConversions;
    target.achievedBookings = performance.totalBookings;
    target.achievedRevenue = performance.totalRevenue;

    // Calculate achievement percentages
    target.leadsAchievementPct = this.calculatePercentage(target.achievedLeads, target.targetLeads);
    target.siteVisitsAchievementPct = this.calculatePercentage(
      target.achievedSiteVisits,
      target.targetSiteVisits,
    );
    target.conversionsAchievementPct = this.calculatePercentage(
      target.achievedConversions,
      target.targetConversions,
    );
    target.bookingsAchievementPct = this.calculatePercentage(
      target.achievedBookings,
      target.targetBookings,
    );
    target.revenueAchievementPct = this.calculatePercentage(
      target.achievedRevenue,
      target.targetRevenue,
    );

    // Calculate overall achievement (weighted average)
    target.overallAchievementPct = this.calculateOverallAchievement(target);

    // Update status
    target.status = this.determineStatus(target);

    // Calculate incentives
    this.calculateIncentives(target);

    // Generate motivational message
    target.motivationalMessage = this.generateMotivationalMessage(target);
    target.missedBy = Math.max(0, target.targetBookings - target.achievedBookings);

    await this.salesTargetRepository.save(target);

    return target;
  }

  /**
   * Fetch actual performance data from database
   */
  private async fetchPerformanceData(
    salesPersonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Fetch leads created by this sales person
    const leads = await this.leadRepository.count({
      where: {
        assignedTo: salesPersonId,
        createdAt: Between(startDate, endDate),
      },
    });

    // Fetch site visits
    const siteVisits = await this.leadRepository.count({
      where: {
        assignedTo: salesPersonId,
        hasSiteVisit: true,
        lastSiteVisitDate: Between(startDate, endDate),
      },
    });

    // Fetch conversions (leads converted to customers)
    const conversions = await this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.assignedTo = :salesPersonId', { salesPersonId })
      .andWhere('lead.convertedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('lead.convertedToCustomerId IS NOT NULL')
      .getCount();

    // Fetch bookings
    const bookings = await this.bookingRepository.find({
      where: {
        bookingDate: Between(startDate, endDate),
        // Note: You might want to add a salesPersonId field to bookings
      },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);

    return {
      totalLeads: leads,
      totalSiteVisits: siteVisits,
      totalConversions: conversions,
      totalBookings: bookings.length,
      totalRevenue,
    };
  }

  /**
   * Calculate percentage achievement
   */
  private calculatePercentage(achieved: number, target: number): number {
    if (target === 0) return 0;
    return Math.round((achieved / target) * 100 * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate overall achievement percentage
   */
  private calculateOverallAchievement(target: SalesTarget): number {
    const weights = {
      leads: 0.1,
      siteVisits: 0.15,
      conversions: 0.2,
      bookings: 0.3,
      revenue: 0.25,
    };

    return Math.round(
      (target.leadsAchievementPct * weights.leads +
        target.siteVisitsAchievementPct * weights.siteVisits +
        target.conversionsAchievementPct * weights.conversions +
        target.bookingsAchievementPct * weights.bookings +
        target.revenueAchievementPct * weights.revenue) *
        100,
    ) / 100;
  }

  /**
   * Determine target status
   */
  private determineStatus(target: SalesTarget): TargetStatus {
    const today = new Date();

    if (today > target.endDate) {
      return target.overallAchievementPct >= 100 ? TargetStatus.ACHIEVED : TargetStatus.MISSED;
    }

    return TargetStatus.IN_PROGRESS;
  }

  /**
   * Calculate incentives based on achievement
   */
  private calculateIncentives(target: SalesTarget): void {
    const achievementPct = target.overallAchievementPct;

    // Base incentive is earned proportionally
    target.earnedIncentive = (target.baseIncentive * achievementPct) / 100;

    // Bonus incentive for exceeding target
    if (achievementPct > 100) {
      const excessPct = achievementPct - 100;
      target.bonusIncentive = (target.baseIncentive * excessPct) / 100;
    } else {
      target.bonusIncentive = 0;
    }

    target.totalIncentive = target.earnedIncentive + target.bonusIncentive;
  }

  /**
   * Generate motivational message
   */
  private generateMotivationalMessage(target: SalesTarget): string {
    const achievementPct = target.overallAchievementPct;
    const missedBookings = target.targetBookings - target.achievedBookings;

    if (achievementPct >= 100) {
      return `🎉 Congratulations! You've achieved ${achievementPct.toFixed(1)}% of your target! Keep up the excellent work!`;
    } else if (achievementPct >= 90) {
      return `💪 You're so close! Just ${missedBookings} more booking${missedBookings !== 1 ? 's' : ''} to hit your target. You've got this!`;
    } else if (achievementPct >= 70) {
      return `📈 Good progress at ${achievementPct.toFixed(1)}%! You need ${missedBookings} more booking${missedBookings !== 1 ? 's' : ''} to reach your target. Let's push harder!`;
    } else if (achievementPct >= 50) {
      return `⚡ You're halfway there! ${missedBookings} more booking${missedBookings !== 1 ? 's' : ''} needed. Your potential incentive of ₹${target.baseIncentive.toFixed(0)} is waiting!`;
    } else {
      return `🎯 Time to accelerate! You missed your incentive by ${missedBookings} sale${missedBookings !== 1 ? 's' : ''}. Focus on your high-potential leads!`;
    }
  }

  /**
   * Update self-target set by sales person
   */
  async updateSelfTarget(
    targetId: string,
    selfTargetBookings: number,
    selfTargetRevenue: number,
    notes?: string,
  ): Promise<SalesTarget> {
    await this.salesTargetRepository.update(targetId, {
      selfTargetBookings,
      selfTargetRevenue,
      selfTargetNotes: notes,
    });

    return this.findOne(targetId);
  }

  /**
   * Mark incentive as paid
   */
  async markIncentivePaid(targetId: string): Promise<SalesTarget> {
    await this.salesTargetRepository.update(targetId, {
      incentivePaid: true,
      incentivePaidDate: new Date(),
    });

    return this.findOne(targetId);
  }

  /**
   * Get team targets (for Sales Head/GM)
   */
  async getTeamTargets(teamMemberIds: string[], period?: TargetPeriod): Promise<SalesTarget[]> {
    const where: any = {
      salesPersonId: Between(teamMemberIds[0], teamMemberIds[teamMemberIds.length - 1]),
      isActive: true,
    };

    if (period) {
      where.targetPeriod = period;
    }

    return this.salesTargetRepository.find({
      where,
      relations: ['salesPerson'],
      order: { startDate: 'DESC' },
    });
  }

  /**
   * Get team performance summary
   */
  async getTeamPerformanceSummary(teamMemberIds: string[]): Promise<any> {
    const targets = await this.salesTargetRepository.find({
      where: {
        status: TargetStatus.IN_PROGRESS,
        isActive: true,
      },
      relations: ['salesPerson'],
    });

    const teamTargets = targets.filter(t => teamMemberIds.includes(t.salesPersonId));

    return {
      totalMembers: teamMemberIds.length,
      activeTargets: teamTargets.length,
      avgAchievement:
        teamTargets.reduce((sum, t) => sum + t.overallAchievementPct, 0) / teamTargets.length || 0,
      totalBookings: teamTargets.reduce((sum, t) => sum + t.achievedBookings, 0),
      totalRevenue: teamTargets.reduce((sum, t) => sum + Number(t.achievedRevenue), 0),
      topPerformers: this.getTopPerformers(teamTargets, 3),
      needsAttention: this.getNeedsAttention(teamTargets),
    };
  }

  private getTopPerformers(targets: SalesTarget[], count: number): SalesTarget[] {
    return targets.sort((a, b) => b.overallAchievementPct - a.overallAchievementPct).slice(0, count);
  }

  private getNeedsAttention(targets: SalesTarget[]): SalesTarget[] {
    return targets.filter(t => t.overallAchievementPct < 50).slice(0, 5);
  }

  /**
   * Update a target
   */
  async update(id: string, updateData: Partial<CreateSalesTargetDto>): Promise<SalesTarget> {
    await this.salesTargetRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete (soft) a target
   */
  async remove(id: string): Promise<void> {
    await this.salesTargetRepository.update(id, { isActive: false });
  }
}

