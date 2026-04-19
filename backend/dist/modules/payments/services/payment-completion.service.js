"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentCompletionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCompletionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../entities/payment.entity");
const payment_schedule_entity_1 = require("../entities/payment-schedule.entity");
const flat_payment_plan_entity_1 = require("../../payment-plans/entities/flat-payment-plan.entity");
const flat_payment_plan_service_1 = require("../../payment-plans/services/flat-payment-plan.service");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const demand_draft_entity_1 = require("../../demand-drafts/entities/demand-draft.entity");
let PaymentCompletionService = PaymentCompletionService_1 = class PaymentCompletionService {
    constructor(paymentRepository, paymentScheduleRepository, flatPaymentPlanRepository, flatRepository, bookingRepository, demandDraftRepository, flatPaymentPlanService) {
        this.paymentRepository = paymentRepository;
        this.paymentScheduleRepository = paymentScheduleRepository;
        this.flatPaymentPlanRepository = flatPaymentPlanRepository;
        this.flatRepository = flatRepository;
        this.bookingRepository = bookingRepository;
        this.demandDraftRepository = demandDraftRepository;
        this.flatPaymentPlanService = flatPaymentPlanService;
        this.logger = new common_1.Logger(PaymentCompletionService_1.name);
    }
    async processPaymentCompletion(paymentId) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: ['booking'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        this.logger.log(`Processing payment completion for payment ${paymentId}`);
        let paymentSchedule = null;
        let flatPaymentPlan = null;
        let flat = null;
        let booking = null;
        if (payment.bookingId) {
            booking = await this.bookingRepository.findOne({
                where: { id: payment.bookingId },
                relations: ['flat'],
            });
            if (booking && booking.flatId) {
                flat = booking.flat;
                flatPaymentPlan = await this.flatPaymentPlanRepository.findOne({
                    where: {
                        flatId: booking.flatId,
                        bookingId: booking.id,
                        status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE
                    },
                });
                if (flatPaymentPlan) {
                    const schedules = await this.paymentScheduleRepository.find({
                        where: { bookingId: booking.id },
                        order: { installmentNumber: 'ASC' },
                    });
                    for (const schedule of schedules) {
                        const balanceAmount = schedule.amount - (schedule.paidAmount || 0);
                        if (schedule.status === payment_schedule_entity_1.ScheduleStatus.PENDING || balanceAmount > 0) {
                            const milestone = flatPaymentPlan.milestones.find(m => m.name === schedule.milestone || m.sequence === schedule.installmentNumber);
                            if (milestone && milestone.status === 'TRIGGERED') {
                                paymentSchedule = schedule;
                                break;
                            }
                        }
                    }
                    if (!paymentSchedule) {
                        paymentSchedule = schedules.find(s => s.status === payment_schedule_entity_1.ScheduleStatus.PENDING) || null;
                    }
                }
            }
        }
        if (paymentSchedule) {
            await this.updatePaymentSchedule(paymentSchedule, payment);
        }
        if (flatPaymentPlan && paymentSchedule) {
            await this.updateFlatPaymentPlanMilestone(flatPaymentPlan, paymentSchedule, payment);
        }
        try {
            await this.closeDemandDraftsForPayment({
                payment,
                paymentSchedule,
                flatPaymentPlan,
            });
        }
        catch (err) {
            this.logger.error(`Failed to close DDs for payment ${payment.id}: ${err.message}`);
        }
        if (flat) {
            await this.updateFlatPaymentStatus(flat, payment);
        }
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
    async updatePaymentSchedule(schedule, payment) {
        const balanceAmount = schedule.amount - (schedule.paidAmount || 0);
        const amountToApply = Math.min(payment.amount, balanceAmount);
        schedule.paidAmount = (schedule.paidAmount || 0) + amountToApply;
        const newBalance = schedule.amount - schedule.paidAmount;
        if (newBalance <= 0) {
            schedule.status = payment_schedule_entity_1.ScheduleStatus.PAID;
            schedule.paidDate = payment.paymentDate;
        }
        else {
            schedule.status = payment_schedule_entity_1.ScheduleStatus.PARTIAL;
        }
        await this.paymentScheduleRepository.save(schedule);
        this.logger.log(`Updated payment schedule ${schedule.id}: paid=${schedule.paidAmount}, balance=${newBalance}`);
    }
    async updateFlatPaymentPlanMilestone(flatPaymentPlan, schedule, payment) {
        const milestone = flatPaymentPlan.milestones.find(m => m.name === schedule.milestone ||
            m.sequence === schedule.installmentNumber ||
            m.paymentScheduleId === schedule.id);
        if (!milestone) {
            this.logger.warn(`No matching milestone found in payment plan ${flatPaymentPlan.id} for schedule ${schedule.id}`);
            return;
        }
        await this.flatPaymentPlanService.updateMilestone(flatPaymentPlan.id, milestone.sequence, {
            status: 'PAID',
            paymentId: payment.id,
            completedAt: new Date().toISOString(),
        }, 'SYSTEM');
        this.logger.log(`Updated milestone ${milestone.sequence} in payment plan ${flatPaymentPlan.id} to PAID`);
    }
    async closeDemandDraftsForPayment(params) {
        const { payment, paymentSchedule, flatPaymentPlan } = params;
        const openStatuses = [
            demand_draft_entity_1.DemandDraftStatus.DRAFT,
            demand_draft_entity_1.DemandDraftStatus.READY,
            demand_draft_entity_1.DemandDraftStatus.SENT,
            demand_draft_entity_1.DemandDraftStatus.FAILED,
        ];
        let matches = [];
        if (paymentSchedule) {
            matches = await this.demandDraftRepository.find({
                where: {
                    paymentScheduleId: paymentSchedule.id,
                    status: (0, typeorm_2.In)(openStatuses),
                },
            });
        }
        if (!matches.length && flatPaymentPlan && paymentSchedule?.milestone) {
            matches = await this.demandDraftRepository.find({
                where: {
                    flatPaymentPlanId: flatPaymentPlan.id,
                    milestoneId: paymentSchedule.milestone,
                    status: (0, typeorm_2.In)(openStatuses),
                },
            });
        }
        if (!matches.length && payment.bookingId) {
            const amt = Number(payment.amount) || 0;
            if (amt > 0) {
                matches = await this.demandDraftRepository
                    .createQueryBuilder('dd')
                    .where('dd.booking_id = :bookingId', { bookingId: payment.bookingId })
                    .andWhere('dd.status IN (:...openStatuses)', { openStatuses })
                    .andWhere('ROUND(dd.amount::numeric, 0) = ROUND(:amt::numeric, 0)', {
                    amt,
                })
                    .orderBy('dd.created_at', 'ASC')
                    .limit(1)
                    .getMany();
            }
        }
        if (!matches.length)
            return;
        const rootIds = new Set();
        for (const dd of matches) {
            rootIds.add(dd.parentDemandDraftId ?? dd.id);
        }
        const thread = await this.demandDraftRepository
            .createQueryBuilder('dd')
            .where('dd.status IN (:...openStatuses)', { openStatuses })
            .andWhere('(dd.id IN (:...rootIds) OR dd.parent_demand_draft_id IN (:...rootIds))', { rootIds: Array.from(rootIds) })
            .getMany();
        const now = new Date();
        for (const dd of thread) {
            dd.status = demand_draft_entity_1.DemandDraftStatus.PAID;
            dd.paidAt = now;
            dd.paidPaymentId = payment.id;
            dd.nextReminderDueAt = null;
            dd.metadata = {
                ...(dd.metadata || {}),
                closedBy: {
                    paymentId: payment.id,
                    paymentCode: payment.paymentCode,
                    amount: Number(payment.amount) || 0,
                    at: now.toISOString(),
                },
            };
        }
        await this.demandDraftRepository.save(thread);
        this.logger.log(`Closed ${thread.length} DD(s) for payment ${payment.paymentCode} ` +
            `(roots: ${Array.from(rootIds).join(', ')})`);
    }
    async updateFlatPaymentStatus(flat, payment) {
        await this.flatRepository.save(flat);
        this.logger.log(`Updated flat ${flat.id} payment information`);
    }
    async updateBookingPaymentStatus(booking, payment) {
        const prevPaid = Number(booking.paidAmount) || 0;
        const total = Number(booking.totalAmount) || 0;
        const amt = Number(payment.amount) || 0;
        booking.paidAmount = prevPaid + amt;
        booking.balanceAmount = Math.max(0, total - booking.paidAmount);
        if (booking.balanceAmount <= 0) {
            booking.status = booking_entity_1.BookingStatus.COMPLETED;
        }
        await this.bookingRepository.save(booking);
        this.logger.log(`Updated booking ${booking.id}: paid=${booking.paidAmount}, balance=${booking.balanceAmount}, status=${booking.status}`);
    }
    async getFlatPaymentSummary(flatId) {
        const flatPaymentPlan = await this.flatPaymentPlanRepository.findOne({
            where: { flatId, status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
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
        const completedMilestones = flatPaymentPlan.milestones.filter(m => m.status === 'PAID').length;
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
};
exports.PaymentCompletionService = PaymentCompletionService;
exports.PaymentCompletionService = PaymentCompletionService = PaymentCompletionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_schedule_entity_1.PaymentSchedule)),
    __param(2, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(3, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(4, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(5, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        flat_payment_plan_service_1.FlatPaymentPlanService])
], PaymentCompletionService);
//# sourceMappingURL=payment-completion.service.js.map