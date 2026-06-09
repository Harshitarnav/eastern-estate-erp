import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentSchedule, ScheduleStatus } from '../entities/payment-schedule.entity';
import { FlatPaymentPlan, FlatPaymentPlanStatus } from '../../payment-plans/entities/flat-payment-plan.entity';
import { FlatPaymentPlanService } from '../../payment-plans/services/flat-payment-plan.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import {
  DemandDraft,
  DemandDraftStatus,
} from '../../demand-drafts/entities/demand-draft.entity';
import { PaymentType } from '../entities/payment.entity';

/**
 * Payment Completion Workflow Service
 * 
 * Handles the complete payment workflow:
 * 1. Records payment against payment schedule
 * 2. Updates flat payment plan milestone status
 * 3. Updates flat details with payment information
 * 4. Marks booking as paid if fully paid
 */
@Injectable()
export class PaymentCompletionService {
  private readonly logger = new Logger(PaymentCompletionService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentSchedule)
    private readonly paymentScheduleRepository: Repository<PaymentSchedule>,
    @InjectRepository(FlatPaymentPlan)
    private readonly flatPaymentPlanRepository: Repository<FlatPaymentPlan>,
    @InjectRepository(Flat)
    private readonly flatRepository: Repository<Flat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(DemandDraft)
    private readonly demandDraftRepository: Repository<DemandDraft>,
    private readonly flatPaymentPlanService: FlatPaymentPlanService,
  ) {}

  /**
   * Process payment completion and update all related records
   */
  async processPaymentCompletion(paymentId: string): Promise<{
    payment: Payment;
    paymentSchedule: PaymentSchedule | null;
    flatPaymentPlan: FlatPaymentPlan | null;
    flat: Flat | null;
    booking: Booking | null;
  }> {
    // Get payment with relations
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    this.logger.log(`Processing payment completion for payment ${paymentId}`);

    // Find associated payment schedule
    let paymentSchedule: PaymentSchedule | null = null;
    let flatPaymentPlan: FlatPaymentPlan | null = null;
    let flat: Flat | null = null;
    let booking: Booking | null = null;

    if (payment.bookingId) {
      booking = await this.bookingRepository.findOne({
        where: { id: payment.bookingId },
        relations: ['flat'],
      });

      if (booking && booking.flatId) {
        flat = booking.flat;

        // Find flat payment plan
        flatPaymentPlan = await this.flatPaymentPlanRepository.findOne({
          where: { 
            flatId: booking.flatId, 
            bookingId: booking.id,
            status: FlatPaymentPlanStatus.ACTIVE 
          },
        });

        // Try to find matching payment schedule
        if (flatPaymentPlan) {
          // Find payment schedule that matches this payment
            const schedules = await this.paymentScheduleRepository.find({
            where: { bookingId: booking.id },
            order: { installmentNumber: 'ASC' },
          });

          // Match by milestone name or find first unpaid
          for (const schedule of schedules) {
            const balanceAmount = schedule.amount - (schedule.paidAmount || 0);
            if (schedule.status === ScheduleStatus.PENDING || balanceAmount > 0) {
              // Find corresponding milestone
              const milestone = flatPaymentPlan.milestones.find(
                m => m.name === schedule.milestone || m.sequence === schedule.installmentNumber
              );

              if (milestone && milestone.status === 'TRIGGERED') {
                paymentSchedule = schedule;
                break;
              }
            }
          }

          // If no match found, use first pending schedule
          if (!paymentSchedule) {
            paymentSchedule = schedules.find(s => s.status === ScheduleStatus.PENDING) || null;
          }
        }
      }
    }

    // Update payment schedule if found
    if (paymentSchedule) {
      await this.updatePaymentSchedule(paymentSchedule, payment);
    }

    // Update flat payment plan milestone if found
    if (flatPaymentPlan && paymentSchedule) {
      await this.updateFlatPaymentPlanMilestone(
        flatPaymentPlan,
        paymentSchedule,
        payment
      );
    }

    // Close any open demand drafts that demanded this milestone's money.
    // A payment typically settles one milestone, which in turn has a root
    // DD plus optional reminder / warning children that all share the
    // same payment_schedule_id. Closing them together keeps the
    // Collections inbox and overdue scanner consistent with the ledger.
    try {
      await this.closeDemandDraftsForPayment({
        payment,
        paymentSchedule,
        flatPaymentPlan,
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to close DDs for payment ${payment.id}: ${err.message}`,
      );
    }

    // Update flat details
    if (flat) {
      await this.updateFlatPaymentStatus(flat, payment);
    }

    // Update booking
    if (booking) {
      await this.updateBookingPaymentStatus(booking, payment);
    }

    this.logger.log(`Completed payment processing for payment ${paymentId}`);

    return {
      payment,
      paymentSchedule,
      flatPaymentPlan,
      flat,
      booking,
    };
  }

  /**
   * Update payment schedule with payment information
   */
  private async updatePaymentSchedule(
    schedule: PaymentSchedule,
    payment: Payment
  ): Promise<void> {
    const balanceAmount = schedule.amount - (schedule.paidAmount || 0);
    const amountToApply = Math.min(payment.amount, balanceAmount);

    schedule.paidAmount = (schedule.paidAmount || 0) + amountToApply;
    const newBalance = schedule.amount - schedule.paidAmount;
    
    if (newBalance <= 0) {
      schedule.status = ScheduleStatus.PAID;
      schedule.paidDate = payment.paymentDate;
    } else {
      schedule.status = ScheduleStatus.PARTIAL;
    }

    await this.paymentScheduleRepository.save(schedule);
    
    this.logger.log(
      `Updated payment schedule ${schedule.id}: paid=${schedule.paidAmount}, balance=${newBalance}`
    );
  }

  /**
   * Update flat payment plan milestone
   */
  private async updateFlatPaymentPlanMilestone(
    flatPaymentPlan: FlatPaymentPlan,
    schedule: PaymentSchedule,
    payment: Payment
  ): Promise<void> {
    // Find milestone matching the schedule
    const milestone = flatPaymentPlan.milestones.find(
      m => m.name === schedule.milestone || 
           m.sequence === schedule.installmentNumber ||
           m.paymentScheduleId === schedule.id
    );

    if (!milestone) {
      this.logger.warn(
        `No matching milestone found in payment plan ${flatPaymentPlan.id} for schedule ${schedule.id}`
      );
      return;
    }

    // Update milestone status
    await this.flatPaymentPlanService.updateMilestone(
      flatPaymentPlan.id,
      milestone.sequence,
      {
        status: 'PAID',
        paymentId: payment.id,
        completedAt: new Date().toISOString(),
      },
      'SYSTEM',
    );

    this.logger.log(
      `Updated milestone ${milestone.sequence} in payment plan ${flatPaymentPlan.id} to PAID`
    );
  }

  /**
   * Close any open DemandDraft rows that were demanding the money this
   * payment just settled.
   *
   * The match is intentionally best-effort and layered, from most to
   * least specific:
   *
   *  1. Same payment_schedule_id (all the root + reminder + warning DDs
   *     generated off one milestone share this).
   *  2. Same flat_payment_plan_id + milestone_id (covers DDs created
   *     before the schedule linkage was added).
   *  3. Same booking_id with matching amount (last-ditch heuristic for
   *     legacy imports that have no schedule/milestone linkage).
   *
   * Every matched DD - plus every reminder / warning child chained to
   * those roots via parent_demand_draft_id - is flipped to PAID so it
   * drops out of the Collections inbox and the overdue scanner stops
   * escalating it. Only open statuses (DRAFT / READY / SENT / FAILED)
   * are touched; anything already PAID is left alone for idempotency.
   */
  private async closeDemandDraftsForPayment(params: {
    payment: Payment;
    paymentSchedule: PaymentSchedule | null;
    flatPaymentPlan: FlatPaymentPlan | null;
  }): Promise<void> {
    const { payment, paymentSchedule, flatPaymentPlan } = params;

    const openStatuses = [
      DemandDraftStatus.DRAFT,
      DemandDraftStatus.READY,
      DemandDraftStatus.SENT,
      DemandDraftStatus.FAILED,
      // PRIMARY_PAID DDs can be fully closed by a later registry payment
      DemandDraftStatus.PRIMARY_PAID,
    ];

    // Layer 1: DDs linked directly to the schedule we just settled.
    let matches: DemandDraft[] = [];
    if (paymentSchedule) {
      matches = await this.demandDraftRepository.find({
        where: {
          paymentScheduleId: paymentSchedule.id,
          status: In(openStatuses),
        },
      });
    }

    // Layer 2: fall back to milestone id on the same plan.
    if (!matches.length && flatPaymentPlan && paymentSchedule?.milestone) {
      matches = await this.demandDraftRepository.find({
        where: {
          flatPaymentPlanId: flatPaymentPlan.id,
          milestoneId: paymentSchedule.milestone,
          status: In(openStatuses),
        },
      });
    }

    // Layer 3: booking-scoped amount-match fallback for legacy DDs.
    if (!matches.length && payment.bookingId) {
      const amt = Number(payment.amount) || 0;
      if (amt > 0) {
        matches = await this.demandDraftRepository
          .createQueryBuilder('dd')
          .where('dd.booking_id = :bookingId', { bookingId: payment.bookingId })
          .andWhere('dd.status IN (:...openStatuses)', { openStatuses })
          .andWhere('ROUND(dd.amount::numeric, 0) = ROUND(:amt::numeric, 0)', { amt })
          .orderBy('dd.created_at', 'ASC')
          .limit(1)
          .getMany();
      }
    }

    if (!matches.length) return;

    // Expand to full thread (root + all reminder/warning children).
    const rootIds = new Set<string>();
    for (const dd of matches) {
      rootIds.add(dd.parentDemandDraftId ?? dd.id);
    }
    const thread = await this.demandDraftRepository
      .createQueryBuilder('dd')
      .where('dd.status IN (:...openStatuses)', { openStatuses })
      .andWhere(
        '(dd.id IN (:...rootIds) OR dd.parent_demand_draft_id IN (:...rootIds))',
        { rootIds: Array.from(rootIds) },
      )
      .getMany();

    const now = new Date();
    const paymentTaxPaid    = Number(payment.taxAmount) || 0;
    const paymentPrimaryPaid = Number(payment.primaryAmount) || 0;
    const isRegistryPayment  = payment.paymentType === PaymentType.REGISTRY;

    const EPS = 0.01;
    for (const dd of thread) {
      // A DD settles against its OWN demand. Arrears (other unpaid DDs) settle
      // via their own rows, so they are not folded in here — matching the
      // dynamic-arrears model in BookingFinancialSummaryService.
      const ddTaxDemanded     = Number(dd.taxAmount) || 0;
      const ddPrimaryDemanded = Number(dd.primaryAmount) || 0;
      const ddMiscDemanded    = Number(dd.miscAmount) || 0;

      let newStatus: DemandDraftStatus;
      let taxDeferredAmount = 0;

      const paymentMiscPaid = Number(payment.miscAmount) || 0;
      const grossPaid       = Number(payment.amount) || 0;
      const nonTaxDemanded  = ddPrimaryDemanded + ddMiscDemanded;
      const ddTotalDemanded = nonTaxDemanded + ddTaxDemanded;
      const nonTaxPaid      = paymentPrimaryPaid + paymentMiscPaid;

      // A DD is only fully PAID when EVERY category is settled. Checking the
      // categories (not just the gross amount) is what prevents a tax=0 DD —
      // i.e. every legacy DD after the v019 backfill — from being closed as
      // PAID by any partial payment (the old `paymentTaxPaid >= 0` trap).
      const nonTaxSettled = nonTaxPaid >= nonTaxDemanded - EPS;
      const taxSettled    = paymentTaxPaid >= ddTaxDemanded - EPS;

      // An "unsplit" payment carries no category intent (the whole amount sits
      // in primary because the recorder never allocated misc/tax). For those we
      // judge purely on the gross amount so a full lump payment isn't mistaken
      // for a deliberate tax deferral.
      const isUnsplit =
        paymentTaxPaid <= EPS &&
        paymentMiscPaid <= EPS &&
        Math.abs(paymentPrimaryPaid - grossPaid) <= EPS;

      if (isRegistryPayment) {
        // A registry payment settles tax that was deferred at PRIMARY_PAID time.
        // It only fully closes the DD when it actually covers the deferred tax;
        // an under-payment leaves the DD where it was (M1).
        const deferred = (Number(dd.taxDeferredAmount) || 0) || ddTaxDemanded;
        if (paymentTaxPaid >= deferred - EPS && nonTaxSettled) {
          newStatus = DemandDraftStatus.PAID;
        } else if (dd.status === DemandDraftStatus.PRIMARY_PAID) {
          newStatus = DemandDraftStatus.PRIMARY_PAID;
        } else {
          newStatus = DemandDraftStatus.PARTIALLY_PAID;
        }
      } else if (nonTaxSettled && taxSettled) {
        // Every category covered → fully closed.
        newStatus = DemandDraftStatus.PAID;
      } else if (isUnsplit) {
        // No category intent expressed — close only if the gross covers the
        // full demand, otherwise it's a genuine partial.
        newStatus =
          grossPaid >= ddTotalDemanded - EPS
            ? DemandDraftStatus.PAID
            : DemandDraftStatus.PARTIALLY_PAID;
      } else if (nonTaxSettled && paymentTaxPaid <= EPS && ddTaxDemanded > EPS) {
        // Primary + misc fully paid, tax deliberately left at zero on a split
        // payment → tax deferred to registry. Not chased by the overdue scanner.
        newStatus = DemandDraftStatus.PRIMARY_PAID;
        taxDeferredAmount = ddTaxDemanded;
      } else {
        // Anything else is a genuine partial — keep the DD live so collections
        // and the overdue scanner keep chasing the remaining balance (H2).
        newStatus = DemandDraftStatus.PARTIALLY_PAID;
      }

      dd.status = newStatus;
      // Closure (PAID or deliberate tax-deferral) stops the scanner and stamps
      // the paid date. A PARTIALLY_PAID DD is NOT closed: leave paidAt/
      // nextReminderDueAt untouched so it is still picked up for follow-up.
      const isClosure =
        newStatus === DemandDraftStatus.PAID ||
        newStatus === DemandDraftStatus.PRIMARY_PAID;
      if (isClosure) {
        dd.paidAt            = now;
        dd.paidPaymentId     = payment.id;
        dd.nextReminderDueAt = null;
      }
      if (taxDeferredAmount > 0) {
        dd.taxDeferredAmount = taxDeferredAmount;
        dd.taxDeferredAt     = now;
      }
      dd.metadata = {
        ...(dd.metadata || {}),
        closedBy: {
          paymentId:    payment.id,
          paymentCode:  payment.paymentCode,
          amount:       Number(payment.amount) || 0,
          primaryAmount: Number(payment.primaryAmount) || 0,
          miscAmount:    Number(payment.miscAmount) || 0,
          taxAmount:     Number(payment.taxAmount) || 0,
          closureStatus: newStatus,
          taxDeferred:   taxDeferredAmount,
          at:            now.toISOString(),
        },
      };
    }
    await this.demandDraftRepository.save(thread);

    this.logger.log(
      `Closed ${thread.length} DD(s) for payment ${payment.paymentCode} ` +
        `(roots: ${Array.from(rootIds).join(', ')})`,
    );
  }

  /**
   * Update flat payment status
   */
  private async updateFlatPaymentStatus(flat: Flat, payment: Payment): Promise<void> {
    // Note: This assumes Flat entity has these fields
    // If not present in your schema, this will need adjustment

    // Update paid amount (if flat tracks total paid)
    // flat.totalPaid = (flat.totalPaid || 0) + payment.amount;

    // You can add logic here to update flat status based on payment completion
    // For example: if fully paid, mark flat as 'SOLD_FULLY_PAID'

    await this.flatRepository.save(flat);
    
    this.logger.log(`Updated flat ${flat.id} payment information`);
  }

  /**
   * Update booking payment status
   */
  private async updateBookingPaymentStatus(
    booking: Booking,
    payment: Payment
  ): Promise<void> {
    // Coerce all amounts to Number - TypeORM returns decimals as strings by default,
    // which would otherwise concatenate instead of adding.
    const prevPaid = Number(booking.paidAmount) || 0;
    const total = Number(booking.totalAmount) || 0;
    const amt = Number(payment.amount) || 0;

    booking.paidAmount = prevPaid + amt;
    booking.balanceAmount = Math.max(0, total - booking.paidAmount);

    if (booking.balanceAmount <= 0) {
      booking.status = BookingStatus.COMPLETED;
    }
    // Note: BookingStatus doesn't have a 'Partially Paid' status, so we keep existing status

    await this.bookingRepository.save(booking);

    this.logger.log(
      `Updated booking ${booking.id}: paid=${booking.paidAmount}, balance=${booking.balanceAmount}, status=${booking.status}`,
    );
  }

  /**
   * Get payment summary for a flat
   */
  async getFlatPaymentSummary(flatId: string): Promise<{
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    completedMilestones: number;
    totalMilestones: number;
    nextMilestone: any;
  }> {
    const flatPaymentPlan = await this.flatPaymentPlanRepository.findOne({
      where: { flatId, status: FlatPaymentPlanStatus.ACTIVE },
    });

    if (!flatPaymentPlan) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        balanceAmount: 0,
        completedMilestones: 0,
        totalMilestones: 0,
        nextMilestone: null,
      };
    }

    const completedMilestones = flatPaymentPlan.milestones.filter(
      m => m.status === 'PAID'
    ).length;

    const nextMilestone = flatPaymentPlan.milestones
      .sort((a, b) => a.sequence - b.sequence)
      .find(m => m.status === 'PENDING' || m.status === 'TRIGGERED');

    return {
      totalAmount: flatPaymentPlan.totalAmount,
      paidAmount: flatPaymentPlan.paidAmount,
      balanceAmount: flatPaymentPlan.balanceAmount,
      completedMilestones,
      totalMilestones: flatPaymentPlan.milestones.length,
      nextMilestone,
    };
  }
}
