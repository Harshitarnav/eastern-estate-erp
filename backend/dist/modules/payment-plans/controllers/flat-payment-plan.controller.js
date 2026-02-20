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
exports.FlatPaymentPlanController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const flat_payment_plan_service_1 = require("../services/flat-payment-plan.service");
const create_flat_payment_plan_dto_1 = require("../dto/create-flat-payment-plan.dto");
let FlatPaymentPlanController = class FlatPaymentPlanController {
    constructor(flatPaymentPlanService) {
        this.flatPaymentPlanService = flatPaymentPlanService;
    }
    async create(createDto, req) {
        return await this.flatPaymentPlanService.create(createDto, req.user.id);
    }
    async findAll() {
        return await this.flatPaymentPlanService.findAll();
    }
    async findByFlatId(flatId) {
        return await this.flatPaymentPlanService.findByFlatId(flatId);
    }
    async findByBookingId(bookingId) {
        return await this.flatPaymentPlanService.findByBookingId(bookingId);
    }
    async findOne(id) {
        return await this.flatPaymentPlanService.findOne(id);
    }
    async updateMilestone(id, sequence, updates, req) {
        return await this.flatPaymentPlanService.updateMilestone(id, parseInt(sequence), updates, req.user.id);
    }
    async cancel(id, req) {
        return await this.flatPaymentPlanService.cancel(id, req.user.id);
    }
};
exports.FlatPaymentPlanController = FlatPaymentPlanController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flat_payment_plan_dto_1.CreateFlatPaymentPlanDto, Object]),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('flat/:flatId'),
    __param(0, (0, common_1.Param)('flatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "findByFlatId", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "findByBookingId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/milestones/:sequence'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('sequence')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "updateMilestone", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlatPaymentPlanController.prototype, "cancel", null);
exports.FlatPaymentPlanController = FlatPaymentPlanController = __decorate([
    (0, common_1.Controller)('flat-payment-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [flat_payment_plan_service_1.FlatPaymentPlanService])
], FlatPaymentPlanController);
//# sourceMappingURL=flat-payment-plan.controller.js.map