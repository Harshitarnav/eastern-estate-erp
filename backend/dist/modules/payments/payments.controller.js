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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const payment_entity_1 = require("./entities/payment.entity");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    create(createPaymentDto, req) {
        return this.paymentsService.create(createPaymentDto, req.user.userId);
    }
    async findAll(bookingId, customerId, paymentType, paymentMethod, status, startDate, endDate, minAmount, maxAmount, page, limit) {
        const filters = {};
        if (bookingId)
            filters.bookingId = bookingId;
        if (customerId)
            filters.customerId = customerId;
        if (paymentType)
            filters.paymentType = paymentType;
        if (paymentMethod)
            filters.paymentMethod = paymentMethod;
        if (status)
            filters.status = status;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (minAmount)
            filters.minAmount = parseFloat(minAmount);
        if (maxAmount)
            filters.maxAmount = parseFloat(maxAmount);
        const payments = await this.paymentsService.findAll(filters);
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedPayments = payments.slice(startIndex, endIndex);
        const total = payments.length;
        const totalPages = Math.ceil(total / limitNum);
        return {
            data: paginatedPayments,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages,
            },
        };
    }
    getStatistics(startDate, endDate, paymentType) {
        const filters = {};
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (paymentType)
            filters.paymentType = paymentType;
        return this.paymentsService.getStatistics(filters);
    }
    findByBooking(bookingId) {
        return this.paymentsService.findAll({ bookingId });
    }
    findByCustomer(customerId) {
        return this.paymentsService.findAll({ customerId });
    }
    findByCode(paymentCode) {
        return this.paymentsService.findByPaymentCode(paymentCode);
    }
    findOne(id) {
        return this.paymentsService.findOne(id);
    }
    update(id, updatePaymentDto) {
        return this.paymentsService.update(id, updatePaymentDto);
    }
    verify(id, req) {
        return this.paymentsService.verify(id, req.user.userId);
    }
    cancel(id) {
        return this.paymentsService.cancel(id);
    }
    remove(id) {
        return this.paymentsService.remove(id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('bookingId')),
    __param(1, (0, common_1.Query)('customerId')),
    __param(2, (0, common_1.Query)('paymentType')),
    __param(3, (0, common_1.Query)('paymentMethod')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __param(7, (0, common_1.Query)('minAmount')),
    __param(8, (0, common_1.Query)('maxAmount')),
    __param(9, (0, common_1.Query)('page')),
    __param(10, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('paymentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findByBooking", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findByCustomer", null);
__decorate([
    (0, common_1.Get)('code/:paymentCode'),
    __param(0, (0, common_1.Param)('paymentCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "remove", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map