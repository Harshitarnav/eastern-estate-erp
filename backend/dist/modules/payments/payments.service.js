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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const payment_completion_service_1 = require("./services/payment-completion.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepository, paymentCompletionService) {
        this.paymentRepository = paymentRepository;
        this.paymentCompletionService = paymentCompletionService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async create(createPaymentDto, userId) {
        if (!createPaymentDto.paymentCode) {
            createPaymentDto.paymentCode = await this.generatePaymentCode();
        }
        const payment = this.paymentRepository.create(createPaymentDto);
        const savedPayment = await this.paymentRepository.save(payment);
        if (savedPayment.status === payment_entity_1.PaymentStatus.COMPLETED) {
            try {
                await this.paymentCompletionService.processPaymentCompletion(savedPayment.id);
                this.logger.log(`Payment completion workflow processed for payment ${savedPayment.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to process payment completion workflow: ${error.message}`);
            }
        }
        return savedPayment;
    }
    async findAll(filters) {
        const query = this.paymentRepository.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.booking', 'booking')
            .leftJoinAndSelect('payment.customer', 'customer');
        if (filters?.bookingId) {
            query.andWhere('payment.bookingId = :bookingId', { bookingId: filters.bookingId });
        }
        if (filters?.customerId) {
            query.andWhere('payment.customerId = :customerId', { customerId: filters.customerId });
        }
        if (filters?.paymentType) {
            query.andWhere('payment.paymentType = :paymentType', { paymentType: filters.paymentType });
        }
        if (filters?.paymentMethod) {
            query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
        }
        if (filters?.status) {
            query.andWhere('payment.status = :status', { status: filters.status });
        }
        if (filters?.startDate && filters?.endDate) {
            query.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        }
        if (filters?.minAmount) {
            query.andWhere('payment.amount >= :minAmount', { minAmount: filters.minAmount });
        }
        if (filters?.maxAmount) {
            query.andWhere('payment.amount <= :maxAmount', { maxAmount: filters.maxAmount });
        }
        query.orderBy('payment.paymentDate', 'DESC');
        return query.getMany();
    }
    async findOne(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['booking', 'customer'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async findByPaymentCode(paymentCode) {
        const payment = await this.paymentRepository.findOne({
            where: { paymentCode },
            relations: ['booking', 'customer'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with code ${paymentCode} not found`);
        }
        return payment;
    }
    async update(id, updatePaymentDto) {
        const payment = await this.findOne(id);
        if (payment.status === payment_entity_1.PaymentStatus.COMPLETED || payment.status === payment_entity_1.PaymentStatus.REFUNDED) {
            throw new common_1.BadRequestException(`Cannot update payment with status ${payment.status}`);
        }
        Object.assign(payment, updatePaymentDto);
        return this.paymentRepository.save(payment);
    }
    async verify(id, userId) {
        const payment = await this.findOne(id);
        if (payment.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Payment is already verified');
        }
        payment.status = 'COMPLETED';
        return this.paymentRepository.save(payment);
    }
    async cancel(id) {
        const payment = await this.findOne(id);
        if (payment.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot cancel a completed payment. Create a refund instead.');
        }
        payment.status = 'CANCELLED';
        return this.paymentRepository.save(payment);
    }
    async remove(id) {
        const payment = await this.findOne(id);
        if (payment.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot delete a completed payment');
        }
        await this.paymentRepository.remove(payment);
    }
    async getStatistics(filters) {
        const query = this.paymentRepository.createQueryBuilder('payment');
        if (filters?.startDate && filters?.endDate) {
            query.where('payment.paymentDate BETWEEN :startDate AND :endDate', {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        }
        if (filters?.paymentType) {
            query.andWhere('payment.paymentType = :paymentType', { paymentType: filters.paymentType });
        }
        const payments = await query.getMany();
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
        const completedAmount = payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
        const pendingAmount = payments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const byMethodMap = new Map();
        payments.forEach(p => {
            const existing = byMethodMap.get(p.paymentMethod) || { count: 0, amount: 0 };
            byMethodMap.set(p.paymentMethod, {
                count: existing.count + 1,
                amount: existing.amount + Number(p.amount),
            });
        });
        const byMethod = Array.from(byMethodMap.entries()).map(([method, data]) => ({
            method,
            ...data,
        }));
        const byTypeMap = new Map();
        payments.forEach(p => {
            const existing = byTypeMap.get(p.paymentType) || { count: 0, amount: 0 };
            byTypeMap.set(p.paymentType, {
                count: existing.count + 1,
                amount: existing.amount + Number(p.amount),
            });
        });
        const byType = Array.from(byTypeMap.entries()).map(([type, data]) => ({
            type,
            ...data,
        }));
        return {
            totalPayments,
            totalAmount,
            completedPayments,
            completedAmount,
            pendingPayments,
            pendingAmount,
            byMethod,
            byType,
        };
    }
    async generatePaymentCode() {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const code = `PAY${dateStr}${randomNum}`;
        const existing = await this.paymentRepository.findOne({ where: { paymentCode: code } });
        if (existing) {
            return this.generatePaymentCode();
        }
        return code;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => payment_completion_service_1.PaymentCompletionService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        payment_completion_service_1.PaymentCompletionService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map