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
exports.VendorPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const vendor_payments_service_1 = require("./vendor-payments.service");
const create_vendor_payment_dto_1 = require("./dto/create-vendor-payment.dto");
const update_vendor_payment_dto_1 = require("./dto/update-vendor-payment.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let VendorPaymentsController = class VendorPaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    create(createDto) {
        return this.paymentsService.create(createDto);
    }
    findAll(vendorId, poId) {
        const filters = {};
        if (vendorId)
            filters.vendorId = vendorId;
        if (poId)
            filters.poId = poId;
        return this.paymentsService.findAll(filters);
    }
    getTotalPaid(vendorId) {
        return this.paymentsService.getTotalPaidToVendor(vendorId);
    }
    findOne(id) {
        return this.paymentsService.findOne(id);
    }
    update(id, updateDto) {
        return this.paymentsService.update(id, updateDto);
    }
    remove(id) {
        return this.paymentsService.remove(id);
    }
};
exports.VendorPaymentsController = VendorPaymentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_payment_dto_1.CreateVendorPaymentDto]),
    __metadata("design:returntype", void 0)
], VendorPaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('vendorId')),
    __param(1, (0, common_1.Query)('poId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VendorPaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('vendor/:vendorId/total'),
    __param(0, (0, common_1.Param)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorPaymentsController.prototype, "getTotalPaid", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorPaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_payment_dto_1.UpdateVendorPaymentDto]),
    __metadata("design:returntype", void 0)
], VendorPaymentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorPaymentsController.prototype, "remove", null);
exports.VendorPaymentsController = VendorPaymentsController = __decorate([
    (0, common_1.Controller)('vendor-payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vendor_payments_service_1.VendorPaymentsService])
], VendorPaymentsController);
//# sourceMappingURL=vendor-payments.controller.js.map