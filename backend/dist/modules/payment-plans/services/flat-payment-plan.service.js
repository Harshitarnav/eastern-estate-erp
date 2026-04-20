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
exports.FlatPaymentPlanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flat_payment_plan_entity_1 = require("../entities/flat-payment-plan.entity");
const payment_plan_template_service_1 = require("./payment-plan-template.service");
const flat_entity_1 = require("../../flats/entities/flat.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
let FlatPaymentPlanService = class FlatPaymentPlanService {
    constructor(flatPaymentPlanRepository, flatRepository, bookingRepository, customerRepository, paymentRepository, templateService) {
        this.flatPaymentPlanRepository = flatPaymentPlanRepository;
        this.flatRepository = flatRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
        this.templateService = templateService;
        this.uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    }
    async create(createDto, userId) {
        const flat = await this.flatRepository.findOne({ where: { id: createDto.flatId } });
        if (!flat) {
            throw new common_1.NotFoundException(`Flat with ID ${createDto.flatId} not found`);
        }
        const booking = await this.bookingRepository.findOne({ where: { id: createDto.bookingId } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${createDto.bookingId} not found`);
        }
        const customer = await this.customerRepository.findOne({ where: { id: createDto.customerId } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${createDto.customerId} not found`);
        }
        const existing = await this.flatPaymentPlanRepository.findOne({
            where: { flatId: createDto.flatId, bookingId: createDto.bookingId }
        });
        if (existing) {
            throw new common_1.BadRequestException('This flat-booking combination already has a payment plan');
        }
        const template = await this.templateService.findOne(createDto.paymentPlanTemplateId);
        const milestones = template.milestones.map((tm) => ({
            sequence: tm.sequence,
            name: tm.name,
            constructionPhase: tm.constructionPhase,
            phasePercentage: tm.phasePercentage,
            amount: (createDto.totalAmount * tm.paymentPercentage) / 100,
            dueDate: null,
            status: 'PENDING',
            paymentScheduleId: null,
            constructionCheckpointId: null,
            demandDraftId: null,
            paymentId: null,
            completedAt: null,
            description: tm.description,
        }));
        const flatPaymentPlan = this.flatPaymentPlanRepository.create({
            flatId: createDto.flatId,
            bookingId: createDto.bookingId,
            customerId: createDto.customerId,
            paymentPlanTemplateId: createDto.paymentPlanTemplateId,
            totalAmount: createDto.totalAmount,
            paidAmount: 0,
            balanceAmount: createDto.totalAmount,
            milestones,
            status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.flatPaymentPlanRepository.save(flatPaymentPlan);
        return saved;
    }
    async createForBooking(input, userId) {
        const existing = await this.flatPaymentPlanRepository.findOne({
            where: { flatId: input.flatId, bookingId: input.bookingId },
        });
        if (existing) {
            throw new common_1.BadRequestException('This booking already has a payment plan');
        }
        let templateId = null;
        let milestones = [];
        if (input.mode === 'template' || input.mode === 'template-edit') {
            if (!input.templateId) {
                throw new common_1.BadRequestException('templateId is required for template modes');
            }
            const template = await this.templateService.findOne(input.templateId);
            templateId = template.id;
            if (input.mode === 'template') {
                milestones = template.milestones.map((tm) => ({
                    sequence: tm.sequence,
                    name: tm.name,
                    constructionPhase: tm.constructionPhase,
                    phasePercentage: tm.phasePercentage,
                    amount: (input.totalAmount * tm.paymentPercentage) / 100,
                    dueDate: null,
                    status: 'PENDING',
                    paymentScheduleId: null,
                    constructionCheckpointId: null,
                    demandDraftId: null,
                    paymentId: null,
                    completedAt: null,
                    description: tm.description,
                }));
            }
        }
        if (input.mode === 'custom' || input.mode === 'template-edit') {
            if (!input.milestones || input.milestones.length === 0) {
                throw new common_1.BadRequestException('At least one milestone is required');
            }
            milestones = input.milestones
                .map((m) => {
                const resolvedAmount = m.amount !== undefined && m.amount !== null
                    ? Number(m.amount)
                    : m.paymentPercentage !== undefined && m.paymentPercentage !== null
                        ? (input.totalAmount * Number(m.paymentPercentage)) / 100
                        : NaN;
                if (!Number.isFinite(resolvedAmount))
                    return null;
                return {
                    sequence: m.sequence,
                    name: m.name,
                    constructionPhase: m.constructionPhase ?? null,
                    phasePercentage: m.phasePercentage ?? null,
                    amount: resolvedAmount,
                    dueDate: null,
                    status: 'PENDING',
                    paymentScheduleId: null,
                    constructionCheckpointId: null,
                    demandDraftId: null,
                    paymentId: null,
                    completedAt: null,
                    description: m.description ?? '',
                };
            })
                .filter((m) => m !== null);
        }
        const sum = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);
        if (Math.abs(sum - Number(input.totalAmount)) > 1) {
            throw new common_1.BadRequestException(`Milestone amounts (${sum.toFixed(2)}) don't match total amount (${Number(input.totalAmount).toFixed(2)})`);
        }
        const plan = this.flatPaymentPlanRepository.create({
            flatId: input.flatId,
            bookingId: input.bookingId,
            customerId: input.customerId,
            paymentPlanTemplateId: templateId,
            totalAmount: input.totalAmount,
            paidAmount: 0,
            balanceAmount: input.totalAmount,
            milestones,
            status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE,
            createdBy: userId,
            updatedBy: userId,
        });
        return await this.flatPaymentPlanRepository.save(plan);
    }
    async findAll(propertyId, accessiblePropertyIds) {
        const qb = this.flatPaymentPlanRepository
            .createQueryBuilder('plan')
            .leftJoinAndSelect('plan.flat', 'flat')
            .leftJoinAndSelect('flat.property', 'flatProperty')
            .leftJoinAndSelect('flat.tower', 'flatTower')
            .leftJoinAndSelect('plan.booking', 'booking')
            .leftJoinAndSelect('booking.customer', 'bookingCustomer')
            .leftJoinAndSelect('plan.customer', 'customer')
            .leftJoinAndSelect('plan.paymentPlanTemplate', 'template')
            .orderBy('plan.createdAt', 'DESC');
        if (propertyId) {
            if (accessiblePropertyIds &&
                accessiblePropertyIds.length > 0 &&
                !accessiblePropertyIds.includes(propertyId)) {
                qb.andWhere('1 = 0');
            }
            else {
                qb.andWhere('flat.propertyId = :propertyId', { propertyId });
            }
        }
        else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
            qb.andWhere('flat.propertyId IN (:...accessiblePropertyIds)', {
                accessiblePropertyIds,
            });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const plan = await this.flatPaymentPlanRepository.findOne({
            where: { id },
            relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Flat payment plan with ID ${id} not found`);
        }
        return plan;
    }
    async findByFlatId(flatId) {
        return await this.flatPaymentPlanRepository.findOne({
            where: { flatId, status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
            relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
        });
    }
    async findByBookingId(bookingId) {
        return await this.flatPaymentPlanRepository.findOne({
            where: { bookingId, status: flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE },
            relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
        });
    }
    async updateMilestone(planId, milestoneSequence, updates, userId) {
        const plan = await this.findOne(planId);
        const milestoneIndex = plan.milestones.findIndex(m => m.sequence === milestoneSequence);
        if (milestoneIndex === -1) {
            throw new common_1.NotFoundException(`Milestone with sequence ${milestoneSequence} not found in plan`);
        }
        plan.milestones[milestoneIndex] = {
            ...plan.milestones[milestoneIndex],
            ...updates,
        };
        const paidAmount = plan.milestones
            .filter(m => m.status === 'PAID')
            .reduce((sum, m) => sum + m.amount, 0);
        plan.paidAmount = paidAmount;
        plan.balanceAmount = plan.totalAmount - paidAmount;
        const allPaid = plan.milestones.every(m => m.status === 'PAID');
        if (allPaid) {
            plan.status = flat_payment_plan_entity_1.FlatPaymentPlanStatus.COMPLETED;
        }
        plan.updatedBy = this.normalizeUserId(userId);
        return await this.flatPaymentPlanRepository.save(plan);
    }
    normalizeUserId(userId) {
        if (!userId)
            return null;
        return this.uuidRegex.test(userId) ? userId : null;
    }
    async updateMilestones(planId, milestones, userId) {
        const plan = await this.findOne(planId);
        plan.milestones = milestones;
        const paidAmount = milestones
            .filter(m => m.status === 'PAID')
            .reduce((sum, m) => sum + Number(m.amount), 0);
        plan.paidAmount = paidAmount;
        plan.balanceAmount = plan.totalAmount - paidAmount;
        const allPaid = milestones.length > 0 && milestones.every(m => m.status === 'PAID');
        if (allPaid) {
            plan.status = flat_payment_plan_entity_1.FlatPaymentPlanStatus.COMPLETED;
        }
        else if (plan.status === flat_payment_plan_entity_1.FlatPaymentPlanStatus.COMPLETED) {
            plan.status = flat_payment_plan_entity_1.FlatPaymentPlanStatus.ACTIVE;
        }
        plan.updatedBy = this.normalizeUserId(userId);
        return await this.flatPaymentPlanRepository.save(plan);
    }
    async updatePlan(planId, updates, userId) {
        const plan = await this.findOne(planId);
        if (updates.totalAmount !== undefined) {
            plan.totalAmount = updates.totalAmount;
            plan.balanceAmount = updates.totalAmount - plan.paidAmount;
        }
        if (updates.status !== undefined) {
            plan.status = updates.status;
        }
        plan.updatedBy = this.normalizeUserId(userId);
        return await this.flatPaymentPlanRepository.save(plan);
    }
    async cancel(id, userId) {
        const plan = await this.findOne(id);
        plan.status = flat_payment_plan_entity_1.FlatPaymentPlanStatus.CANCELLED;
        plan.updatedBy = this.normalizeUserId(userId);
        return await this.flatPaymentPlanRepository.save(plan);
    }
    async getLedger(bookingId) {
        const plan = await this.flatPaymentPlanRepository.findOne({
            where: { bookingId },
            relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'customer'],
        });
        if (!plan) {
            throw new common_1.NotFoundException(`No payment plan found for booking ${bookingId}`);
        }
        const payments = await this.paymentRepository.find({
            where: { bookingId },
            order: { paymentDate: 'ASC' },
        });
        const events = [];
        for (const m of plan.milestones) {
            if (m.status !== 'PENDING' || m.dueDate) {
                const dateKey = m.dueDate ?? '9999-12-31';
                events.push({ sortKey: dateKey, type: 'DEMAND', milestone: m });
            }
        }
        for (const p of payments) {
            const dateKey = p.paymentDate
                ? new Date(p.paymentDate).toISOString().split('T')[0]
                : '9999-12-31';
            events.push({ sortKey: dateKey, type: 'PAYMENT', payment: p });
        }
        events.sort((a, b) => {
            if (a.sortKey < b.sortKey)
                return -1;
            if (a.sortKey > b.sortKey)
                return 1;
            if (a.type === 'DEMAND' && b.type === 'PAYMENT')
                return -1;
            if (a.type === 'PAYMENT' && b.type === 'DEMAND')
                return 1;
            return 0;
        });
        let runningBalance = 0;
        const rows = [];
        for (const ev of events) {
            if (ev.type === 'DEMAND') {
                const m = ev.milestone;
                const debit = Number(m.amount) || 0;
                runningBalance += debit;
                rows.push({
                    date: m.dueDate ?? null,
                    description: m.name,
                    type: 'DEMAND',
                    debit,
                    credit: 0,
                    balance: runningBalance,
                    milestoneSequence: m.sequence,
                    demandDraftId: m.demandDraftId ?? null,
                    status: m.status,
                });
            }
            else {
                const p = ev.payment;
                const credit = Number(p.amount) || 0;
                runningBalance -= credit;
                rows.push({
                    date: p.paymentDate
                        ? new Date(p.paymentDate).toISOString().split('T')[0]
                        : null,
                    description: `Payment received - ${p.paymentMethod?.replace(/_/g, ' ') ?? ''}`,
                    type: 'PAYMENT',
                    debit: 0,
                    credit,
                    balance: runningBalance,
                    paymentId: p.id,
                    reference: p.paymentCode,
                    status: p.status,
                });
            }
        }
        const totalDemanded = rows
            .filter(r => r.type === 'DEMAND')
            .reduce((s, r) => s + r.debit, 0);
        const totalPaid = rows
            .filter(r => r.type === 'PAYMENT')
            .reduce((s, r) => s + r.credit, 0);
        const overdueCount = plan.milestones.filter(m => m.status === 'OVERDUE').length;
        const pendingMilestones = plan.milestones.filter(m => m.status === 'PENDING').length;
        return {
            plan: {
                id: plan.id,
                totalAmount: Number(plan.totalAmount),
                paidAmount: Number(plan.paidAmount),
                balanceAmount: Number(plan.balanceAmount),
                status: plan.status,
            },
            customer: plan.customer
                ? {
                    id: plan.customer.id,
                    fullName: plan.customer.fullName,
                    phone: plan.customer.phoneNumber ?? null,
                    email: plan.customer.email,
                }
                : null,
            flat: plan.flat
                ? {
                    id: plan.flat.id,
                    flatNumber: plan.flat.flatNumber,
                    property: plan.flat.property?.name ?? undefined,
                    tower: plan.flat.tower?.name ?? undefined,
                }
                : null,
            booking: plan.booking
                ? {
                    id: plan.booking.id,
                    bookingNumber: plan.booking.bookingNumber,
                    bookingDate: plan.booking.bookingDate,
                }
                : null,
            rows,
            summary: {
                totalDemanded,
                totalPaid,
                balance: totalDemanded - totalPaid,
                overdueCount,
                pendingMilestones,
            },
        };
    }
};
exports.FlatPaymentPlanService = FlatPaymentPlanService;
exports.FlatPaymentPlanService = FlatPaymentPlanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payment_plan_template_service_1.PaymentPlanTemplateService])
], FlatPaymentPlanService);
//# sourceMappingURL=flat-payment-plan.service.js.map