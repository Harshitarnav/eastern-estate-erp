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
exports.RABillsController = void 0;
const common_1 = require("@nestjs/common");
const ra_bills_service_1 = require("./ra-bills.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let RABillsController = class RABillsController {
    constructor(raBillsService) {
        this.raBillsService = raBillsService;
    }
    create(createDto, req) {
        return this.raBillsService.create(createDto, req.user?.id);
    }
    findAll(constructionProjectId, vendorId, status, propertyId) {
        return this.raBillsService.findAll({ constructionProjectId, vendorId, status, propertyId });
    }
    getSummary(projectId) {
        return this.raBillsService.getSummaryByProject(projectId);
    }
    findOne(id) {
        return this.raBillsService.findOne(id);
    }
    update(id, updateDto) {
        return this.raBillsService.update(id, updateDto);
    }
    submit(id) {
        return this.raBillsService.submit(id);
    }
    certify(id, req) {
        return this.raBillsService.certify(id, req.user?.id);
    }
    approve(id, req) {
        return this.raBillsService.approve(id, req.user?.id);
    }
    markPaid(id, body, req) {
        return this.raBillsService.markPaid(id, body.paymentReference, req.user?.id);
    }
    reject(id, body) {
        return this.raBillsService.reject(id, body.notes);
    }
    remove(id) {
        return this.raBillsService.remove(id);
    }
};
exports.RABillsController = RABillsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('constructionProjectId')),
    __param(1, (0, common_1.Query)('vendorId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/certify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "certify", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/mark-paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "reject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RABillsController.prototype, "remove", null);
exports.RABillsController = RABillsController = __decorate([
    (0, common_1.Controller)('ra-bills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ra_bills_service_1.RABillsService])
], RABillsController);
//# sourceMappingURL=ra-bills.controller.js.map