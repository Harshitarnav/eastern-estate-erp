/**
 * @file followup.service.ts
 * @description Service for managing lead followups
 * @module LeadsModule
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { FollowUp } from './entities/followup.entity';
import { Lead } from './entities/lead.entity';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { addHours, startOfDay, endOfDay, addDays } from 'date-fns';

@Injectable()
export class FollowUpService {
  private readonly logger = new Logger(FollowUpService.name);

  constructor(
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  /**
   * Create a new followup record
   */
  async create(createFollowUpDto: CreateFollowUpDto): Promise<FollowUp> {
    this.logger.log(`Creating followup for lead ${createFollowUpDto.leadId}`);

    // Verify lead exists
    const lead = await this.leadRepository.findOne({
      where: { id: createFollowUpDto.leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${createFollowUpDto.leadId} not found`);
    }

    // Create followup record
    const followUp = this.followUpRepository.create(createFollowUpDto);
    const savedFollowUp = await this.followUpRepository.save(followUp);

    // Update lead with followup information
    await this.updateLeadAfterFollowUp(lead, createFollowUpDto);

    return savedFollowUp;
  }

  /**
   * Update lead information after a followup
   */
  private async updateLeadAfterFollowUp(lead: Lead, followUpDto: CreateFollowUpDto): Promise<void> {
    const updateData: Partial<Lead> = {
      lastContactedAt: followUpDto.followUpDate,
      lastFollowUpFeedback: followUpDto.feedback,
      totalFollowUps: (lead.totalFollowUps || 0) + 1,
      reminderSent: false, // Reset reminder flag
    };

    // Update next followup date if provided
    if (followUpDto.nextFollowUpDate) {
      updateData.nextFollowUpDate = followUpDto.nextFollowUpDate;
    }

    // Update site visit information if applicable
    if (followUpDto.isSiteVisit) {
      updateData.hasSiteVisit = true;
      updateData.lastSiteVisitDate = followUpDto.followUpDate;
      updateData.totalSiteVisits = (lead.totalSiteVisits || 0) + 1;
      updateData.siteVisitFeedback = followUpDto.siteVisitFeedback;
    }

    // Update communication counters based on type
    switch (followUpDto.followUpType) {
      case 'CALL':
        updateData.totalCalls = (lead.totalCalls || 0) + 1;
        break;
      case 'EMAIL':
        updateData.totalEmails = (lead.totalEmails || 0) + 1;
        break;
      case 'MEETING':
      case 'SITE_VISIT':
        updateData.totalMeetings = (lead.totalMeetings || 0) + 1;
        break;
    }

    await this.leadRepository.update(lead.id, updateData);
  }

  /**
   * Get all followups for a lead
   */
  async findByLead(leadId: string): Promise<FollowUp[]> {
    return this.followUpRepository.find({
      where: { leadId, isActive: true },
      order: { followUpDate: 'DESC' },
      relations: ['performedByUser'],
    });
  }

  /**
   * Get followups by sales person
   */
  async findBySalesPerson(salesPersonId: string, startDate?: Date, endDate?: Date): Promise<FollowUp[]> {
    const where: any = {
      performedBy: salesPersonId,
      isActive: true,
    };

    if (startDate && endDate) {
      where.followUpDate = Between(startDate, endDate);
    }

    return this.followUpRepository.find({
      where,
      order: { followUpDate: 'DESC' },
      relations: ['lead', 'performedByUser'],
    });
  }

  /**
   * Get upcoming followups (next 7 days)
   */
  async getUpcomingFollowUps(salesPersonId: string): Promise<FollowUp[]> {
    const today = startOfDay(new Date());
    const nextWeek = endOfDay(addDays(today, 7));

    return this.followUpRepository.find({
      where: {
        performedBy: salesPersonId,
        nextFollowUpDate: Between(today, nextWeek),
        isActive: true,
      },
      order: { nextFollowUpDate: 'ASC' },
      relations: ['lead'],
    });
  }

  /**
   * Get followups needing reminders (24 hours before)
   */
  async getFollowUpsNeedingReminders(): Promise<FollowUp[]> {
    const reminderTime = addHours(new Date(), 24);

    return this.followUpRepository.find({
      where: {
        reminderSent: false,
        isActive: true,
      },
      relations: ['lead', 'performedByUser'],
    });
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(followUpId: string): Promise<void> {
    await this.followUpRepository.update(followUpId, {
      reminderSent: true,
      reminderSentAt: new Date(),
    });
  }

  /**
   * Get followup statistics for a sales person
   */
  async getStatistics(salesPersonId: string, startDate: Date, endDate: Date): Promise<any> {
    const followUps = await this.findBySalesPerson(salesPersonId, startDate, endDate);

    const stats = {
      totalFollowUps: followUps.length,
      byCalls: followUps.filter(f => f.followUpType === 'CALL').length,
      byEmails: followUps.filter(f => f.followUpType === 'EMAIL').length,
      byMeetings: followUps.filter(f => f.followUpType === 'MEETING').length,
      bySiteVisits: followUps.filter(f => f.isSiteVisit).length,
      outcomes: {
        interested: followUps.filter(f => f.outcome === 'INTERESTED').length,
        notInterested: followUps.filter(f => f.outcome === 'NOT_INTERESTED').length,
        converted: followUps.filter(f => f.outcome === 'CONVERTED').length,
        siteVisitScheduled: followUps.filter(f => f.outcome === 'SITE_VISIT_SCHEDULED').length,
      },
      avgInterestLevel: this.calculateAverage(followUps.map(f => f.interestLevel)),
      avgBudgetFit: this.calculateAverage(followUps.map(f => f.budgetFit)),
      avgTimelineFit: this.calculateAverage(followUps.map(f => f.timelineFit)),
      totalDurationMinutes: followUps.reduce((sum, f) => sum + (f.durationMinutes || 0), 0),
    };

    return stats;
  }

  /**
   * Get site visit statistics
   */
  async getSiteVisitStatistics(salesPersonId: string, startDate: Date, endDate: Date): Promise<any> {
    const siteVisits = (await this.findBySalesPerson(salesPersonId, startDate, endDate))
      .filter(f => f.isSiteVisit);

    return {
      totalSiteVisits: siteVisits.length,
      avgRating: this.calculateAverage(siteVisits.map(sv => sv.siteVisitRating)),
      byProperty: this.groupByProperty(siteVisits),
      conversionRate: this.calculateConversionRate(siteVisits),
    };
  }

  private calculateAverage(numbers: number[]): number {
    const validNumbers = numbers.filter(n => n > 0);
    if (validNumbers.length === 0) return 0;
    return validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length;
  }

  private groupByProperty(siteVisits: FollowUp[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    siteVisits.forEach(sv => {
      if (sv.siteVisitProperty) {
        grouped[sv.siteVisitProperty] = (grouped[sv.siteVisitProperty] || 0) + 1;
      }
    });
    return grouped;
  }

  private calculateConversionRate(siteVisits: FollowUp[]): number {
    if (siteVisits.length === 0) return 0;
    const converted = siteVisits.filter(sv => sv.outcome === 'CONVERTED').length;
    return (converted / siteVisits.length) * 100;
  }

  /**
   * Find one followup by ID
   */
  async findOne(id: string): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findOne({
      where: { id, isActive: true },
      relations: ['lead', 'performedByUser'],
    });

    if (!followUp) {
      throw new NotFoundException(`FollowUp with ID ${id} not found`);
    }

    return followUp;
  }

  /**
   * Update a followup
   */
  async update(id: string, updateData: Partial<CreateFollowUpDto>): Promise<FollowUp> {
    await this.followUpRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete (soft) a followup
   */
  async remove(id: string): Promise<void> {
    await this.followUpRepository.update(id, { isActive: false });
  }
}



