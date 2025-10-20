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
var PaymentScheduleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_schedule_entity_1 = require("./entities/payment-schedule.entity");
let PaymentScheduleService = PaymentScheduleService_1 = class PaymentScheduleService {
    constructor(scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
        this.logger = new common_1.Logger(PaymentScheduleService_1.name);
    }
    async generateScheduleForBooking(bookingId, bookingNumber, totalAmount, tokenAmount, paymentPlan = 'TIME_LINKED', startDate = new Date()) {
        try {
            this.logger.log(`Generating ${paymentPlan} schedule for booking ${bookingNumber}`);
            const remainingAmount = Number(totalAmount) - Number(tokenAmount);
            let schedules = [];
            switch (paymentPlan) {
                case 'CONSTRUCTION_LINKED':
                    schedules = this.generateConstructionLinkedSchedule(bookingId, bookingNumber, remainingAmount, startDate);
                    break;
                case 'TIME_LINKED':
                    schedules = this.generateTimeLinkedSchedule(bookingId, bookingNumber, remainingAmount, startDate);
                    break;
                case 'DOWN_PAYMENT':
                    schedules = this.generateDownPaymentSchedule(bookingId, bookingNumber, remainingAmount, startDate);
                    break;
                default:
                    schedules = this.generateTimeLinkedSchedule(bookingId, bookingNumber, remainingAmount, startDate);
            }
            const savedSchedules = await this.scheduleRepository.save(schedules);
            this.logger.log(`Created ${savedSchedules.length} payment schedules for booking ${bookingNumber}`);
            return savedSchedules;
        }
        catch (error) {
            this.logger.error(`Error generating schedule for booking ${bookingNumber}:`, error);
            throw error;
        }
    }
    generateConstructionLinkedSchedule(bookingId, bookingNumber, remainingAmount, startDate) {
        const schedules = [];
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
                status: payment_schedule_entity_1.ScheduleStatus.PENDING,
                paidAmount: 0,
                isActive: true,
            });
        });
        return schedules;
    }
    generateTimeLinkedSchedule(bookingId, bookingNumber, remainingAmount, startDate) {
        const schedules = [];
        const totalInstallments = 12;
        const installmentAmount = remainingAmount / totalInstallments;
        for (let i = 0; i < totalInstallments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i + 1);
            schedules.push({
                bookingId,
                scheduleNumber: `${bookingNumber}-${String(i + 1).padStart(3, '0')}`,
                installmentNumber: i + 1,
                totalInstallments,
                dueDate,
                amount: installmentAmount,
                description: `Installment ${i + 1} of ${totalInstallments}`,
                status: payment_schedule_entity_1.ScheduleStatus.PENDING,
                paidAmount: 0,
                isActive: true,
            });
        }
        return schedules;
    }
    generateDownPaymentSchedule(bookingId, bookingNumber, remainingAmount, startDate) {
        const schedules = [];
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
            status: payment_schedule_entity_1.ScheduleStatus.PENDING,
            paidAmount: 0,
            isActive: true,
        });
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
            status: payment_schedule_entity_1.ScheduleStatus.PENDING,
            paidAmount: 0,
            isActive: true,
        });
        return schedules;
    }
    async getScheduleForBooking(bookingId) {
        try {
            const schedules = await this.scheduleRepository.find({
                where: { bookingId, isActive: true },
                order: { installmentNumber: 'ASC' },
            });
            return schedules;
        }
        catch (error) {
            this.logger.error(`Error fetching schedule for booking ${bookingId}:`, error);
            throw error;
        }
    }
    async markInstallmentAsPaid(scheduleId, paymentId, amount) {
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { id: scheduleId },
            });
            if (!schedule) {
                throw new common_1.NotFoundException(`Payment schedule ${scheduleId} not found`);
            }
            schedule.paidAmount = Number(schedule.paidAmount) + Number(amount);
            schedule.paymentId = paymentId;
            schedule.paidDate = new Date();
            if (schedule.paidAmount >= schedule.amount) {
                schedule.status = payment_schedule_entity_1.ScheduleStatus.PAID;
            }
            else if (schedule.paidAmount > 0) {
                schedule.status = payment_schedule_entity_1.ScheduleStatus.PARTIAL;
            }
            const updated = await this.scheduleRepository.save(schedule);
            this.logger.log(`Marked schedule ${scheduleId} as paid with amount ${amount}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Error marking schedule ${scheduleId} as paid:`, error);
            throw error;
        }
    }
    async updateOverdueSchedules() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const overdueSchedules = await this.scheduleRepository
                .createQueryBuilder('schedule')
                .where('schedule.dueDate < :today', { today })
                .andWhere('schedule.status = :status', { status: payment_schedule_entity_1.ScheduleStatus.PENDING })
                .andWhere('schedule.isActive = :isActive', { isActive: true })
                .getMany();
            for (const schedule of overdueSchedules) {
                schedule.isOverdue = true;
                schedule.status = payment_schedule_entity_1.ScheduleStatus.OVERDUE;
                const dueDate = new Date(schedule.dueDate);
                const diffTime = today.getTime() - dueDate.getTime();
                schedule.overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const monthsOverdue = schedule.overdueDays / 30;
                schedule.penaltyAmount = Number(schedule.amount) * 0.01 * monthsOverdue;
                await this.scheduleRepository.save(schedule);
            }
            this.logger.log(`Updated ${overdueSchedules.length} overdue schedules`);
            return overdueSchedules.length;
        }
        catch (error) {
            this.logger.error('Error updating overdue schedules:', error);
            throw error;
        }
    }
};
exports.PaymentScheduleService = PaymentScheduleService;
exports.PaymentScheduleService = PaymentScheduleService = PaymentScheduleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_schedule_entity_1.PaymentSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentScheduleService);
//# sourceMappingURL=payment-schedule.service.js.map