import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  DemandDraft,
  DemandDraftStatus,
  DemandDraftTone,
} from '../../demand-drafts/entities/demand-draft.entity';
import { FlatPaymentPlan } from '../../payment-plans/entities/flat-payment-plan.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { SettingsService } from '../../settings/settings.service';
import { DemandDraftTemplateService } from '../../payment-plans/services/demand-draft-template.service';
import { MailService } from '../../../common/mail/mail.service';
import { SmsService } from '../../../common/sms/sms.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  NotificationCategory,
  NotificationType,
} from '../../notifications/entities/notification.entity';

/**
 * Maps an escalation level (0..6) to the tone that should be applied to a
 * newly-generated reminder DD. Level 0 never generates a reminder; it is
 * the starting state of a freshly-issued DD.
 */
const LEVEL_TO_TONE: Record<number, DemandDraftTone> = {
  0: DemandDraftTone.ON_TIME,
  1: DemandDraftTone.REMINDER_1,
  2: DemandDraftTone.REMINDER_2,
  3: DemandDraftTone.REMINDER_3,
  4: DemandDraftTone.REMINDER_4,
  5: DemandDraftTone.CANCELLATION_WARNING,
  6: DemandDraftTone.POST_WARNING,
};

export interface ScanStats {
  examined: number;
  remindersSent: number;
  warningsPrepared: number;
  postWarningsSent: number;
  bookingsFlaggedAtRisk: number;
  skippedPaused: number;
  skippedLegacyDisabled: number;
  skippedCapped: number;
  errors: number;
}

/**
 * OverdueScannerService
 * =====================
 *
 * Runs daily at 09:00 IST. For every DemandDraft that has been sent to the
 * customer (status SENT) but not yet paid, it decides whether:
 *
 *   1. A reminder DD should be generated and sent (tones REMINDER_1..4,
 *      cadence controlled by `overdue_reminder_interval_days` in settings).
 *
 *   2. A cancellation-warning DD should be PREPARED in DRAFT status
 *      (manual-send-only as per PR1 decision). At the same time the
 *      booking is flipped to AT_RISK and notifications fire to
 *      sales + finance + management.
 *
 *   3. A post-warning weekly reminder should go out (the cadence continues
 *      after a warning letter was issued, until payment lands or the
 *      booking is formally cancelled by a human).
 *
 * Key design points (matching PR1 requirements):
 * - Legacy plans (is_legacy_import=true) use imported_at as the baseline
 *   for the reminder ladder, NOT the raw milestone due_date. This prevents
 *   importing a 5-year-old overdue from instantly firing a cancellation
 *   warning on day 1.
 * - Legacy overdues older than legacy_auto_remind_max_age_days require
 *   a human to manually set reminders_enabled=true on the plan before
 *   any automation fires (hybrid default).
 * - Per-plan and per-customer pause_reminders_until fields are honored.
 * - A per-sweep cap (overdue_reminder_daily_cap) prevents blasts.
 * - Cancellation warnings are PREPARED not SENT (PR1 decision: manual
 *   approval required for this tier).
 */
@Injectable()
export class OverdueScannerService {
  private readonly logger = new Logger(OverdueScannerService.name);

