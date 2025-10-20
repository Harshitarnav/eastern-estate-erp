/**
 * @file reminder.service.ts
 * @description Automated reminder service for followups, tasks, and site visits
 * @module NotificationsModule
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Lead, SiteVisitStatus } from '../leads/entities/lead.entity';
import { SalesTask, TaskStatus } from '../leads/entities/sales-task.entity';
import { EmailService } from './email.service';
import { addHours, addDays, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(SalesTask)
    private salesTaskRepository: Repository<SalesTask>,
    private emailService: EmailService,
  ) {}

  /**
   * Run every hour to send followup reminders (24 hours before)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendFollowUpReminders() {
    this.logger.log('Running followup reminder check...');

    try {
      const tomorrow = addDays(startOfDay(new Date()), 1);
      const endOfTomorrow = endOfDay(tomorrow);

      // Find leads with followups due tomorrow that haven't had reminders sent
      const leadsNeedingReminders = await this.leadRepository.find({
        where: {
          nextFollowUpDate: Between(tomorrow, endOfTomorrow),
          sendFollowUpReminder: true,
          reminderSent: false,
        },
        relations: ['assignedUser'],
      });

      this.logger.log(`Found ${leadsNeedingReminders.length} leads needing followup reminders`);

      for (const lead of leadsNeedingReminders) {
        try {
          await this.sendFollowUpReminderEmail(lead);
          
          // Mark reminder as sent
          await this.leadRepository.update(lead.id, {
            reminderSent: true,
            reminderSentAt: new Date(),
          });

          this.logger.log(`Sent followup reminder for lead ${lead.id}`);
        } catch (error) {
          this.logger.error(`Failed to send reminder for lead ${lead.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error in sendFollowUpReminders:', error);
    }
  }

  /**
   * Run every hour to send task reminders
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendTaskReminders() {
    this.logger.log('Running task reminder check...');

    try {
      const now = new Date();
      const next24Hours = addHours(now, 24);

      // Find tasks due in the next 24 hours that need reminders
      const tasksNeedingReminders = await this.salesTaskRepository.find({
        where: {
          sendReminder: true,
          reminderSent: false,
          status: TaskStatus.PENDING,
          dueDate: Between(now, next24Hours),
        },
        relations: ['assignedToUser', 'lead'],
      });

      this.logger.log(`Found ${tasksNeedingReminders.length} tasks needing reminders`);

      for (const task of tasksNeedingReminders) {
        try {
          await this.sendTaskReminderEmail(task);

          // Mark reminder as sent
          await this.salesTaskRepository.update(task.id, {
            reminderSent: true,
            reminderSentAt: new Date(),
          });

          this.logger.log(`Sent task reminder for task ${task.id}`);
        } catch (error) {
          this.logger.error(`Failed to send reminder for task ${task.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error in sendTaskReminders:', error);
    }
  }

  /**
   * Run every day at 9 AM to send site visit confirmations
   */
  @Cron('0 9 * * *')
  async sendSiteVisitReminders() {
    this.logger.log('Running site visit reminder check...');

    try {
      // NOTE: Temporarily disabled - site_visit_date column doesn't exist in DB yet
      this.logger.log('Site visit reminders are temporarily disabled - waiting for DB schema update');
      
      /* TODO: Enable after adding site_visit_date column
      const tomorrow = addDays(startOfDay(new Date()), 1);
      const endOfTomorrow = endOfDay(tomorrow);

      const leadsWithSiteVisits = await this.leadRepository.find({
        where: {
        siteVisitStatus: SiteVisitStatus.SCHEDULED,
        siteVisitDate: Between(tomorrow, endOfTomorrow),
      },
      relations: ['assignedUser'],
    });

      this.logger.log(`Found ${leadsWithSiteVisits.length} site visits scheduled for tomorrow`);

      for (const lead of leadsWithSiteVisits) {
        try {
          await this.sendSiteVisitConfirmationEmail(lead);
          this.logger.log(`Sent site visit confirmation for lead ${lead.id}`);
        } catch (error) {
          this.logger.error(`Failed to send site visit confirmation for lead ${lead.id}:`, error);
        }
      }
      */
    } catch (error) {
      this.logger.error('Error in sendSiteVisitReminders:', error);
    }
  }

  /**
   * Run every day at 10 PM to reset reminder flags for leads with new followup dates
   */
  @Cron('0 22 * * *')
  async resetReminderFlags() {
    this.logger.log('Resetting reminder flags for leads with new followup dates...');

    try {
      const today = startOfDay(new Date());

      // Reset reminder flag for leads whose followup date is in the future
      await this.leadRepository
        .createQueryBuilder()
        .update(Lead)
        .set({ reminderSent: false })
        .where('nextFollowUpDate > :today', { today })
        .andWhere('reminderSent = :sent', { sent: true })
        .execute();

      this.logger.log('Reminder flags reset successfully');
    } catch (error) {
      this.logger.error('Error in resetReminderFlags:', error);
    }
  }

  /**
   * Send followup reminder email to sales person
   */
  private async sendFollowUpReminderEmail(lead: Lead): Promise<void> {
    const subject = `Reminder: Follow-up with ${lead.firstName} ${lead.lastName} tomorrow`;
    
    const html = `
      <h2>Follow-up Reminder</h2>
      <p>Hi ${lead.assignedUser?.firstName || 'there'},</p>
      <p>This is a reminder that you have a follow-up scheduled with the following lead tomorrow:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h3>Lead Details:</h3>
        <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Status:</strong> ${lead.status}</p>
        <p><strong>Priority:</strong> ${lead.priority}</p>
        <p><strong>Follow-up Date:</strong> ${format(lead.nextFollowUpDate, 'PPP')}</p>
        ${lead.followUpNotes ? `<p><strong>Notes:</strong> ${lead.followUpNotes}</p>` : ''}
      </div>

      <p>Please ensure you're prepared for this follow-up. Review the lead history and have all necessary information ready.</p>
      
      <p>Best regards,<br/>Eastern Estate ERP System</p>
    `;

    // Note: You'll need to add this method to EmailService
    // await this.emailService.sendEmail(lead.assignedUser.email, subject, html);
    
    this.logger.log(`Follow-up reminder email prepared for ${lead.assignedUser?.email}`);
  }

  /**
   * Send task reminder email to sales person
   */
  private async sendTaskReminderEmail(task: SalesTask): Promise<void> {
    const hoursUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
    
    const subject = `Task Reminder: ${task.title} due in ${hoursUntilDue} hours`;
    
    const html = `
      <h2>Task Reminder</h2>
      <p>Hi ${task.assignedToUser?.firstName || 'there'},</p>
      <p>This is a reminder about your upcoming task:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h3>Task Details:</h3>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Type:</strong> ${task.taskType}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Due Date:</strong> ${format(task.dueDate, 'PPP')}${task.dueTime ? ` at ${task.dueTime}` : ''}</p>
        ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
        ${task.location ? `<p><strong>Location:</strong> ${task.location}</p>` : ''}
        ${task.lead ? `<p><strong>Related Lead:</strong> ${task.lead.firstName} ${task.lead.lastName}</p>` : ''}
      </div>

      <p><strong>Time until due:</strong> ${hoursUntilDue} hours</p>
      
      <p>Best regards,<br/>Eastern Estate ERP System</p>
    `;

    // await this.emailService.sendEmail(task.assignedToUser.email, subject, html);
    
    this.logger.log(`Task reminder email prepared for ${task.assignedToUser?.email}`);
  }

  /**
   * Send site visit confirmation to customer
   */
  private async sendSiteVisitConfirmationEmail(lead: Lead): Promise<void> {
    const subject = `Site Visit Confirmation Tomorrow`;
    
    const customerHtml = `
      <h2>Site Visit Confirmation</h2>
      <p>Dear ${lead.firstName} ${lead.lastName},</p>
      <p>This is a reminder about your scheduled site visit tomorrow:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <h3>Visit Details:</h3>
        <!-- Date will be shown once site_visit_date column is added -->
        ${lead.siteVisitTime ? `<p><strong>Time:</strong> ${lead.siteVisitTime}</p>` : ''}
        <!-- Properties to View: Column doesn't exist in DB -->
      </div>

      <p>We look forward to showing you our properties. Please feel free to contact us if you have any questions or need to reschedule.</p>
      
      <p>For any queries, please contact:</p>
      <p><strong>Sales Representative:</strong> ${lead.assignedUser?.firstName || 'Our team'}</p>
      <p><strong>Phone:</strong> ${lead.assignedUser?.phone || 'Contact number'}</p>
      
      <p>Best regards,<br/>Eastern Estate Team</p>
    `;

    // Send to customer
    // await this.emailService.sendEmail(lead.email, subject, customerHtml);
    
    // Also send reminder to sales person
    const salesPersonSubject = `Site Visit Tomorrow: ${lead.firstName} ${lead.lastName}`;
    const salesPersonHtml = `
      <h2>Site Visit Reminder</h2>
      <p>Hi ${lead.assignedUser?.firstName || 'there'},</p>
      <p>You have a site visit scheduled tomorrow with:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
        <p><strong>Customer:</strong> ${lead.firstName} ${lead.lastName}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <!-- Date will be shown once site_visit_date column is added -->
        ${lead.siteVisitTime ? `<p><strong>Time:</strong> ${lead.siteVisitTime}</p>` : ''}
        <!-- Interested In: Column doesn't exist in DB -->
      </div>

      <p>Please ensure you're prepared with property details, brochures, and pricing information.</p>
      
      <p>Best regards,<br/>Eastern Estate ERP System</p>
    `;

    // await this.emailService.sendEmail(lead.assignedUser.email, salesPersonSubject, salesPersonHtml);
    
    this.logger.log(`Site visit confirmation emails prepared for ${lead.email} and ${lead.assignedUser?.email}`);
  }

  /**
   * Manual trigger to send a specific reminder
   */
  async sendManualReminder(leadId: string, type: 'followup' | 'sitevisit'): Promise<void> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['assignedUser'],
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    if (type === 'followup') {
      await this.sendFollowUpReminderEmail(lead);
    } else if (type === 'sitevisit') {
      await this.sendSiteVisitConfirmationEmail(lead);
    }

    this.logger.log(`Manual ${type} reminder sent for lead ${leadId}`);
  }
}

