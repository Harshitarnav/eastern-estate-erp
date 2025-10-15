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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const dto_1 = require("./dto");
let PaymentsService = class PaymentsService {
    constructor(paymentsRepository) {
        this.paymentsRepository = paymentsRepository;
    }
    async create(createPaymentDto) {
        const existing = await this.paymentsRepository.findOne({
            where: { paymentNumber: createPaymentDto.paymentNumber },
        });
        if (existing) {
            throw new common_1.ConflictException('Payment number already exists');
        }
        const payment = this.paymentsRepository.create(createPaymentDto);
        const savedPayment = await this.paymentsRepository.save(payment);
        return dto_1.PaymentResponseDto.fromEntity(savedPayment);
    }
    async findAll(query) {
        const { search, paymentType, paymentMode, status, bookingId, customerId, paymentDateFrom, paymentDateTo, isVerified, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.paymentsRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.booking', 'booking')
            .leftJoinAndSelect('payment.customer', 'customer');
        if (search) {
            queryBuilder.andWhere('(payment.paymentNumber ILIKE :search OR payment.receiptNumber ILIKE :search OR payment.transactionId ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)', { search: `%${search}%` });
        }
        if (paymentType) {
            queryBuilder.andWhere('payment.paymentType = :paymentType', { paymentType });
        }
        if (paymentMode) {
            queryBuilder.andWhere('payment.paymentMode = :paymentMode', { paymentMode });
        }
        if (status) {
            queryBuilder.andWhere('payment.status = :status', { status });
        }
        if (bookingId) {
            queryBuilder.andWhere('payment.bookingId = :bookingId', { bookingId });
        }
        if (customerId) {
            queryBuilder.andWhere('payment.customerId = :customerId', { customerId });
        }
        if (paymentDateFrom) {
            queryBuilder.andWhere('payment.paymentDate >= :paymentDateFrom', { paymentDateFrom });
        }
        if (paymentDateTo) {
            queryBuilder.andWhere('payment.paymentDate <= :paymentDateTo', { paymentDateTo });
        }
        if (isVerified !== undefined) {
            queryBuilder.andWhere('payment.isVerified = :isVerified', { isVerified });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('payment.isActive = :isActive', { isActive });
        }
        queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const payments = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.PaymentResponseDto.fromEntities(payments),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: ['booking', 'customer'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return dto_1.PaymentResponseDto.fromEntity(payment);
    }
    async update(id, updatePaymentDto) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (updatePaymentDto.paymentNumber && updatePaymentDto.paymentNumber !== payment.paymentNumber) {
            const existing = await this.paymentsRepository.findOne({
                where: { paymentNumber: updatePaymentDto.paymentNumber },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Payment number already exists');
            }
        }
        Object.assign(payment, updatePaymentDto);
        const updatedPayment = await this.paymentsRepository.save(payment);
        return dto_1.PaymentResponseDto.fromEntity(updatedPayment);
    }
    async remove(id) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        payment.isActive = false;
        await this.paymentsRepository.save(payment);
    }
    async verifyPayment(id, verifiedBy) {
        const payment = await this.paymentsRepository.findOne({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        payment.isVerified = true;
        payment.verifiedBy = verifiedBy;
        payment.verifiedAt = new Date();
        const verifiedPayment = await this.paymentsRepository.save(payment);
        return dto_1.PaymentResponseDto.fromEntity(verifiedPayment);
    }
    async getStatistics() {
        const payments = await this.paymentsRepository.find({ where: { isActive: true } });
        const total = payments.length;
        const pending = payments.filter((p) => p.status === 'PENDING').length;
        const received = payments.filter((p) => p.status === 'RECEIVED').length;
        const cleared = payments.filter((p) => p.status === 'CLEARED').length;
        const bounced = payments.filter((p) => p.status === 'BOUNCED').length;
        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalNetAmount = payments.reduce((sum, p) => sum + Number(p.netAmount), 0);
        const totalTDS = payments.reduce((sum, p) => sum + Number(p.tdsAmount), 0);
        const totalGST = payments.reduce((sum, p) => sum + Number(p.gstAmount), 0);
        const byPaymentMode = {
            cash: payments.filter((p) => p.paymentMode === 'CASH').length,
            cheque: payments.filter((p) => p.paymentMode === 'CHEQUE').length,
            bankTransfer: payments.filter((p) => p.paymentMode === 'BANK_TRANSFER').length,
            upi: payments.filter((p) => p.paymentMode === 'UPI').length,
            online: payments.filter((p) => p.paymentMode === 'ONLINE').length,
        };
        const verified = payments.filter((p) => p.isVerified).length;
        return {
            total,
            pending,
            received,
            cleared,
            bounced,
            totalAmount,
            totalNetAmount,
            totalTDS,
            totalGST,
            byPaymentMode,
            verified,
            verificationRate: total > 0 ? (verified / total) * 100 : 0,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map