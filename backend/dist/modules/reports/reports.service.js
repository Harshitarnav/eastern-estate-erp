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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flat_payment_plan_entity_1 = require("../payment-plans/entities/flat-payment-plan.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
let ReportsService = class ReportsService {
    constructor(planRepo, paymentRepo) {
        this.planRepo = planRepo;
        this.paymentRepo = paymentRepo;
    }
    async getOutstandingReport(filters) {
        const qb = this.planRepo
            .createQueryBuilder('plan')
            .leftJoinAndSelect('plan.flat', 'flat')
            .leftJoinAndSelect('flat.property', 'property')
            .leftJoinAndSelect('flat.tower', 'tower')
            .leftJoinAndSelect('plan.customer', 'customer')
            .leftJoinAndSelect('plan.booking', 'booking')
            .where('plan.status != :cancelled', { cancelled: 'CANCELLED' });
        if (filters.propertyId) {
            qb.andWhere('property.id = :propertyId', { propertyId: filters.propertyId });
        }
        if (filters.towerId) {
            qb.andWhere('tower.id = :towerId', { towerId: filters.towerId });
        }
        if (filters.status) {
            qb.andWhere('plan.status = :status', { status: filters.status });
        }
        qb.orderBy('property.name', 'ASC')
            .addOrderBy('tower.name', 'ASC')
            .addOrderBy('flat.flatNumber', 'ASC');
        const plans = await qb.getMany();
        const today = new Date();
        const rows = plans.map((plan) => {
            const milestones = plan.milestones ?? [];
            const totalDemanded = milestones
                .filter((m) => m.status !== 'PENDING')
                .reduce((s, m) => s + Number(m.amount), 0);
            const overdueMilestones = milestones.filter((m) => m.status === 'OVERDUE');
            let oldestOverdueDays = null;
            if (overdueMilestones.length > 0) {
                const dueDates = overdueMilestones
                    .filter((m) => m.dueDate)
                    .map((m) => new Date(m.dueDate).getTime());
                if (dueDates.length > 0) {
                    const oldest = Math.min(...dueDates);
                    oldestOverdueDays = Math.floor((today.getTime() - oldest) / (1000 * 60 * 60 * 24));
                }
            }
            return {
                planId: plan.id,
                bookingId: plan.bookingId,
                bookingNumber: plan.booking?.bookingNumber ?? '—',
                property: plan.flat?.property?.name ?? '—',
                tower: plan.flat?.tower?.name ?? '—',
                flatNumber: plan.flat?.flatNumber ?? '—',
                flatType: plan.flat?.flatType ?? '—',
                customerName: plan.customer?.fullName ?? '—',
                customerPhone: plan.customer?.phoneNumber ?? '—',
                totalAmount: Number(plan.totalAmount),
                totalDemanded,
                totalPaid: Number(plan.paidAmount),
                outstanding: Number(plan.balanceAmount),
                overdueMilestones: overdueMilestones.length,
                oldestOverdueDays,
                planStatus: plan.status,
            };
        });
        const summary = {
            totalUnits: rows.length,
            totalAgreementValue: rows.reduce((s, r) => s + r.totalAmount, 0),
            totalDemanded: rows.reduce((s, r) => s + r.totalDemanded, 0),
            totalPaid: rows.reduce((s, r) => s + r.totalPaid, 0),
            totalOutstanding: rows.reduce((s, r) => s + r.outstanding, 0),
            unitsWithOverdue: rows.filter((r) => r.overdueMilestones > 0).length,
        };
        return { rows, summary };
    }
    async getCollectionReport(filters) {
        const qb = this.paymentRepo
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.booking', 'booking')
            .leftJoinAndSelect('payment.customer', 'customer')
            .leftJoinAndSelect('booking.flat', 'flat')
            .leftJoinAndSelect('flat.property', 'property')
            .leftJoinAndSelect('flat.tower', 'tower')
            .where('payment.status != :cancelled', { cancelled: 'CANCELLED' });
        if (filters.startDate) {
            qb.andWhere('payment.paymentDate >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            qb.andWhere('payment.paymentDate <= :endDate', { endDate: filters.endDate });
        }
        if (filters.propertyId) {
            qb.andWhere('property.id = :propertyId', { propertyId: filters.propertyId });
        }
        if (filters.towerId) {
            qb.andWhere('tower.id = :towerId', { towerId: filters.towerId });
        }
        if (filters.paymentMethod) {
            qb.andWhere('payment.paymentMethod = :paymentMethod', {
                paymentMethod: filters.paymentMethod,
            });
        }
        qb.orderBy('payment.paymentDate', 'DESC');
        const payments = await qb.getMany();
        const rows = payments.map((p) => ({
            paymentId: p.id,
            paymentCode: p.paymentCode,
            paymentDate: p.paymentDate
                ? new Date(p.paymentDate).toISOString().split('T')[0]
                : '—',
            property: p.booking?.flat?.property?.name ?? '—',
            tower: p.booking?.flat?.tower?.name ?? '—',
            flatNumber: p.booking?.flat?.flatNumber ?? '—',
            customerName: p.customer?.fullName ?? '—',
            customerPhone: p.customer?.phoneNumber ?? '—',
            bookingNumber: p.booking?.bookingNumber ?? '—',
            amount: Number(p.amount),
            paymentMethod: p.paymentMethod ?? '—',
            paymentType: p.paymentType ?? '—',
            status: p.status ?? '—',
            receiptNumber: p.receiptNumber ?? '—',
            reference: p.transactionReference ?? p.chequeNumber ?? p.upiId ?? '—',
        }));
        const byMethod = {};
        const byStatus = {};
        let totalAmount = 0;
        for (const r of rows) {
            totalAmount += r.amount;
            byMethod[r.paymentMethod] = (byMethod[r.paymentMethod] ?? 0) + r.amount;
            byStatus[r.status] = (byStatus[r.status] ?? 0) + r.amount;
        }
        return {
            rows,
            summary: {
                totalPayments: rows.length,
                totalAmount,
                byMethod,
                byStatus,
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map