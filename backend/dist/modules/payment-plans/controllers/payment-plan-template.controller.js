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
exports.PaymentPlanTemplateController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const payment_plan_template_service_1 = require("../services/payment-plan-template.service");
const create_payment_plan_template_dto_1 = require("../dto/create-payment-plan-template.dto");
const update_payment_plan_template_dto_1 = require("../dto/update-payment-plan-template.dto");
let PaymentPlanTemplateController = class PaymentPlanTemplateController {
    constructor(templateService) {
        this.templateService = templateService;
    }
    async create(createDto, req) {
        return await this.templateService.create(createDto, req.user.id);
    }
    async findAll(activeOnly) {
        const isActiveOnly = activeOnly === 'true';
        return await this.templateService.findAll(isActiveOnly);
    }
    async findDefault() {
        return await this.templateService.findDefault();
    }
    async findOne(id) {
        return await this.templateService.findOne(id);
    }
    async update(id, updateDto, req) {
        return await this.templateService.update(id, updateDto, req.user.id);
    }
    async remove(id, req) {
        await this.templateService.remove(id, req.user.id);
        return { message: 'Payment plan template deleted successfully' };
    }
};
exports.PaymentPlanTemplateController = PaymentPlanTemplateController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_plan_template_dto_1.CreatePaymentPlanTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentPlanTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentPlanTemplateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('default'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentPlanTemplateController.prototype, "findDefault", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentPlanTemplateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_plan_template_dto_1.UpdatePaymentPlanTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentPlanTemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentPlanTemplateController.prototype, "remove", null);
exports.PaymentPlanTemplateController = PaymentPlanTemplateController = __decorate([
    (0, common_1.Controller)('payment-plan-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payment_plan_template_service_1.PaymentPlanTemplateService])
], PaymentPlanTemplateController);
//# sourceMappingURL=payment-plan-template.controller.js.map