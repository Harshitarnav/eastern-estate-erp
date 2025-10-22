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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_installment_entity_1 = require("./entities/payment-installment.entity");
let InstallmentsService = class InstallmentsService {
    constructor(installmentRepository) {
        this.installmentRepository = installmentRepository;
    }
    async create(createInstallmentDto) {
        const installment = this.installmentRepository.create(createInstallmentDto);
        return this.installmentRepository.save(installment);
    }
    async createSchedule(scheduleDto) {
        const { bookingId, numberOfInstallments, totalAmount, startDate, intervalDays } = scheduleDto;
        const existing = await this.installmentRepository.findOne({
            where: { bookingId },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Installment schedule already exists for booking ${bookingId}`);
        }
        const installmentAmount = totalAmount / numberOfInstallments;
        const installments = [];
        for (let i = 0; i < numberOfInstallments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + (i * intervalDays));
            const installment = this.installmentRepository.create({
                bookingId,
                installmentNumber: i + 1,
                dueDate,
                amount: installmentAmount,
                status: payment_installment_entity_1.InstallmentStatus.PENDING,
            });
            installments.push(installment);
        }
        return this.installmentRepository.save(installments);
    }
    async findAll(filters) {
        const query = this.installmentRepository.createQueryBuilder('installment')
            .leftJoinAndSelect('installment.booking', 'booking')
            .leftJoinAndSelect('installment.payment', 'payment');
        if (filters?.bookingId) {
            query.andWhere('installment.bookingId = :bookingId', { bookingId: filters.bookingId });
        }
        if (filters?.status) {
            query.andWhere('installment.status = :status', { status: filters.status });
        }
        if (filters?.overdue) {
            query.andWhere('installment.dueDate < :today', { today: new Date() });
            query.andWhere('installment.status IN (:...statuses)', {
                statuses: [payment_installment_entity_1.InstallmentStatus.PENDING, payment_installment_entity_1.InstallmentStatus.PARTIAL],
            });
        }
        query.orderBy('installment.dueDate', 'ASC');
        return query.getMany();
    }
    async findOne(id) {
        const installment = await this.installmentRepository.findOne({
            where: { id },
            relations: ['booking', 'payment'],
        });
        if (!installment) {
            throw new common_1.NotFoundException(`Installment with ID ${id} not found`);
        }
        return installment;
    }
    async findByBooking(bookingId) {
        return this.installmentRepository.find({
            where: { bookingId },
            relations: ['payment'],
            order: { installmentNumber: 'ASC' },
        });
    }
    async update(id, updateData) {
        const installment = await this.findOne(id);
        Object.assign(installment, updateData);
        return this.installmentRepository.save(installment);
    }
    async markAsPaid(id, paymentId, paidAmount) {
        const installment = await this.findOne(id);
        const amount = paidAmount || installment.amount;
        if (amount >= installment.amount) {
            installment.status = payment_installment_entity_1.InstallmentStatus.PAID;
            installment.paidAmount = installment.amount;
        }
        else {
            installment.status = payment_installment_entity_1.InstallmentStatus.PARTIAL;
            installment.paidAmount = amount;
        }
        installment.paymentId = paymentId;
        installment.paidDate = new Date();
        return this.installmentRepository.save(installment);
    }
    async waive(id) {
        const installment = await this.findOne(id);
        installment.status = payment_installment_entity_1.InstallmentStatus.WAIVED;
        return this.installmentRepository.save(installment);
    }
    async calculateLateFee(installment, lateFeePerDay = 50) {
        if (installment.status === payment_installment_entity_1.InstallmentStatus.PAID || installment.status === payment_installment_entity_1.InstallmentStatus.WAIVED) {
            return 0;
        }
        if (installment.lateFeeWaived) {
            return 0;
        }
        const today = new Date();
        const dueDate = new Date(installment.dueDate);
        if (today <= dueDate) {
            return 0;
        }
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysOverdue * lateFeePerDay;
    }
    async updateLateFees(lateFeePerDay = 50) {
        const overdueInstallments = await this.findAll({ overdue: true });
        for (const installment of overdueInstallments) {
            const lateFee = await this.calculateLateFee(installment, lateFeePerDay);
            if (lateFee !== installment.lateFee) {
                installment.lateFee = lateFee;
                installment.status = payment_installment_entity_1.InstallmentStatus.OVERDUE;
                await this.installmentRepository.save(installment);
            }
        }
    }
    async getOverdue() {
        return this.installmentRepository.find({
            where: {
                dueDate: (0, typeorm_2.LessThan)(new Date()),
                status: payment_installment_entity_1.InstallmentStatus.PENDING,
            },
            relations: ['booking', 'booking.customer'],
            order: { dueDate: 'ASC' },
        });
    }
    async getUpcoming(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        return this.installmentRepository
            .createQueryBuilder('installment')
            .leftJoinAndSelect('installment.booking', 'booking')
            .leftJoinAndSelect('booking.customer', 'customer')
            .where('installment.dueDate BETWEEN :today AND :futureDate', { today, futureDate })
            .andWhere('installment.status = :status', { status: payment_installment_entity_1.InstallmentStatus.PENDING })
            .orderBy('installment.dueDate', 'ASC')
            .getMany();
    }
    async remove(id) {
        const installment = await this.findOne(id);
        if (installment.status === payment_installment_entity_1.InstallmentStatus.PAID) {
            throw new common_1.BadRequestException('Cannot delete a paid installment');
        }
        await this.installmentRepository.remove(installment);
    }
    async getBookingStats(bookingId) {
        const installments = await this.findByBooking(bookingId);
        const totalInstallments = installments.length;
        const paidInstallments = installments.filter(i => i.status === payment_installment_entity_1.InstallmentStatus.PAID).length;
        const pendingInstallments = installments.filter(i => i.status === payment_installment_entity_1.InstallmentStatus.PENDING || i.status === payment_installment_entity_1.InstallmentStatus.PARTIAL).length;
        const overdueInstallments = installments.filter(i => i.status === payment_installment_entity_1.InstallmentStatus.OVERDUE).length;
        const totalAmount = installments.reduce((sum, i) => sum + Number(i.amount), 0);
        const paidAmount = installments.reduce((sum, i) => sum + Number(i.paidAmount), 0);
        const pendingAmount = totalAmount - paidAmount;
        const overdueAmount = installments
            .filter(i => i.status === payment_installment_entity_1.InstallmentStatus.OVERDUE)
            .reduce((sum, i) => sum + Number(i.amount) - Number(i.paidAmount), 0);
        const totalLateFees = installments.reduce((sum, i) => sum + Number(i.lateFee), 0);
        return {
            totalInstallments,
            paidInstallments,
            pendingInstallments,
            overdueInstallments,
            totalAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            totalLateFees,
        };
    }
};
exports.InstallmentsService = InstallmentsService;
exports.InstallmentsService = InstallmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_installment_entity_1.PaymentInstallment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InstallmentsService);
//# sourceMappingURL=installments.service.js.map