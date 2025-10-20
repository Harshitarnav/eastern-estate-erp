/**
 * @file payment-schedule.service.ts
 * @description Service for managing payment schedules and installments
 * @module PaymentsModule
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSchedule, ScheduleStatus } from './entities/payment-schedule.entity';

export type PaymentPlan = 'CONSTRUCTION_LINKED' | 'TIME_LINKED' | 'DOWN_PAYMENT';

/**
 * PaymentScheduleService
 * 
 * Handles generation and management of payment schedules for bookings.
 * Supports multiple payment plan types with different installment strategies.
 */
@Injectable()
export class PaymentScheduleService {
    private readonly logger = new Logger(PaymentScheduleService.name);

    constructor(
        @InjectRepository(PaymentSchedule)
        private scheduleRepository: Repository<PaymentSchedule>,
    ) {}

    /**
     * Generate payment schedule for a booking
     * 
     * @param bookingId - Booking UUID
     * @param bookingNumber - Booking reference number
     * @param totalAmount - Total booking amount
     * @param tokenAmount - Token amount already paid
     * @param paymentPlan - Type of payment plan
     * @param startDate - Start date for schedule generation
     * @returns Array of created payment schedules
     */
    async generateScheduleForBooking(
        bookingId: string,
        bookingNumber: string,
        totalAmount: number,
        tokenAmount: number,
        paymentPlan: PaymentPlan = 'TIME_LINKED',
        startDate: Date = new Date(),
    ): Promise<PaymentSchedule[]> {
        try {
            this.logger.log(`Generating ${paymentPlan} schedule for booking ${bookingNumber}`);

            // Calculate remaining amount after token
            const remainingAmount = Number(totalAmount) - Number(tokenAmount);

            let schedules: Partial<PaymentSchedule>[] = [];

            switch (paymentPlan) {
                case 'CONSTRUCTION_LINKED':
                    schedules = this.generateConstructionLinkedSchedule(
                        bookingId,
                        bookingNumber,
                        remainingAmount,
                        startDate,
                    );
                    break;

                case 'TIME_LINKED':
                    schedules = this.generateTimeLinkedSchedule(
                        bookingId,
                        bookingNumber,
                        remainingAmount,
                        startDate,
                    );
                    break;

                case 'DOWN_PAYMENT':
                    schedules = this.generateDownPaymentSchedule(
                        bookingId,
                        bookingNumber,
                        remainingAmount,
                        startDate,
                    );
                    break;

                default:
                    // Default to time-linked
                    schedules = this.generateTimeLinkedSchedule(
                        bookingId,
                        bookingNumber,
                        remainingAmount,
                        startDate,
                    );
            }

            // Save all schedules
            const savedSchedules = await this.scheduleRepository.save(schedules);

            this.logger.log(`Created ${savedSchedules.length} payment schedules for booking ${bookingNumber}`);

            return savedSchedules;
        } catch (error) {
            this.logger.error(`Error generating schedule for booking ${bookingNumber}:`, error);
            throw error;
        }
    }

    /**
     * Generate Construction-Linked Payment Schedule
     * Payments tied to construction milestones
     */
    private generateConstructionLinkedSchedule(
        bookingId: string,
        bookingNumber: string,
        remainingAmount: number,
        startDate: Date,
    ): Partial<PaymentSchedule>[] {
        const schedules: Partial<PaymentSchedule>[] = [];

        // Milestone-based payment structure (typical for real estate)
        const milestones = [
            { milestone: 'Agreement Signing', percentage: 10, months: 0 },
            { milestone: 'Foundation Complete', percentage: 15, months: 3 },
            { milestone: 'Plinth Level', percentage: 10, months: 6 },
            { milestone: 'Structure Complete', percentage: 20, months: 12 },
            { milestone: 'Brickwork Complete', percentage: 10, months: 15 },
            { milestone: 'Finishing Work', percentage: 15, months: 18 },
            { milestone: 'On Possession', percentage: 20, months: 24 },
        ];

        milestones.forEach((milestone, index) => {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + milestone.months);

            const amount = (remainingAmount * milestone.percentage) / 100;

            schedules.push({
                bookingId,
                scheduleNumber: `${bookingNumber}-${String(index + 1).padStart(3, '0')}`,
                installmentNumber: index + 1,
                totalInstallments: milestones.length,
                dueDate,
                amount,
                description: `${milestone.percentage}% - ${milestone.milestone}`,
                milestone: milestone.milestone,
                status: ScheduleStatus.PENDING,
                paidAmount: 0,
                isActive: true,
            });
        });