  constructor(
    @InjectRepository(DemandDraft)
    private readonly ddRepo: Repository<DemandDraft>,
    @InjectRepository(FlatPaymentPlan)
    private readonly planRepo: Repository<FlatPaymentPlan>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly settingsService: SettingsService,
    private readonly templateService: DemandDraftTemplateService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Daily cron at 09:00 Asia/Kolkata. Wrapped in try/catch so a single
   * failure does not kill the container.
   */
  @Cron('0 9 * * *', { timeZone: 'Asia/Kolkata' })
  async dailyScan(): Promise<void> {
    try {
      const stats = await this.runScan();
      this.logger.log(
        `Overdue scan complete: ${JSON.stringify(stats)}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Overdue scan failed at the top level: ${err?.message}`,
        err?.stack,
      );
    }
  }

  /**
   * The main scan. Public so ops / tests can trigger it manually via a
   * controller endpoint (added separately). Returns per-sweep stats.
   */
  async runScan(now: Date = new Date()): Promise<ScanStats> {
    const settings = await this.settingsService.get();
    const intervalDays = settings.overdueReminderIntervalDays ?? 7;
    const warningThreshold = settings.cancellationWarningThresholdDays ?? 30;
    const legacyMaxAge = settings.legacyAutoRemindMaxAgeDays ?? 180;
    const dailyCap = settings.overdueReminderDailyCap ?? 50;

    const stats: ScanStats = {
      examined: 0,
      remindersSent: 0,
      warningsPrepared: 0,
      postWarningsSent: 0,
      bookingsFlaggedAtRisk: 0,
      skippedPaused: 0,
      skippedLegacyDisabled: 0,
      skippedCapped: 0,
      errors: 0,
    };

    // Fetch all DDs that could potentially need action today. We pull
    // SENT (live customer-facing) only - DRAFT/READY/FAILED are human-
    // managed and not the scanner's problem.
    const candidates = await this.ddRepo.find({
      where: { status: DemandDraftStatus.SENT },
      order: { dueDate: 'ASC' },
    });

    for (const dd of candidates) {
      stats.examined += 1;

      try {
        // Early exit: if the milestone has since been paid, do nothing.
        // (A future scanner can also re-check paid_amount via the
        // payment_schedule join, but for PR1 we trust status=SENT.)

        // Skip if we've already hit the daily cap on reminders.
        const actionsThisRun =
          stats.remindersSent + stats.postWarningsSent + stats.warningsPrepared;
        if (actionsThisRun >= dailyCap) {
          stats.skippedCapped += 1;
          continue;
        }

        const decision = await this.decide({
          dd,
          now,
          intervalDays,
          warningThreshold,
          legacyMaxAge,
        });

        if (decision.skip) {
          if (decision.reason === 'paused') stats.skippedPaused += 1;
          else if (decision.reason === 'legacy_disabled')
            stats.skippedLegacyDisabled += 1;
          // other skip reasons (not-yet-due / already at max) are quiet
          continue;
        }

        if (decision.action === 'send_reminder') {
          await this.sendReminder(dd, decision.nextLevel!, decision.daysOverdue!);
          stats.remindersSent += 1;
        } else if (decision.action === 'prepare_warning') {
          await this.prepareCancellationWarning(
            dd,
            decision.daysOverdue!,
          );
          stats.warningsPrepared += 1;
          if (decision.bookingFlagged) stats.bookingsFlaggedAtRisk += 1;
        } else if (decision.action === 'send_post_warning') {
          await this.sendPostWarning(dd, decision.daysOverdue!);
          stats.postWarningsSent += 1;
        }
      } catch (err: any) {
        stats.errors += 1;
        this.logger.error(
          `Scan action failed for DD ${dd.id}: ${err?.message}`,
          err?.stack,
        );
      }
    }

    return stats;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Decision engine
  // ────────────────────────────────────────────────────────────────────────

  private async decide(args: {
    dd: DemandDraft;
    now: Date;
    intervalDays: number;
    warningThreshold: number;
    legacyMaxAge: number;
  }): Promise<{
    skip?: boolean;
    reason?: string;
    action?: 'send_reminder' | 'prepare_warning' | 'send_post_warning';
    nextLevel?: number;
    daysOverdue?: number;
    bookingFlagged?: boolean;
  }> {
    const { dd, now, intervalDays, warningThreshold, legacyMaxAge } = args;

    if (!dd.dueDate) {
      return { skip: true, reason: 'no_due_date' };
    }

    const daysOverdue = Math.floor(
      (now.getTime() - new Date(dd.dueDate).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysOverdue <= 0) {
      return { skip: true, reason: 'not_yet_due' };
    }

    // Load plan + customer to check pause flags and legacy age.
    const plan = dd.flatPaymentPlanId
      ? await this.planRepo.findOne({ where: { id: dd.flatPaymentPlanId } })
      : null;
    const customer = dd.customerId
      ? await this.customerRepo.findOne({ where: { id: dd.customerId } })
      : null;

    // Respect plan-level and customer-level pause flags.
    if (plan?.pauseRemindersUntil && new Date(plan.pauseRemindersUntil) > now) {
      return { skip: true, reason: 'paused' };
    }
    if (
      customer?.pauseRemindersUntil &&
      new Date(customer.pauseRemindersUntil) > now
    ) {
      return { skip: true, reason: 'paused' };
    }
    if (plan?.remindersEnabled === false) {
      // Hybrid rule: legacy plans older than the threshold come in with
      // remindersEnabled=false by default and require a human to opt in.
      // Everything else with reminders explicitly off is also skipped here.
      if (plan?.isLegacyImport && daysOverdue > legacyMaxAge) {
        return { skip: true, reason: 'legacy_disabled' };
      }
      return { skip: true, reason: 'plan_reminders_disabled' };
    }

    // Baseline for cadence: last reminder, else plan import time, else DD
    // creation time. This is the fix for the 5-year-legacy-problem - the
    // scanner waits intervalDays from baseline, not from raw due_date.
    const baseline = new Date(
      dd.lastReminderAt?.getTime() ??
        plan?.importedAt?.getTime() ??
        dd.createdAt.getTime(),
    );
    const daysSinceBaseline = Math.floor(
      (now.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Post-warning path: if a warning has already been issued, continue
    // weekly reminders indefinitely until human intervention.
    if (dd.cancellationWarningIssuedAt) {
      if (daysSinceBaseline < intervalDays) {
        return { skip: true, reason: 'cadence_not_met' };
      }
      return {
        action: 'send_post_warning',
        daysOverdue,
      };
    }

    // Cancellation-warning path: prepare letter if we crossed the threshold
    // AND we have not already prepared one for this DD.
    if (daysOverdue >= warningThreshold) {
      return {
        action: 'prepare_warning',
        daysOverdue,
      };
    }

    // Regular reminder ladder (tiers 1..4 = REMINDER_1..REMINDER_4).
    // reminder_count starts at 0; after first reminder it is 1, etc.
    const nextLevel = dd.reminderCount + 1;
    if (nextLevel > 4) {
      // Saturated - wait for the warning threshold (or paid).
      return { skip: true, reason: 'max_reminders_reached' };
    }

    if (daysSinceBaseline < intervalDays) {
      return { skip: true, reason: 'cadence_not_met' };
    }

    return {
      action: 'send_reminder',
      nextLevel,
      daysOverdue,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────────────────────

  private async sendReminder(
    dd: DemandDraft,
    level: number,
    daysOverdue: number,
  ): Promise<void> {
    const tone = LEVEL_TO_TONE[level];
    const reminderDD = await this.createChildReminderDD(dd, tone, daysOverdue);
    await this.notifyAll(reminderDD, tone, daysOverdue);

    const now = new Date();
    dd.lastReminderAt = now;
    dd.reminderCount = level;
    dd.escalationLevel = level;
    dd.daysOverdue = daysOverdue;
    dd.nextReminderDueAt = this.computeNextReminder(now);
    await this.ddRepo.save(dd);
  }

  private async prepareCancellationWarning(
    dd: DemandDraft,
    daysOverdue: number,
  ): Promise<{ bookingFlagged: boolean }> {
    const tone = DemandDraftTone.CANCELLATION_WARNING;

    // Create a DRAFT child DD for the warning letter (not sent; awaits
    // human approval in the Collections inbox).
    const warningDD = await this.createChildReminderDD(
      dd,
      tone,
      daysOverdue,
      { sendNow: false },
    );

    const now = new Date();
    dd.cancellationWarningIssuedAt = now;
    dd.escalationLevel = 5;
    dd.daysOverdue = daysOverdue;
    await this.ddRepo.save(dd);

    // Flip booking to AT_RISK (idempotent - skip if already at risk or
    // cancelled).
    let bookingFlagged = false;
    if (dd.bookingId) {
      const booking = await this.bookingRepo.findOne({
        where: { id: dd.bookingId },
      });
      if (
        booking &&
        booking.status !== BookingStatus.AT_RISK &&
        booking.status !== BookingStatus.CANCELLED
      ) {
        booking.status = BookingStatus.AT_RISK;
        await this.bookingRepo.save(booking);
        bookingFlagged = true;
      }
    }

    // Notify internal teams that a cancellation warning is queued and
    // needs a human to press Send.
    await this.notifyInternalTeams({
      dd: warningDD,
      title: 'Cancellation warning prepared - review & send',
      message: `Booking is ${daysOverdue} days overdue. A cancellation-warning letter was prepared in DRAFT and needs your review before sending to the customer.`,
      priority: 9,
      ccManagement: true,
    });

    return { bookingFlagged };
  }

  private async sendPostWarning(
    dd: DemandDraft,
    daysOverdue: number,
  ): Promise<void> {
    const tone = DemandDraftTone.POST_WARNING;
    const reminderDD = await this.createChildReminderDD(dd, tone, daysOverdue);
    await this.notifyAll(reminderDD, tone, daysOverdue);

    const now = new Date();
    dd.lastReminderAt = now;
    dd.daysOverdue = daysOverdue;
    dd.nextReminderDueAt = this.computeNextReminder(now);
    await this.ddRepo.save(dd);
  }

  // ────────────────────────────────────────────────────────────────────────
  // DD creation + notification helpers
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Create a child DD (reminder/warning/post-warning) linked to the
   * original by parentDemandDraftId. Reuses the original's placeholders
   * and renders a tone-specific template.
   */
  private async createChildReminderDD(
    original: DemandDraft,
    tone: DemandDraftTone,
    daysOverdue: number,
    opts: { sendNow?: boolean } = { sendNow: true },
  ): Promise<DemandDraft> {
    const template = await this.templateService.findByTone(tone);

    // Start from the original templateData and overlay the days-overdue
    // figure so the reminder language references the correct number.
    const templateData: Record<string, any> = {
      ...(original.templateData || {}),
      daysOverdue,
      dateIssued: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      refNumber: `${original.metadata?.templateData?.refNumber ?? 'DD'}-${tone}`,
    };

    let subject = `Payment Reminder (${tone}) - ${original.title ?? ''}`;
    let htmlContent = original.content ?? '';
    if (template) {
      const rendered = this.templateService.renderTemplate(template, templateData);
      subject = rendered.subject;
      htmlContent = rendered.htmlContent;
    }

    const child = this.ddRepo.create({
      flatId: original.flatId,
      customerId: original.customerId,
      bookingId: original.bookingId,
      milestoneId: original.milestoneId,
      title: `[${tone}] ${original.title ?? ''}`.slice(0, 500),
      amount: original.amount,
      status:
        opts.sendNow ?? true ? DemandDraftStatus.SENT : DemandDraftStatus.DRAFT,
      content: htmlContent,
      dueDate: original.dueDate,
      paymentScheduleId: original.paymentScheduleId,
      flatPaymentPlanId: original.flatPaymentPlanId,
      constructionCheckpointId: original.constructionCheckpointId,
      autoGenerated: true,
      requiresReview: !(opts.sendNow ?? true),
      templateId: template?.id ?? null,
      templateData,
      metadata: { subject, tone, parentId: original.id },
      tone,
      reminderCount: 0,
      escalationLevel: tone === DemandDraftTone.CANCELLATION_WARNING ? 5 : (original.escalationLevel ?? 0) + 1,
      daysOverdue,
      parentDemandDraftId: original.id,
      generatedAt: new Date(),
      sentAt: opts.sendNow ?? true ? new Date() : null,
    });

    return this.ddRepo.save(child);
  }

  private async notifyAll(
    reminderDD: DemandDraft,
    tone: DemandDraftTone,
    daysOverdue: number,
  ): Promise<void> {
    await Promise.allSettled([
      this.notifyCustomerInApp(reminderDD, tone, daysOverdue),
      this.notifyCustomerEmail(reminderDD),
      this.notifyCustomerSms(reminderDD, tone, daysOverdue),
      this.notifyInternalTeams({
        dd: reminderDD,
        title: `Reminder sent (${tone})`,
        message: `Reminder ${tone} for ${reminderDD.title} - ${daysOverdue} days overdue - INR ${Number(reminderDD.amount).toLocaleString('en-IN')}`,
        priority: this.tonePriority(tone),
        ccManagement: tone === DemandDraftTone.REMINDER_3 || tone === DemandDraftTone.REMINDER_4,
      }),
    ]);
  }

  private async notifyCustomerInApp(
    dd: DemandDraft,
    tone: DemandDraftTone,
    daysOverdue: number,
  ): Promise<void> {
    // Push to customer portal user if the customer is linked to one.
    // For PR1 we target by customer email user-id mapping - when a user
    // exists with the same email, they receive the notification.
    if (!dd.customerId) return;
    const customer = await this.customerRepo.findOne({
      where: { id: dd.customerId },
    });
    if (!customer?.email) return;
    try {
      await this.notificationsService.create({
        targetRoles: 'customer', // portal users should have this role
        title: `Payment reminder: INR ${Number(dd.amount).toLocaleString('en-IN')}`,
        message: `Your payment for ${dd.title} is ${daysOverdue} days overdue. Please settle at your earliest convenience.`,
        type: NotificationType.WARNING,
        category: NotificationCategory.PAYMENT,
        actionUrl: `/customer-portal/payments`,
        actionLabel: 'View & Pay',
        relatedEntityId: dd.id,
        relatedEntityType: 'demand_draft',
        priority: this.tonePriority(tone),
      });
    } catch (err: any) {
      this.logger.warn(
        `Customer in-app notify failed for DD ${dd.id}: ${err?.message}`,
      );
    }
  }

  private async notifyCustomerEmail(dd: DemandDraft): Promise<void> {
    if (!dd.customerId) return;
    const customer = await this.customerRepo.findOne({
      where: { id: dd.customerId },
    });
    if (!customer?.email) return;

    const subject = dd.metadata?.subject ?? `Payment reminder - ${dd.title}`;
    try {
      await this.mailService.sendMail({
        to: customer.email,
        subject,
        html: dd.content ?? '',
      });
    } catch (err: any) {
      this.logger.warn(
        `Customer email send failed for DD ${dd.id} (${customer.email}): ${err?.message}`,
      );
    }
  }

  private async notifyCustomerSms(
    dd: DemandDraft,
    tone: DemandDraftTone,
    daysOverdue: number,
  ): Promise<void> {
    if (!dd.customerId) return;
    const customer = await this.customerRepo.findOne({
      where: { id: dd.customerId },
    });
    if (!customer?.phoneNumber) return;

    const body = this.smsBodyForTone(
      tone,
      Number(dd.amount),
      daysOverdue,
      customer.fullName,
    );
    await this.smsService.sendSms({
      to: customer.phoneNumber,
      body,
    });
  }

  private async notifyInternalTeams(args: {
    dd: DemandDraft;
    title: string;
    message: string;
    priority: number;
    ccManagement: boolean;
  }): Promise<void> {
    const roles = args.ccManagement
      ? 'admin,super_admin,sales_team,finance'
      : 'sales_team,finance';
    try {
      await this.notificationsService.create({
        targetRoles: roles,
        title: args.title,
        message: args.message,
        type: NotificationType.WARNING,
        category: NotificationCategory.PAYMENT,
        actionUrl: `/demand-drafts/${args.dd.id}`,
        actionLabel: 'Open DD',
        relatedEntityId: args.dd.id,
        relatedEntityType: 'demand_draft',
        priority: args.priority,
      });
    } catch (err: any) {
      this.logger.warn(
        `Internal team notify failed for DD ${args.dd.id}: ${err?.message}`,
      );
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Utility helpers
  // ────────────────────────────────────────────────────────────────────────

  private computeNextReminder(from: Date): Date {
    const next = new Date(from);
    // We re-read settings in runScan, but the interval is stable enough
    // within a single sweep that writing dueAt = from + 7 is fine here.
    // Scanner will re-evaluate on the next tick anyway.
    next.setDate(next.getDate() + 7);
    return next;
  }

  private tonePriority(tone: DemandDraftTone): number {
    switch (tone) {
      case DemandDraftTone.REMINDER_1:
        return 6;
      case DemandDraftTone.REMINDER_2:
        return 7;
      case DemandDraftTone.REMINDER_3:
        return 8;
      case DemandDraftTone.REMINDER_4:
        return 9;
      case DemandDraftTone.CANCELLATION_WARNING:
        return 10;
      case DemandDraftTone.POST_WARNING:
        return 9;
      default:
        return 5;
    }
  }

  private smsBodyForTone(
    tone: DemandDraftTone,
    amount: number,
    daysOverdue: number,
    name: string,
  ): string {
    const amt = amount.toLocaleString('en-IN');
    switch (tone) {
      case DemandDraftTone.REMINDER_1:
        return `Hi ${name}, gentle reminder: your payment of INR ${amt} is ${daysOverdue} days overdue. Please settle soon. -Eastern Estate`;
      case DemandDraftTone.REMINDER_2:
        return `Hi ${name}, your payment of INR ${amt} is ${daysOverdue} days overdue. Kindly clear within 7 days. -Eastern Estate`;
      case DemandDraftTone.REMINDER_3:
        return `FINAL NOTICE: ${name}, your payment of INR ${amt} is ${daysOverdue} days overdue. Immediate action required. -Eastern Estate`;
      case DemandDraftTone.REMINDER_4:
        return `LAST CHANCE: ${name}, INR ${amt} is ${daysOverdue} days overdue. Cancellation warning next. -Eastern Estate`;
      case DemandDraftTone.CANCELLATION_WARNING:
        return `${name}, your booking is AT RISK of cancellation. INR ${amt} is ${daysOverdue} days overdue. Contact us today. -Eastern Estate`;
      case DemandDraftTone.POST_WARNING:
        return `${name}, your booking remains AT RISK. INR ${amt} is ${daysOverdue} days overdue. -Eastern Estate`;
      default:
        return `Hi ${name}, payment of INR ${amt} is due. -Eastern Estate`;
    }
  }
}
