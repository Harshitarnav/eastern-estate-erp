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
exports.CustomerPortalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../customers/entities/customer.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const flat_payment_plan_entity_1 = require("../payment-plans/entities/flat-payment-plan.entity");
const demand_draft_entity_1 = require("../demand-drafts/entities/demand-draft.entity");
const construction_progress_log_entity_1 = require("../construction/entities/construction-progress-log.entity");
const construction_project_entity_1 = require("../construction/entities/construction-project.entity");
let CustomerPortalService = class CustomerPortalService {
    constructor(customersRepo, bookingsRepo, paymentsRepo, paymentPlansRepo, demandDraftsRepo, progressLogsRepo, constructionProjectsRepo) {
        this.customersRepo = customersRepo;
        this.bookingsRepo = bookingsRepo;
        this.paymentsRepo = paymentsRepo;
        this.paymentPlansRepo = paymentPlansRepo;
        this.demandDraftsRepo = demandDraftsRepo;
        this.progressLogsRepo = progressLogsRepo;
        this.constructionProjectsRepo = constructionProjectsRepo;
    }
    async getProfile(customerId) {
        const customer = await this.customersRepo.findOne({
            where: { id: customerId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer profile not found');
        const bookingCount = await this.bookingsRepo.count({
            where: { customerId, isActive: true },
        });
        const payments = await this.paymentsRepo.find({
            where: { customerId },
            select: ['amount', 'paymentDate', 'paymentType'],
        });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            customer,
            stats: {
                bookingCount,
                totalPaid,
                paymentCount: payments.length,
            },
        };
    }
    async getBookings(customerId) {
        return this.bookingsRepo.find({
            where: { customerId, isActive: true },
            relations: ['flat', 'flat.tower', 'property'],
            order: { createdAt: 'DESC' },
        });
    }
    async getBookingDetail(customerId, bookingId) {
        const booking = await this.bookingsRepo.findOne({
            where: { id: bookingId, customerId, isActive: true },
            relations: ['flat', 'flat.tower', 'property'],
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const paymentPlan = await this.paymentPlansRepo.findOne({
            where: { bookingId, customerId },
        });
        const payments = await this.paymentsRepo.find({
            where: { bookingId, customerId },
            order: { paymentDate: 'DESC' },
        });
        const demandDrafts = await this.demandDraftsRepo.find({
            where: { bookingId, customerId },
            order: { createdAt: 'DESC' },
        });
        return { booking, paymentPlan, payments, demandDrafts };
    }
    async getPayments(customerId) {
        const payments = await this.paymentsRepo.find({
            where: { customerId },
            order: { paymentDate: 'DESC' },
        });
        const plans = await this.paymentPlansRepo.find({
            where: { customerId },
            relations: ['flat', 'booking'],
        });
        const upcomingMilestones = plans.flatMap((plan) => (plan.milestones || [])
            .filter((m) => m.status === 'PENDING' || m.status === 'TRIGGERED')
            .map((m) => ({
            ...m,
            flatNumber: plan.flat?.flatNumber,
            bookingId: plan.bookingId,
            planId: plan.id,
        })));
        return { payments, upcomingMilestones };
    }
    async getConstructionUpdates(customerId) {
        const bookings = await this.bookingsRepo.find({
            where: { customerId, isActive: true },
            relations: ['flat', 'flat.tower', 'property'],
        });
        if (!bookings.length)
            return { bookings: [], updates: [], projects: [] };
        const propertyIds = [...new Set(bookings.map((b) => b.propertyId))];
        const projects = await this.constructionProjectsRepo
            .createQueryBuilder('project')
            .where('project.propertyId IN (:...propertyIds)', { propertyIds })
            .orderBy('project.createdAt', 'DESC')
            .getMany();
        const projectIds = projects.map((p) => p.id);
        let updates = [];
        if (projectIds.length) {
            updates = await this.progressLogsRepo
                .createQueryBuilder('log')
                .where('log.constructionProjectId IN (:...projectIds)', { projectIds })
                .orderBy('log.logDate', 'DESC')
                .limit(20)
                .getMany();
        }
        return { bookings, updates, projects };
    }
    async getDemandDrafts(customerId) {
        return this.demandDraftsRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.CustomerPortalService = CustomerPortalService;
exports.CustomerPortalService = CustomerPortalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(flat_payment_plan_entity_1.FlatPaymentPlan)),
    __param(4, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __param(5, (0, typeorm_1.InjectRepository)(construction_progress_log_entity_1.ConstructionProgressLog)),
    __param(6, (0, typeorm_1.InjectRepository)(construction_project_entity_1.ConstructionProject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomerPortalService);
//# sourceMappingURL=customer-portal.service.js.map