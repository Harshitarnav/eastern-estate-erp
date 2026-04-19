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
exports.LegacyImportController = void 0;
const common_1 = require("@nestjs/common");
const legacy_import_service_1 = require("../services/legacy-import.service");
const overdue_scanner_service_1 = require("../services/overdue-scanner.service");
const roles_decorator_1 = require("../../../auth/decorators/roles.decorator");
let LegacyImportController = class LegacyImportController {
    constructor(importService, overdueScanner) {
        this.importService = importService;
        this.overdueScanner = overdueScanner;
    }
    async preview(payload) {
        return this.importService.preview(payload);
    }
    async commit(payload, req) {
        const actorId = req.user?.id ?? null;
        return this.importService.commit(payload, actorId);
    }
    async manualScan() {
        return this.overdueScanner.runScan();
    }
};
exports.LegacyImportController = LegacyImportController;
__decorate([
    (0, common_1.Post)('preview'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LegacyImportController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('commit'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LegacyImportController.prototype, "commit", null);
__decorate([
    (0, common_1.Post)('scan-overdues'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LegacyImportController.prototype, "manualScan", null);
exports.LegacyImportController = LegacyImportController = __decorate([
    (0, common_1.Controller)('legacy-import'),
    __metadata("design:paramtypes", [legacy_import_service_1.LegacyImportService,
        overdue_scanner_service_1.OverdueScannerService])
], LegacyImportController);
//# sourceMappingURL=legacy-import.controller.js.map