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
exports.InstallmentsController = void 0;
const common_1 = require("@nestjs/common");
const installments_service_1 = require("./installments.service");
const create_installment_dto_1 = require("./dto/create-installment.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const payment_installment_entity_1 = require("./entities/payment-installment.entity");
let InstallmentsController = class InstallmentsController {
    constructor(installmentsService) {
        this.installmentsService = installmentsService;
    }
    create(createInstallmentDto) {
        return this.installmentsService.create(createInstallmentDto);
    }
    createSchedule(scheduleDto) {
        return this.installmentsService.createSchedule(scheduleDto);
    }
    findAll(bookingId, status, overdue) {
        const filters = {};
        if (bookingId)
            filters.bookingId = bookingId;
        if (status)
            filters.status = status;
        if (overdue === 'true')
            filters.overdue = true;
        return this.installmentsService.findAll(filters);
    }
    getOverdue() {
        return this.installmentsService.getOverdue();
    }
    getUpcoming(days) {
        const daysAhead = days ? parseInt(days) : 7;
        return this.installmentsService.getUpcoming(daysAhead);
    }
    findByBooking(bookingId) {
        return this.installmentsService.findByBooking(bookingId);
    }
    getBookingStats(bookingId) {
        return this.installmentsService.getBookingStats(bookingId);
    }
    findOne(id) {
        return this.installmentsService.findOne(id);
    }
    update(id, updateData) {
        return this.installmentsService.update(id, updateData);
    }
    markAsPaid(id, body) {
        return this.installmentsService.markAsPaid(id, body.paymentId, body.paidAmount);
    }
    waive(id) {
        return this.installmentsService.waive(id);
    }
    updateLateFees(body) {
        const lateFeePerDay = body.lateFeePerDay || 50;
        return this.installmentsService.updateLateFees(lateFeePerDay);
    }
    remove(id) {
        return this.installmentsService.remove(id);
    }
};
exports.InstallmentsController = InstallmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_installment_dto_1.CreateInstallmentDto]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_installment_dto_1.CreateInstallmentScheduleDto]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('bookingId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('overdue')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findByBooking", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId/stats'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "getBookingStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Post)(':id/waive'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "waive", null);
__decorate([
    (0, common_1.Post)('update-late-fees'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "updateLateFees", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstallmentsController.prototype, "remove", null);
exports.InstallmentsController = InstallmentsController = __decorate([
    (0, common_1.Controller)('installments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [installments_service_1.InstallmentsService])
], InstallmentsController);
//# sourceMappingURL=installments.controller.js.map