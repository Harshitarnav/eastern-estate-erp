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
exports.RefundsController = void 0;
const common_1 = require("@nestjs/common");
const refunds_service_1 = require("./refunds.service");
const create_refund_dto_1 = require("./dto/create-refund.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const payment_refund_entity_1 = require("./entities/payment-refund.entity");
let RefundsController = class RefundsController {
    constructor(refundsService) {
        this.refundsService = refundsService;
    }
    create(createRefundDto, req) {
        return this.refundsService.create(createRefundDto, req.user.userId);
    }
    findAll(paymentId, status) {
        const filters = {};
        if (paymentId)
            filters.paymentId = paymentId;
        if (status)
            filters.status = status;
        return this.refundsService.findAll(filters);
    }
    getPending() {
        return this.refundsService.getPendingRefunds();
    }
    getApproved() {
        return this.refundsService.getApprovedRefunds();
    }
    getStatistics(startDate, endDate) {
        const filters = {};
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        return this.refundsService.getRefundStats(filters);
    }
    findOne(id) {
        return this.refundsService.findOne(id);
    }
    approve(id, approveDto, req) {
        return this.refundsService.approve(id, req.user.userId, approveDto);
    }
    reject(id, body, req) {
        return this.refundsService.reject(id, req.user.userId, body.reason);
    }
    process(id, processDto, req) {
        return this.refundsService.process(id, req.user.userId, processDto);
    }
};
exports.RefundsController = RefundsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_refund_dto_1.CreateRefundDto, Object]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('paymentId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "getApproved", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_refund_dto_1.ApproveRefundDto, Object]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/process'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_refund_dto_1.ProcessRefundDto, Object]),
    __metadata("design:returntype", void 0)
], RefundsController.prototype, "process", null);
exports.RefundsController = RefundsController = __decorate([
    (0, common_1.Controller)('refunds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [refunds_service_1.RefundsService])
], RefundsController);
//# sourceMappingURL=refunds.controller.js.map