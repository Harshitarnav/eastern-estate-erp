import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { LeadStatus } from '../leads/entities/lead.entity';import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';

@Injectable()
export class SmartNotificationsService {
  private readonly logger = new Logger(SmartNotificationsService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
  ) {}

  /**
   * Check every 15 minutes for upcoming follow-ups
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUpcomingFollowUps() {
    this.logger.log('Checking for upcoming follow-ups...');
    
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    const upcomingLeads = await this.leadsRepository.find({
      where: {
        nextFollowUpDate: LessThan(fifteenMinutesFromNow),
        isActive: true,
      },
      relations: ['assignedUser'],
    });

    for (const lead of upcomingLeads) {
      if (lead.assignedTo) {
        await this.notificationsService.create({
          userId: lead.assignedTo,
          title: '⏰ Follow-up Due Soon',
          message: `Call ${lead.firstName} ${lead.lastName} in 15 minutes`,
          type: 'reminder' as any,
          priority: 1,
          actionUrl: `/leads/${lead.id}`,
        });
      }
    }

    this.logger.log(`Sent ${upcomingLeads.length} upcoming follow-up notifications`);
  }

  /**
   * Check every hour for cold leads (not contacted in 7 days)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkColdLeads() {
    this.logger.log('Checking for cold leads...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const coldLeads = await this.leadsRepository.find({
      where: {
        lastContactedAt: LessThan(sevenDaysAgo),
        isActive: true,
        status: LeadStatus.NEW,
      },
      relations: ['assignedUser'],
    });

    for (const lead of coldLeads) {
      if (lead.assignedTo) {
        await this.notificationsService.create({
          userId: lead.assignedTo,
          title: '❄️ Lead Going Cold',
          message: `${lead.firstName} ${lead.lastName} hasn't been contacted in 7 days`,
          type: 'alert' as any,
          priority: 2,
          actionUrl: `/leads/${lead.id}`,
        });
      }
    }

    this.logger.log(`Sent ${coldLeads.length} cold lead notifications`);
  }

  /**
   * Check daily for overdue follow-ups
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueFollowUps() {
    this.logger.log('Checking for overdue follow-ups...');
    
    const now = new Date();

    const overdueLeads = await this.leadsRepository.find({
      where: {
        nextFollowUpDate: LessThan(now),
        isActive: true,
      },
      relations: ['assignedUser'],
    });

    for (const lead of overdueLeads) {
      if (lead.assignedTo) {
        await this.notificationsService.create({
          userId: lead.assignedTo,
          title: '🚨 Overdue Follow-up',
          message: `Follow-up with ${lead.firstName} ${lead.lastName} is overdue`,
          type: 'alert' as any,
          priority: 1,
          actionUrl: `/leads/${lead.id}`,
        });
      }
    }

    this.logger.log(`Sent ${overdueLeads.length} overdue follow-up notifications`);
  }

  /**
   * Send achievement notification
   */
  async notifyAchievement(userId: string, achievement: {
    name: string;
    description: string;
    icon: string;
    xp: number;
  }) {
    await this.notificationsService.create({
      userId,
      title: `${achievement.icon} Achievement Unlocked!`,
      message: `${achievement.name}: ${achievement.description} (+${achievement.xp} XP)`,
      type: 'achievement' as any,
      priority: 3,
    });
  }

  /**
   * Send milestone notification
   */
  async notifyMilestone(userId: string, milestone: string) {
    await this.notificationsService.create({
      userId,
      title: '🎯 Milestone Reached!',
      message: milestone,
      type: 'milestone' as any,
      priority: 3,
    });
  }
}
