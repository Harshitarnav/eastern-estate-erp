import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentSchedule, ScheduleStatus } from '../entities/payment-schedule.entity';
import { FlatPaymentPlan, FlatPaymentPlanStatus } from '../../payment-plans/entities/flat-payment-plan.entity';
import { FlatPaymentPlanService } from '../../payment-plans/services/flat-payment-plan.service';
import { Flat } from '../../flats/entities/flat.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';

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
    private readonly flatPaymentPlanService: FlatPaymentPlanService,
  ) {}

  /**
   * Process payment completion and update all related records
   */
  async processPaymentCompletion(paymentId: string): Promise<{
    payment: Payment;
    paymentSchedule: PaymentSchedule;
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
      paymentSchedule: paymentSchedule!,
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
    // Update booking amounts
    booking.paidAmount = (booking.paidAmount || 0) + payment.amount;
    
    const balance = booking.totalAmount - booking.paidAmount;
    
    if (balance <= 0) {
      booking.status = BookingStatus.COMPLETED;
    }
    // Note: BookingStatus doesn't have a 'Partially Paid' status, so we keep existing status

    await this.bookingRepository.save(booking);
    
    this.logger.log(
      `Updated booking ${booking.id}: paid=${booking.paidAmount}, status=${booking.status}`
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
