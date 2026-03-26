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
exports.QCController = void 0;
const common_1 = require("@nestjs/common");
const qc_service_1 = require("./qc.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let QCController = class QCController {
    constructor(qcService) {
        this.qcService = qcService;
    }
    getTemplate(phase) {
        return this.qcService.getTemplate(phase);
    }
    getProjectSummary(projectId) {
        return this.qcService.getProjectSummary(projectId);
    }
    findAll(constructionProjectId, phase, result) {
        return this.qcService.findAll({ constructionProjectId, phase, result });
    }
    create(createDto, req) {
        return this.qcService.create(createDto, req.user?.id);
    }
    findOne(id) {
        return this.qcService.findOne(id);
    }
    update(id, updateDto) {
        return this.qcService.update(id, updateDto);
    }
    addDefect(id, defect) {
        return this.qcService.addDefect(id, defect);
    }
    updateDefect(id, defectId, updateData) {
        return this.qcService.updateDefect(id, defectId, updateData);
    }
    remove(id) {
        return this.qcService.remove(id);
    }
};
exports.QCController = QCController;
__decorate([
    (0, common_1.Get)('template/:phase'),
    __param(0, (0, common_1.Param)('phase')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Get)('summary/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "getProjectSummary", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('constructionProjectId')),
    __param(1, (0, common_1.Query)('phase')),
    __param(2, (0, common_1.Query)('result')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/defects'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "addDefect", null);
__decorate([
    (0, common_1.Patch)(':id/defects/:defectId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('defectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "updateDefect", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QCController.prototype, "remove", null);
exports.QCController = QCController = __decorate([
    (0, common_1.Controller)('qc-checklists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [qc_service_1.QCService])
], QCController);
//# sourceMappingURL=qc.controller.js.map