        return schedules;
    }

    /**
     * Generate Time-Linked Payment Schedule
     * Fixed monthly/quarterly installments
     */
    private generateTimeLinkedSchedule(
        bookingId: string,
        bookingNumber: string,
        remainingAmount: number,
        startDate: Date,
    ): Partial<PaymentSchedule>[] {
        const schedules: Partial<PaymentSchedule>[] = [];

        // 12 monthly installments
        const totalInstallments = 12;
        const installmentAmount = remainingAmount / totalInstallments;

        for (let i = 0; i < totalInstallments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i + 1); // Start from next month

            schedules.push({
                bookingId,
                scheduleNumber: `${bookingNumber}-${String(i + 1).padStart(3, '0')}`,
                installmentNumber: i + 1,
                totalInstallments,
                dueDate,
                amount: installmentAmount,
                description: `Installment ${i + 1} of ${totalInstallments}`,
                status: ScheduleStatus.PENDING,
                paidAmount: 0,
                isActive: true,
            });
        }

        return schedules;
    }

    /**
     * Generate Down Payment Schedule
     * 20% down payment, rest on possession
     */
    private generateDownPaymentSchedule(
        bookingId: string,
        bookingNumber: string,
        remainingAmount: number,
        startDate: Date,
    ): Partial<PaymentSchedule>[] {
        const schedules: Partial<PaymentSchedule>[] = [];

        // 20% down payment (due in 30 days)
        const downPaymentAmount = remainingAmount * 0.2;
        const downPaymentDate = new Date(startDate);
        downPaymentDate.setDate(downPaymentDate.getDate() + 30);

        schedules.push({
            bookingId,
            scheduleNumber: `${bookingNumber}-001`,
            installmentNumber: 1,
            totalInstallments: 2,
            dueDate: downPaymentDate,
            amount: downPaymentAmount,
            description: '20% Down Payment',
            status: ScheduleStatus.PENDING,
            paidAmount: 0,
            isActive: true,
        });

        // Remaining 80% on possession (assume 24 months)
        const possessionAmount = remainingAmount * 0.8;
        const possessionDate = new Date(startDate);
        possessionDate.setMonth(possessionDate.getMonth() + 24);

        schedules.push({
            bookingId,
            scheduleNumber: `${bookingNumber}-002`,
            installmentNumber: 2,
            totalInstallments: 2,
            dueDate: possessionDate,
            amount: possessionAmount,
            description: '80% On Possession',
            milestone: 'On Possession',
            status: ScheduleStatus.PENDING,
            paidAmount: 0,
            isActive: true,
        });

        return schedules;
    }

    /**
     * Get payment schedule for a booking
     * 
     * @param bookingId - Booking UUID
     * @returns Array of payment schedules
     */
    async getScheduleForBooking(bookingId: string): Promise<PaymentSchedule[]> {
        try {
            const schedules = await this.scheduleRepository.find({
                where: { bookingId, isActive: true },
                order: { installmentNumber: 'ASC' },
            });

            return schedules;
        } catch (error) {
            this.logger.error(`Error fetching schedule for booking ${bookingId}:`, error);
            throw error;
        }
    }

    /**
     * Mark an installment as paid
     * 
     * @param scheduleId - Schedule UUID
     * @param paymentId - Payment record UUID
     * @param amount - Amount paid
     * @returns Updated payment schedule
     */
    async markInstallmentAsPaid(
        scheduleId: string,
        paymentId: string,
        amount: number,
    ): Promise<PaymentSchedule> {
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { id: scheduleId },
            });

            if (!schedule) {
                throw new NotFoundException(`Payment schedule ${scheduleId} not found`);
            }

            schedule.paidAmount = Number(schedule.paidAmount) + Number(amount);
            schedule.paymentId = paymentId;
            schedule.paidDate = new Date();

            // Update status based on paid amount
            if (schedule.paidAmount >= schedule.amount) {
                schedule.status = ScheduleStatus.PAID;
            } else if (schedule.paidAmount > 0) {
                schedule.status = ScheduleStatus.PARTIAL;
            }

            const updated = await this.scheduleRepository.save(schedule);

            this.logger.log(`Marked schedule ${scheduleId} as paid with amount ${amount}`);

            return updated;
        } catch (error) {
            this.logger.error(`Error marking schedule ${scheduleId} as paid:`, error);
            throw error;
        }
    }

    /**
     * Check and update overdue schedules
     * Should be run periodically (e.g., daily cron job)
     */
    async updateOverdueSchedules(): Promise<number> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const overdueSchedules = await this.scheduleRepository
                .createQueryBuilder('schedule')
                .where('schedule.dueDate < :today', { today })
                .andWhere('schedule.status = :status', { status: ScheduleStatus.PENDING })
                .andWhere('schedule.isActive = :isActive', { isActive: true })
                .getMany();

            for (const schedule of overdueSchedules) {
                schedule.isOverdue = true;
                schedule.status = ScheduleStatus.OVERDUE;
                
                // Calculate overdue days
                const dueDate = new Date(schedule.dueDate);
                const diffTime = today.getTime() - dueDate.getTime();
                schedule.overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Calculate penalty (e.g., 1% per month)
                const monthsOverdue = schedule.overdueDays / 30;
                schedule.penaltyAmount = Number(schedule.amount) * 0.01 * monthsOverdue;

                await this.scheduleRepository.save(schedule);
            }

            this.logger.log(`Updated ${overdueSchedules.length} overdue schedules`);

            return overdueSchedules.length;
        } catch (error) {
            this.logger.error('Error updating overdue schedules:', error);
            throw error;
        }
    }
}



