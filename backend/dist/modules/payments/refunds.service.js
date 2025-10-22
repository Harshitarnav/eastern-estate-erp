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
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_refund_entity_1 = require("./entities/payment-refund.entity");
const payments_service_1 = require("./payments.service");
const payment_entity_1 = require("./entities/payment.entity");
let RefundsService = class RefundsService {
    constructor(refundRepository, paymentsService) {
        this.refundRepository = refundRepository;
        this.paymentsService = paymentsService;
    }
    async create(createRefundDto, userId) {
        const payment = await this.paymentsService.findOne(createRefundDto.paymentId);
        if (payment.status !== payment_entity_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Can only create refunds for completed payments');
        }
        if (createRefundDto.refundAmount > payment.amount) {
            throw new common_1.BadRequestException('Refund amount cannot exceed payment amount');
        }
        const existingRefunds = await this.refundRepository.find({
            where: { paymentId: createRefundDto.paymentId },
        });
        const totalRefunded = existingRefunds.reduce((sum, r) => sum + Number(r.refundAmount), 0);
        if (totalRefunded + createRefundDto.refundAmount > payment.amount) {
            throw new common_1.BadRequestException(`Total refund amount (${totalRefunded + createRefundDto.refundAmount}) would exceed payment amount (${payment.amount})`);
        }
        const refund = this.refundRepository.create({
            ...createRefundDto,
            createdBy: userId,
        });
        return this.refundRepository.save(refund);
    }
    async findAll(filters) {
        const query = this.refundRepository.createQueryBuilder('refund')
            .leftJoinAndSelect('refund.payment', 'payment')
            .leftJoinAndSelect('refund.creator', 'creator')
            .leftJoinAndSelect('refund.approver', 'approver')
            .leftJoinAndSelect('refund.processor', 'processor');
        if (filters?.paymentId) {
            query.andWhere('refund.paymentId = :paymentId', { paymentId: filters.paymentId });
        }
        if (filters?.status) {
            query.andWhere('refund.status = :status', { status: filters.status });
        }
        query.orderBy('refund.createdAt', 'DESC');
        return query.getMany();
    }
    async findOne(id) {
        const refund = await this.refundRepository.findOne({
            where: { id },
            relations: ['payment', 'creator', 'approver', 'processor'],
        });
        if (!refund) {
            throw new common_1.NotFoundException(`Refund with ID ${id} not found`);
        }
        return refund;
    }
    async approve(id, userId, approveDto) {
        const refund = await this.findOne(id);
        if (refund.status !== payment_refund_entity_1.RefundStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot approve refund with status ${refund.status}`);
        }
        refund.status = payment_refund_entity_1.RefundStatus.APPROVED;
        refund.approvedBy = userId;
        refund.approvedAt = new Date();
        return this.refundRepository.save(refund);
    }
    async reject(id, userId, reason) {
        const refund = await this.findOne(id);
        if (refund.status !== payment_refund_entity_1.RefundStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot reject refund with status ${refund.status}`);
        }
        refund.status = payment_refund_entity_1.RefundStatus.REJECTED;
        refund.approvedBy = userId;
        refund.approvedAt = new Date();
        refund.bankDetails = `Rejected: ${reason}`;
        return this.refundRepository.save(refund);
    }
    async process(id, userId, processDto) {
        const refund = await this.findOne(id);
        if (refund.status !== payment_refund_entity_1.RefundStatus.APPROVED) {
            throw new common_1.BadRequestException('Can only process approved refunds');
        }
        refund.status = payment_refund_entity_1.RefundStatus.PROCESSED;
        refund.processedBy = userId;
        refund.processedAt = new Date();
        refund.transactionReference = processDto.transactionReference;
        const payment = await this.paymentsService.findOne(refund.paymentId);
        const allRefunds = await this.findAll({ paymentId: refund.paymentId });
        const totalRefunded = allRefunds
            .filter(r => r.status === payment_refund_entity_1.RefundStatus.PROCESSED)
            .reduce((sum, r) => sum + Number(r.refundAmount), 0);
        if (totalRefunded >= payment.amount) {
            await this.paymentsService.update(payment.id, {
                status: payment_entity_1.PaymentStatus.REFUNDED,
            });
        }
        return this.refundRepository.save(refund);
    }
    async getPendingRefunds() {
        return this.findAll({ status: payment_refund_entity_1.RefundStatus.PENDING });
    }
    async getApprovedRefunds() {
        return this.findAll({ status: payment_refund_entity_1.RefundStatus.APPROVED });
    }
    async getRefundStats(filters) {
        const query = this.refundRepository.createQueryBuilder('refund');
        if (filters?.startDate && filters?.endDate) {
            query.where('refund.refundDate BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        }
        const refunds = await query.getMany();
        const totalRefunds = refunds.length;
        const totalAmount = refunds.reduce((sum, r) => sum + Number(r.refundAmount), 0);
        const pendingRefunds = refunds.filter(r => r.status === payment_refund_entity_1.RefundStatus.PENDING).length;
        const pendingAmount = refunds
            .filter(r => r.status === payment_refund_entity_1.RefundStatus.PENDING)
            .reduce((sum, r) => sum + Number(r.refundAmount), 0);
        const approvedRefunds = refunds.filter(r => r.status === payment_refund_entity_1.RefundStatus.APPROVED).length;
        const approvedAmount = refunds
            .filter(r => r.status === payment_refund_entity_1.RefundStatus.APPROVED)
            .reduce((sum, r) => sum + Number(r.refundAmount), 0);
        const processedRefunds = refunds.filter(r => r.status === payment_refund_entity_1.RefundStatus.PROCESSED).length;
        const processedAmount = refunds
            .filter(r => r.status === payment_refund_entity_1.RefundStatus.PROCESSED)
            .reduce((sum, r) => sum + Number(r.refundAmount), 0);
        const rejectedRefunds = refunds.filter(r => r.status === payment_refund_entity_1.RefundStatus.REJECTED).length;
        const rejectedAmount = refunds
            .filter(r => r.status === payment_refund_entity_1.RefundStatus.REJECTED)
            .reduce((sum, r) => sum + Number(r.refundAmount), 0);
        return {
            totalRefunds,
            totalAmount,
            pendingRefunds,
            pendingAmount,
            approvedRefunds,
            approvedAmount,
            processedRefunds,
            processedAmount,
            rejectedRefunds,
            rejectedAmount,
        };
    }
};
exports.RefundsService = RefundsService;
exports.RefundsService = RefundsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_refund_entity_1.PaymentRefund)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        payments_service_1.PaymentsService])
], RefundsService);
//# sourceMappingURL=refunds.service.js.map