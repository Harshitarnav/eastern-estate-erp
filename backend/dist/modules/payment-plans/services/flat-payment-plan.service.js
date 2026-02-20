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
let FlatPaymentPlanService = class FlatPaymentPlanService {
    constructor(flatPaymentPlanRepository, flatRepository, bookingRepository, customerRepository, templateService) {
        this.flatPaymentPlanRepository = flatPaymentPlanRepository;
        this.flatRepository = flatRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.templateService = templateService;
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
    async findAll() {
        return await this.flatPaymentPlanRepository.find({
            relations: ['flat', 'flat.property', 'flat.tower', 'booking', 'booking.customer', 'customer', 'paymentPlanTemplate'],
            order: { createdAt: 'DESC' },
        });
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
        plan.updatedBy = userId;
        return await this.flatPaymentPlanRepository.save(plan);
    }
    async cancel(id, userId) {
        const plan = await this.findOne(id);
        plan.status = flat_payment_plan_entity_1.FlatPaymentPlanStatus.CANCELLED;
        plan.updatedBy = userId;
        return await this.flatPaymentPlanRepository.save(plan);
    }
};
exports.FlatPaymentPlanService = FlatPaymentPlanService;
exports.FlatPaymentPlanService = FlatPaymentPlanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payment_plan_template_service_1.PaymentPlanTemplateService])
], FlatPaymentPlanService);
//# sourceMappingURL=flat-payment-plan.service.js.map